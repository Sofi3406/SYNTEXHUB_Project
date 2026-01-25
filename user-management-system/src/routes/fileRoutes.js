const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// Debug route to test upload
router.post('/files/test-upload', uploadMultiple('files', 5), (req, res) => {
    console.log('Test upload - Files received:', req.files ? req.files.length : 0);
    console.log('Body fields:', req.body);
    
    if (req.files && req.files.length > 0) {
        res.status(200).json({
            success: true,
            message: `Received ${req.files.length} files`,
            files: req.files.map(f => ({
                name: f.originalname,
                size: f.size,
                mimetype: f.mimetype
            })),
            body: req.body
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'No files received',
            receivedFields: Object.keys(req.body)
        });
    }
});

// Public routes
router.get('/files', fileController.getAllFiles);
router.get('/files/stats', fileController.getFileStats);
router.get('/files/metadata/:filename', fileController.getFileMetadata);
router.get('/files/download/:filename', fileController.downloadFile);
router.get('/files/view/:filename', fileController.viewFile);

// Protected routes (require authentication)
router.use(authMiddleware);

router.post('/files/upload', 
    uploadSingle('file'),
    fileController.uploadFile
);

router.post('/files/upload-multiple',
    uploadMultiple('files', 5),
    fileController.uploadMultipleFiles
);

router.delete('/files/:filename', fileController.deleteFile);

module.exports = router;