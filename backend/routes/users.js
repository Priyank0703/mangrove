const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Report = require('../models/Report');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard of top contributors
// @access  Private
router.get('/leaderboard', [
    authenticateToken,
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
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

        const limit = parseInt(req.query.limit) || 20;

        const leaderboard = await User.find({ isActive: true })
            .select('username firstName lastName points reportsSubmitted reportsValidated role organization')
            .sort({ points: -1, reportsSubmitted: -1 })
            .limit(limit);

        res.json({
            leaderboard,
            totalUsers: leaderboard.length
        });

    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/profile/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate({
                path: 'reports',
                select: 'title category status createdAt',
                options: { limit: 5, sort: { createdAt: -1 } }
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(404).json({ message: 'User account is deactivated' });
        }

        res.json({ user });

    } catch (error) {
        console.error('User profile fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

// @route   GET /api/users/search
// @desc    Search users by name, username, or organization
// @access  Private (NGO/Government/Researchers)
router.get('/search', [
    authenticateToken,
    requireRole(['ngo', 'government', 'researcher']),
    query('q')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search query must be at least 2 characters'),
    query('role')
        .optional()
        .isIn(['community', 'ngo', 'government', 'researcher'])
        .withMessage('Invalid role filter'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
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

        const { q, role, limit = 20 } = req.query;

        // Build search query
        const searchQuery = {
            isActive: true,
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } },
                { organization: { $regex: q, $options: 'i' } }
            ]
        };

        if (role) {
            searchQuery.role = role;
        }

        const users = await User.find(searchQuery)
            .select('username firstName lastName role organization points reportsSubmitted reportsValidated')
            .sort({ points: -1 })
            .limit(parseInt(limit));

        res.json({
            users,
            totalResults: users.length,
            query: q
        });

    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ message: 'Failed to search users' });
    }
});

// @route   GET /api/users/stats
// @desc    Get user statistics and analytics
// @access  Private (NGO/Government/Researchers)
router.get('/stats', [
    authenticateToken,
    requireRole(['ngo', 'government', 'researcher'])
], async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            roleDistribution,
            topContributors,
            recentRegistrations
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$role', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            User.find({ isActive: true })
                .select('username firstName lastName points reportsSubmitted role')
                .sort({ points: -1 })
                .limit(10),
            User.find({ isActive: true })
                .select('username firstName lastName role createdAt')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        res.json({
            summary: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers
            },
            roleDistribution,
            topContributors,
            recentRegistrations
        });

    } catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
});

// @route   PUT /api/users/:id/status
// @desc    Update user account status (activate/deactivate)
// @access  Private (NGO/Government only)
router.put('/:id/status', [
    authenticateToken,
    requireRole(['ngo', 'government']),
    query('status')
        .isIn(['active', 'inactive'])
        .withMessage('Status must be either active or inactive')
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

        const { status } = req.query;
        const userId = req.params.id;

        // Prevent deactivating own account
        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                message: 'Cannot deactivate your own account'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deactivating other admin accounts
        if (['ngo', 'government'].includes(user.role) && req.user.role !== 'government') {
            return res.status(403).json({
                message: 'Only government users can deactivate NGO accounts'
            });
        }

        user.isActive = status === 'active';
        await user.save();

        res.json({
            message: `User account ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
            user: {
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('User status update error:', error);
        res.status(500).json({ message: 'Failed to update user status' });
    }
});

// @route   GET /api/users/me/reports
// @desc    Get current user's reports
// @access  Private
router.get('/me/reports', [
    authenticateToken,
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    query('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected', 'under_investigation'])
        .withMessage('Invalid status')
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

        const { page = 1, limit = 20, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter
        const filter = { reporter: req.user._id };
        if (status) filter.status = status;

        const [reports, total] = await Promise.all([
            Report.find(filter)
                .select('title category status createdAt severity location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Report.countDocuments(filter)
        ]);

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
        console.error('User reports fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch user reports' });
    }
});

// @route   GET /api/users/me/achievements
// @desc    Get current user's achievements and stats
// @access  Private
router.get('/me/achievements', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('points reportsSubmitted reportsValidated role createdAt');

        // Calculate achievements
        const achievements = [];

        if (user.points >= 100) achievements.push({ name: 'First Steps', description: 'Earned 100 points', icon: '🌱' });
        if (user.points >= 500) achievements.push({ name: 'Growing Strong', description: 'Earned 500 points', icon: '🌿' });
        if (user.points >= 1000) achievements.push({ name: 'Mangrove Guardian', description: 'Earned 1000 points', icon: '🌳' });
        if (user.points >= 2500) achievements.push({ name: 'Conservation Hero', description: 'Earned 2500 points', icon: '🏆' });

        if (user.reportsSubmitted >= 5) achievements.push({ name: 'Active Reporter', description: 'Submitted 5 reports', icon: '📝' });
        if (user.reportsSubmitted >= 20) achievements.push({ name: 'Dedicated Monitor', description: 'Submitted 20 reports', icon: '📊' });
        if (user.reportsSubmitted >= 50) achievements.push({ name: 'Mangrove Expert', description: 'Submitted 50 reports', icon: '🎯' });

        if (user.reportsValidated >= 10) achievements.push({ name: 'Quality Contributor', description: 'Had 10 reports validated', icon: '✅' });
        if (user.reportsValidated >= 25) achievements.push({ name: 'Trusted Source', description: 'Had 25 reports validated', icon: '⭐' });

        // Calculate rank
        const userRank = await User.countDocuments({
            points: { $gt: user.points },
            isActive: true
        }) + 1;

        res.json({
            user: {
                points: user.points,
                reportsSubmitted: user.reportsSubmitted,
                reportsValidated: user.reportsValidated,
                role: user.role,
                memberSince: user.createdAt
            },
            achievements,
            rank: userRank,
            nextMilestone: getNextMilestone(user.points)
        });

    } catch (error) {
        console.error('User achievements error:', error);
        res.status(500).json({ message: 'Failed to fetch user achievements' });
    }
});

// Helper function to get next milestone
const getNextMilestone = (currentPoints) => {
    const milestones = [100, 500, 1000, 2500, 5000, 10000];
    const next = milestones.find(milestone => milestone > currentPoints);
    return next ? { points: next, remaining: next - currentPoints } : null;
};

module.exports = router;
