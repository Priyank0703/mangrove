const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files per upload
    }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Too many files. Maximum is 5 files.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Unexpected field name in file upload.'
            });
        }
    }

    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            message: 'Only image files (JPEG, PNG, GIF) are allowed.'
        });
    }

    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
};

// Helper function to delete uploaded files
const deleteFile = (filename) => {
    const filepath = path.join(uploadsDir, filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
    }
    return false;
};

// Helper function to get file URL
const getFileUrl = (filename) => {
    if (!filename) return null;
    return `/uploads/${filename}`;
};

module.exports = {
    upload,
    handleUploadError,
    deleteFile,
    getFileUrl
};
