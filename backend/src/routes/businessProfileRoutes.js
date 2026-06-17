const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const checkWriteAccess = require('../middleware/checkWriteAccess');

const {
    getProfile,
    updateProfile,
    uploadLogo,
    deleteLogo,
    addGalleryItem,
    uploadGalleryImage,
    removeGalleryItem,
    updateGalleryItem,
    getAllPublicStudios
} = require('../controllers/businessProfileController');

// ─── Multer Configuration for Logo ────────────────────────────
const logoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `logo-${req.business._id}-${Date.now()}${ext}`;
        cb(null, filename);
    },
});

// ✅ Rename this to avoid conflict with controller function
const uploadLogoMiddleware = multer({
    storage: logoStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
        }
    },
});

const Business = require('../models/Business'); // Make sure this is imported

// ─── Multer Configuration for Gallery ──────────────────────────
const galleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // ✅ Use _id instead of slug
        const businessId = req.business._id;
        const uploadDir = path.join(__dirname, '../../uploads', businessId.toString(), 'gallery');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});
const uploadGalleryMiddleware = multer({
    storage: galleryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    },
});

// ─── All routes require auth ──────────────────────────────────
router.use(auth);

// ─── Read-Only Routes ─────────────────────────────────────────
router.get('/profile', getProfile);

// ─── Write Routes ─────────────────────────────────────────────
router.use(checkWriteAccess);

// Profile
router.put('/profile', updateProfile);

// Logo
router.post('/profile/logo', uploadLogoMiddleware.single('logo'), uploadLogo);
router.delete('/profile/logo', deleteLogo);

// Gallery
router.post('/profile/gallery/upload', uploadGalleryMiddleware.single('image'), uploadGalleryImage);
router.post('/profile/gallery', addGalleryItem);
router.put('/profile/gallery/:index', updateGalleryItem);
router.delete('/profile/gallery/:index', removeGalleryItem);
// ─── Get All Public Studios ──────────────────────────────────────
router.get('/public/studios', getAllPublicStudios);
module.exports = router;