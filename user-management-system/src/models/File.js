const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        trim: true
    },
    originalname: {
        type: String,
        required: true,
        trim: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true,
        min: [1, 'File size must be at least 1 byte']
    },
    sizeFormatted: {
        type: String,
        required: true
    },
    extension: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
fileSchema.index({ filename: 1 });
fileSchema.index({ uploader: 1 });
fileSchema.index({ uploadedAt: -1 });
fileSchema.index({ mimetype: 1 });
fileSchema.index({ extension: 1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ isPublic: 1 });

// Virtual for download URL
fileSchema.virtual('downloadUrl').get(function() {
    return `/api/files/download/${this.filename}`;
});

// Virtual for view URL
fileSchema.virtual('viewUrl').get(function() {
    return `/api/files/view/${this.filename}`;
});

// Increment download count method
fileSchema.methods.incrementDownloadCount = async function() {
    this.downloadCount += 1;
    await this.save();
};

const File = mongoose.model('File', fileSchema);

module.exports = File;