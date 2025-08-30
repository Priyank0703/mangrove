const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');
const { authenticateToken, requireRole, canEditResource } = require('../middleware/auth');
const { upload, handleUploadError, deleteFile, getFileUrl } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/reports
// @desc    Submit a new incident report
// @access  Private (Community members and above)
router.post('/', [
  authenticateToken,
  upload.array('photos', 5),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('category')
    .isIn(['cutting', 'dumping', 'reclamation', 'pollution', 'other'])
    .withMessage('Invalid category selected'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('location.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('location.address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name too long'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('estimatedArea.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area value must be positive'),
  body('estimatedArea.unit')
    .optional()
    .isIn(['sq_meters', 'sq_kilometers', 'acres', 'hectares'])
    .withMessage('Invalid area unit')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      severity = 'medium',
      location,
      tags = [],
      estimatedArea,
      impactAssessment
    } = req.body;

    // Process uploaded photos
    const photos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path
    })) : [];

    // Create new report
    const report = new Report({
      title,
      description,
      category,
      severity,
      location,
      photos,
      tags,
      estimatedArea,
      impactAssessment,
      reporter: req.user._id
    });

    await report.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { reportsSubmitted: 1, points: 10 }
    });

    // Populate reporter info
    await report.populate('reporter', 'firstName lastName username');

    res.status(201).json({
      message: 'Report submitted successfully',
      report,
      pointsEarned: 10
    });

  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

// @route   GET /api/reports
// @desc    Get reports with filtering and pagination
// @access  Private
router.get('/', [
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'under_investigation'])
    .withMessage('Invalid status'),
  query('category')
    .optional()
    .isIn(['cutting', 'dumping', 'reclamation', 'pollution', 'other'])
    .withMessage('Invalid category'),
  query('reporter')
    .optional()
    .isMongoId()
    .withMessage('Invalid reporter ID'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      category,
      reporter,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'community') {
      // Community members can only see their own reports and public approved reports
      filter.$or = [
        { reporter: req.user._id },
        { status: 'approved', isPublic: true }
      ];
    } else if (req.user.role === 'researcher') {
      // Researchers can see all approved reports
      filter.status = 'approved';
    }
    // NGO and Government users can see all reports

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (reporter) filter.reporter = reporter;

    // Add search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchFilter = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'location.address.city': searchRegex }
        ]
      };

      // Combine with existing role-based filter
      if (filter.$or) {
        // If there's already a role-based $or filter, we need to combine them
        const roleFilter = { $or: filter.$or };
        delete filter.$or;
        filter.$and = [roleFilter, searchFilter];
      } else {
        // No existing $or filter, just use search
        Object.assign(filter, searchFilter);
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(filter)
      .populate('reporter', 'firstName lastName username')
      .populate('validator', 'firstName lastName username')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReports: total,
        hasNext: skip + reports.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// @route   GET /api/reports/:id
// @desc    Get a specific report by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'firstName lastName username organization')
      .populate('validator', 'firstName lastName username organization');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check access permissions
    if (req.user.role === 'community' && report.reporter.toString() !== req.user._id.toString()) {
      if (report.status !== 'approved' || !report.isPublic) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ report });

  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch report' });
  }
});

// @route   PUT /api/reports/:id
// @desc    Update a report
// @access  Private (Owner or Admin)
router.put('/:id', [
  authenticateToken,
  canEditResource('reporter'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('category')
    .optional()
    .isIn(['cutting', 'dumping', 'reclamation', 'pollution', 'other'])
    .withMessage('Invalid category selected'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only allow updates if report is pending or if user is admin
    if (report.status !== 'pending' && !['ngo', 'government'].includes(req.user.role)) {
      return res.status(400).json({
        message: 'Can only update pending reports'
      });
    }

    const updateData = {};
    const allowedFields = ['title', 'description', 'category', 'severity', 'tags', 'estimatedArea', 'impactAssessment'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('reporter', 'firstName lastName username');

    res.json({
      message: 'Report updated successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Report update error:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
});

// @route   POST /api/reports/:id/validate
// @desc    Approve or reject a report (NGO/Government only)
// @access  Private (NGO/Government)
router.post('/:id/validate', [
  authenticateToken,
  requireRole(['ngo', 'government']),
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes too long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action, notes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({
        message: 'Can only validate pending reports'
      });
    }

    // Perform validation action
    if (action === 'approve') {
      await report.approve(req.user._id, notes);

      // Award points to reporter
      await User.findByIdAndUpdate(report.reporter, {
        $inc: { reportsValidated: 1, points: 50 }
      });
    } else {
      await report.reject(req.user._id, notes);
    }

    // Populate updated report
    await report.populate('reporter', 'firstName lastName username');
    await report.populate('validator', 'firstName lastName username');

    res.json({
      message: `Report ${action}d successfully`,
      report
    });

  } catch (error) {
    console.error('Report validation error:', error);
    res.status(500).json({ message: 'Failed to validate report' });
  }
});

// @route   PUT /api/reports/:id/validate
// @desc    Update report status (NGO/Government only)
// @access  Private (NGO/Government)
router.put('/:id/validate', [
  authenticateToken,
  requireRole(['ngo', 'government']),
  body('status')
    .isIn(['approved', 'rejected', 'under_investigation'])
    .withMessage('Invalid status'),
  body('validationNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes too long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, validationNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status === 'approved' || report.status === 'rejected') {
      return res.status(400).json({
        message: 'Report has already been validated'
      });
    }

    // Update report status
    if (status === 'approved') {
      await report.approve(req.user._id, validationNotes);

      // Award points to reporter
      await User.findByIdAndUpdate(report.reporter, {
        $inc: { reportsValidated: 1, points: 50 }
      });
    } else if (status === 'rejected') {
      await report.reject(req.user._id, validationNotes);
    } else {
      // under_investigation
      report.status = status;
      report.validator = req.user._id;
      report.validationNotes = validationNotes;
      report.validatedAt = new Date();
      await report.save();
    }

    // Populate updated report
    await report.populate('reporter', 'firstName lastName username');
    await report.populate('validator', 'firstName lastName username');

    res.json({
      message: `Report status updated to ${status}`,
      report
    });

  } catch (error) {
    console.error('Report status update error:', error);
    res.status(500).json({ message: 'Failed to update report status' });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a report
// @access  Private (Owner or Admin)
router.delete('/:id', [authenticateToken, canEditResource('reporter')], async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Delete associated photos
    if (report.photos && report.photos.length > 0) {
      report.photos.forEach(photo => {
        deleteFile(photo.filename);
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { reportsSubmitted: -1, points: -10 }
    });

    res.json({ message: 'Report deleted successfully' });

  } catch (error) {
    console.error('Report deletion error:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

// @route   GET /api/reports/stats/summary
// @desc    Get summary statistics for dashboard
// @access  Private (All authenticated users)
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'community') {
      filter.reporter = req.user._id;
    }

    const [
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      categoryStats,
      monthlyStats
    ] = await Promise.all([
      Report.countDocuments(filter),
      Report.countDocuments({ ...filter, status: 'pending' }),
      Report.countDocuments({ ...filter, status: 'approved' }),
      Report.countDocuments({ ...filter, status: 'rejected' }),
      Report.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      summary: {
        total: totalReports,
        pending: pendingReports,
        approved: approvedReports,
        rejected: rejectedReports
      },
      categoryStats,
      monthlyStats
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// @route   GET /api/reports/stats
// @desc    Get comprehensive statistics for admin panel
// @access  Private (NGO, Government, Researchers)
router.get('/stats', [authenticateToken, requireRole(['ngo', 'government', 'researcher'])], async (req, res) => {
  try {
    const [
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      underInvestigationReports,
      categoryStats,
      statusStats
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'approved' }),
      Report.countDocuments({ status: 'rejected' }),
      Report.countDocuments({ status: 'under_investigation' }),
      Report.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Format category stats for charts
    const formattedCategoryStats = categoryStats.map(stat => ({
      category: stat._id,
      count: stat.count
    }));

    // Format status stats for charts
    const formattedStatusStats = statusStats.map(stat => ({
      name: stat._id.replace('_', ' '),
      count: stat.count
    }));

    res.json({
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      underInvestigationReports,
      categoryStats: formattedCategoryStats,
      statusStats: formattedStatusStats
    });

  } catch (error) {
    console.error('Admin stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch admin statistics' });
  }
});

// AI/ML Stub for report validation
// This is a placeholder that can be replaced with real AI/ML functionality later
const analyzeReportWithAI = async (reportData) => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock AI validation logic
  const mockValidation = {
    confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
    riskScore: Math.random() * 0.8 + 0.2, // 20-100% risk
    suggestedSeverity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    aiNotes: [
      'Image analysis suggests environmental damage',
      'Location coordinates indicate sensitive mangrove area',
      'Description matches known incident patterns',
      'Photo quality is sufficient for analysis'
    ][Math.floor(Math.random() * 4)],
    recommendedAction: ['approve', 'investigate', 'reject'][Math.floor(Math.random() * 3)]
  };

  return mockValidation;
};

// @route   POST /api/reports/:id/ai-analysis
// @desc    Get AI analysis for a report (stub implementation)
// @access  Private (NGO, Government)
router.post('/:id/ai-analysis', [authenticateToken, requireRole(['ngo', 'government'])], async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('reporter', 'username firstName lastName');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Get AI analysis
    const aiAnalysis = await analyzeReportWithAI(report);

    res.json({
      message: 'AI analysis completed',
      reportId: report._id,
      aiAnalysis,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ message: 'Failed to perform AI analysis' });
  }
});

// Error handling for file uploads
router.use(handleUploadError);

module.exports = router;
