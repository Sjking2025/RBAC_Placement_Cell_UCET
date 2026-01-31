const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        // Determine upload path based on field name
        if (file.fieldname === 'resume') {
            uploadPath = 'uploads/resumes/';
        } else if (file.fieldname === 'profilePicture') {
            uploadPath = 'uploads/profiles/';
        } else if (file.fieldname === 'logo') {
            uploadPath = 'uploads/logos/';
        } else if (file.fieldname === 'attachment') {
            uploadPath = 'uploads/attachments/';
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(',');
    const ext = path.extname(file.originalname).toLowerCase().slice(1);

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type .${ext} is not allowed`), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
    }
});

// Export upload middleware
module.exports = {
    // Single file upload
    uploadResume: upload.single('resume'),
    uploadProfilePicture: upload.single('profilePicture'),
    uploadLogo: upload.single('logo'),
    uploadAttachment: upload.single('attachment'),

    // Multiple files
    uploadMultiple: upload.array('files', 5),

    // Generic single upload
    uploadSingle: (fieldName) => upload.single(fieldName)
};
