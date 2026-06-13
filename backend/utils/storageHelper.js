import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standardized role mapping to folder names
const ROLE_FOLDER_MAP = {
    'Admin': 'admins',
    'Patient': 'patients',
    'Doctor': 'doctors',
    'Driver': 'drivers',
    'Medicine Store': 'pharmacies',
    'Physiotherapy': 'physiotherapists',
    'Old Age Home': 'old_age_homes',
    'Lab Test': 'lab_tests'
};

/**
 * Generates a storage engine that dynamically routes files to role-based subfolders.
 * Expects req.user to be populated by authMiddleware.
 */
const createStorage = (folderOverride = null) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const roleName = req.user?.role || 'Guest';
            const folder = folderOverride || ROLE_FOLDER_MAP[roleName] || 'quick_bookings';
            const uploadPath = path.join(__dirname, '../uploads', folder);

            // Double check existence
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const customId = req.user?.customId || 'GUEST';
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            const originalName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            
            // Format: [CUSTOM_ID]-[ORIGINAL_NAME]-[TIMESTAMP][EXT]
            cb(null, `${customId}-${originalName}-${uniqueSuffix}${ext}`);
        }
    });
};

/**
 * Middleware that attaches the relative path (role_folder/filename) to req.file
 * so it can be saved in the database correctly.
 */
export const attachRelativePath = (req, res, next) => {
    const folderOverride = req.uploadFolder; // Check if a folder was pre-specified
    if (req.file) {
        const roleName = req.user?.role || 'Guest';
        const folder = folderOverride || ROLE_FOLDER_MAP[roleName] || 'quick_bookings';
        req.file.relative_path = `${folder}/${req.file.filename}`;
    }
    // Handle multiple files if needed
    if (req.files) {
        const roleName = req.user?.role || 'Guest';
        const folder = folderOverride || ROLE_FOLDER_MAP[roleName] || 'quick_bookings';
        Object.keys(req.files).forEach(key => {
            req.files[key].forEach(file => {
                file.relative_path = `${folder}/${file.filename}`;
            });
        });
    }
    next();
};

const defaultFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 
        'image/jpg',
        'image/png', 
        'image/gif',
        'image/webp', 
        'image/heic',
        'image/heif',
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP, GIF, HEIC, PDF, and DOC/DOCX files are allowed.'), false);
    }
};

export const getUploadMiddleware = (options = {}) => {
    const storage = createStorage(options.folder);
    return multer({
        storage,
        limits: { fileSize: options.limit || 10 * 1024 * 1024 }, // Default 10MB
        fileFilter: options.fileFilter || defaultFileFilter
    });
};
