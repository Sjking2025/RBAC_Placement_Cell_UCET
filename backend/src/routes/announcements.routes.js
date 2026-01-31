const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const { uploadAttachment } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Get all announcements
router.get('/', announcementController.getAnnouncements);

// Get single announcement
router.get('/:id', announcementController.getAnnouncement);

// Create announcement (Admin, Officer, Coordinator)
router.post('/',
    authorize('admin', 'dept_officer', 'coordinator'),
    announcementController.createAnnouncement
);

// Update announcement (Admin, Officer, Creator)
router.put('/:id',
    authorize('admin', 'dept_officer', 'coordinator'),
    announcementController.updateAnnouncement
);

// Delete announcement (Admin, Creator)
router.delete('/:id',
    authorize('admin', 'dept_officer', 'coordinator'),
    announcementController.deleteAnnouncement
);

// Upload attachment
router.post('/:id/attachment',
    authorize('admin', 'dept_officer', 'coordinator'),
    uploadAttachment,
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            const prisma = require('../config/database');
            const announcementId = parseInt(req.params.id);

            const attachmentUrl = `/uploads/attachments/${req.file.filename}`;

            await prisma.announcement.update({
                where: { id: announcementId },
                data: { attachment_url: attachmentUrl }
            });

            res.status(200).json({
                success: true,
                message: 'Attachment uploaded successfully',
                data: { attachmentUrl }
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
