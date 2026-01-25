const mongoose = require('mongoose');
const crypto = require('crypto');
const GridFSBucket = require('mongodb').GridFSBucket;

let gfs;

// Initialize GridFS
const initGridFS = () => {
    gfs = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
    });
    return gfs;
};

// Get GridFS instance
const getGridFS = () => {
    if (!gfs) {
        initGridFS();
    }
    return gfs;
};

// Generate unique filename
const generateUniqueFilename = (originalname) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = originalname.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
};

// Get file extension
const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
};

// Get MIME type from extension
const getMimeType = (extension) => {
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'zip': 'application/zip',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo'
    };
    return mimeTypes[extension] || 'application/octet-stream';
};

// Validate file type
const isValidFileType = (extension) => {
    const allowedTypes = [
        'jpg', 'jpeg', 'png', 'gif', 'pdf',
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'txt', 'zip', 'mp3', 'mp4', 'mov', 'avi'
    ];
    return allowedTypes.includes(extension.toLowerCase());
};

// Get file size in human readable format
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
    initGridFS,
    getGridFS,
    generateUniqueFilename,
    getFileExtension,
    getMimeType,
    isValidFileType,
    formatFileSize
};