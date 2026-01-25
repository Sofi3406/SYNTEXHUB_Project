const mongoose = require('mongoose');
const File = require('../models/File');
const { 
    getGridFS, 
    generateUniqueFilename, 
    getFileExtension, 
    getMimeType, 
    formatFileSize 
} = require('../utils/gridfs');

// Upload single file
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { originalname, mimetype, size, buffer } = req.file;
        const { description, tags, isPublic } = req.body;
        
        // Get uploader ID from authenticated user (or use default for testing)
        const uploader = req.user ? req.user._id : req.body.uploader || '6975c21dd1120478b65d9fd8';

        // Generate unique filename
        const filename = generateUniqueFilename(originalname);
        const extension = getFileExtension(originalname);

        // Get GridFS instance
        const gfs = getGridFS();

        // Create upload stream
        const uploadStream = gfs.openUploadStream(filename, {
            contentType: mimetype,
            metadata: {
                originalname,
                uploader,
                description,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                isPublic: isPublic !== 'false'
            }
        });

        // Write buffer to GridFS
        uploadStream.write(buffer);
        uploadStream.end();

        uploadStream.on('finish', async () => {
            try {
                // Create file metadata record
                const fileMetadata = new File({
                    filename,
                    originalname,
                    mimetype,
                    size,
                    sizeFormatted: formatFileSize(size),
                    extension,
                    path: `uploads/${filename}`,
                    uploader,
                    description,
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                    isPublic: isPublic !== 'false',
                    metadata: {
                        gridfsId: uploadStream.id.toString()
                    }
                });

                await fileMetadata.save();

                res.status(201).json({
                    success: true,
                    message: 'File uploaded successfully',
                    data: {
                        id: fileMetadata._id,
                        filename: fileMetadata.filename,
                        originalname: fileMetadata.originalname,
                        mimetype: fileMetadata.mimetype,
                        size: fileMetadata.sizeFormatted,
                        extension: fileMetadata.extension,
                        downloadUrl: `/api/files/download/${fileMetadata.filename}`,
                        viewUrl: `/api/files/view/${fileMetadata.filename}`,
                        uploadedAt: fileMetadata.uploadedAt
                    }
                });
            } catch (error) {
                // If metadata save fails, delete the GridFS file
                gfs.delete(uploadStream.id);
                throw error;
            }
        });

        uploadStream.on('error', (error) => {
            res.status(500).json({
                success: false,
                message: 'Error uploading file to GridFS',
                error: error.message
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
};

// Upload multiple files
exports.uploadMultipleFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const { description, tags, isPublic } = req.body;
        const uploader = req.user ? req.user._id : req.body.uploader || '6975c21dd1120478b65d9fd8';
        const gfs = getGridFS();

        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const { originalname, mimetype, size, buffer } = file;
                const filename = generateUniqueFilename(originalname);
                const extension = getFileExtension(originalname);

                const uploadStream = gfs.openUploadStream(filename, {
                    contentType: mimetype,
                    metadata: {
                        originalname,
                        uploader,
                        description,
                        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                        isPublic: isPublic !== 'false'
                    }
                });

                uploadStream.write(buffer);
                uploadStream.end();

                uploadStream.on('finish', async () => {
                    try {
                        const fileMetadata = new File({
                            filename,
                            originalname,
                            mimetype,
                            size,
                            sizeFormatted: formatFileSize(size),
                            extension,
                            path: `uploads/${filename}`,
                            uploader,
                            description,
                            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                            isPublic: isPublic !== 'false',
                            metadata: {
                                gridfsId: uploadStream.id.toString()
                            }
                        });

                        await fileMetadata.save();
                        
                        resolve({
                            success: true,
                            data: {
                                id: fileMetadata._id,
                                filename: fileMetadata.filename,
                                originalname: fileMetadata.originalname,
                                size: fileMetadata.sizeFormatted,
                                downloadUrl: `/api/files/download/${fileMetadata.filename}`,
                                viewUrl: `/api/files/view/${fileMetadata.filename}`
                            }
                        });
                    } catch (error) {
                        gfs.delete(uploadStream.id);
                        reject(error);
                    }
                });

                uploadStream.on('error', reject);
            });
        });

        const results = await Promise.allSettled(uploadPromises);

        const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value.data);
        const failed = results.filter(r => r.status === 'rejected').map(r => r.reason.message);

        res.status(201).json({
            success: true,
            message: `Uploaded ${successful.length} file(s) successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
            data: {
                successful,
                failed: failed.length > 0 ? failed : undefined
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error.message
        });
    }
};

// Get all files (with pagination)
exports.getAllFiles = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            mimetype,
            extension,
            uploader,
            sortBy = 'uploadedAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = { isPublic: true };

        if (search) {
            query.$or = [
                { filename: { $regex: search, $options: 'i' } },
                { originalname: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (mimetype) query.mimetype = mimetype;
        if (extension) query.extension = extension;
        if (uploader) query.uploader = uploader;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get files with pagination
        const files = await File.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('uploader', 'name email')
            .select('-metadata');

        // Get total count
        const total = await File.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            count: files.length,
            total,
            totalPages,
            currentPage: parseInt(page),
            data: files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching files',
            error: error.message
        });
    }
};

// Get single file metadata
exports.getFileMetadata = async (req, res) => {
    try {
        const file = await File.findOne({ filename: req.params.filename })
            .populate('uploader', 'name email');

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        res.status(200).json({
            success: true,
            data: file
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching file metadata',
            error: error.message
        });
    }
};

// Download file
exports.downloadFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const gfs = getGridFS();

        // Find file in GridFS
        const files = await gfs.find({ filename }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const file = files[0];
        
        // Update download count in metadata
        const fileMetadata = await File.findOne({ filename });
        if (fileMetadata) {
            await fileMetadata.incrementDownloadCount();
        }

        // Set appropriate headers
        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', `attachment; filename="${file.metadata?.originalname || filename}"`);
        res.set('Content-Length', file.length);

        // Create read stream and pipe to response
        const readStream = gfs.openDownloadStream(file._id);
        
        readStream.on('error', (error) => {
            res.status(500).json({
                success: false,
                message: 'Error downloading file',
                error: error.message
            });
        });

        readStream.pipe(res);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: error.message
        });
    }
};

// View file (inline)
exports.viewFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const gfs = getGridFS();

        const files = await gfs.find({ filename }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const file = files[0];
        
        // Only allow inline viewing for images and PDFs
        const canViewInline = file.contentType.startsWith('image/') || 
                             file.contentType === 'application/pdf' ||
                             file.contentType === 'text/plain';

        if (!canViewInline) {
            return res.status(400).json({
                success: false,
                message: 'This file type cannot be viewed inline. Please download it instead.'
            });
        }

        // Update download count
        const fileMetadata = await File.findOne({ filename });
        if (fileMetadata) {
            await fileMetadata.incrementDownloadCount();
        }

        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', `inline; filename="${file.metadata?.originalname || filename}"`);
        res.set('Content-Length', file.length);

        const readStream = gfs.openDownloadStream(file._id);
        
        readStream.on('error', (error) => {
            res.status(500).json({
                success: false,
                message: 'Error viewing file',
                error: error.message
            });
        });

        readStream.pipe(res);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error viewing file',
            error: error.message
        });
    }
};

// Delete file
exports.deleteFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const gfs = getGridFS();

        // Find file in GridFS
        const files = await gfs.find({ filename }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const file = files[0];

        // Delete from GridFS
        await gfs.delete(file._id);

        // Delete metadata
        await File.findOneAndDelete({ filename });

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
};

// Get file statistics
exports.getFileStats = async (req, res) => {
    try {
        const stats = await File.aggregate([
            {
                $group: {
                    _id: null,
                    totalFiles: { $sum: 1 },
                    totalSize: { $sum: '$size' },
                    averageSize: { $avg: '$size' },
                    totalDownloads: { $sum: '$downloadCount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalFiles: 1,
                    totalSize: 1,
                    totalSizeFormatted: { $concat: [ { $toString: { $divide: ['$totalSize', 1048576] } }, ' MB' ] },
                    averageSizeFormatted: { $concat: [ { $toString: { $divide: ['$averageSize', 1024] } }, ' KB' ] },
                    totalDownloads: 1
                }
            }
        ]);

        // Get files by type
        const filesByType = await File.aggregate([
            {
                $group: {
                    _id: '$mimetype',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$size' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $project: {
                    mimetype: '$_id',
                    count: 1,
                    totalSize: 1,
                    _id: 0
                }
            }
        ]);

        // Get popular files
        const popularFiles = await File.find()
            .sort({ downloadCount: -1 })
            .limit(5)
            .select('filename originalname mimetype size downloadCount uploadedAt');

        res.status(200).json({
            success: true,
            data: {
                overall: stats[0] || {},
                byType: filesByType,
                popularFiles
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching file statistics',
            error: error.message
        });
    }
};