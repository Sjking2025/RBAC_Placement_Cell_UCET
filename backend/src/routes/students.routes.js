const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadResume } = require('../middleware/upload');
const {
    updateProfileSchema,
    addSkillSchema,
    addProjectSchema,
    addCertificationSchema,
    addInternshipSchema
} = require('../validators/studentValidator');

// All routes require authentication
router.use(protect);

// Student list (Admin, Officer, Coordinator)
router.get('/', authorize('admin', 'dept_officer', 'coordinator'), studentController.getStudents);

// Create Student (Admin, Officer)
router.post('/', authorize('admin', 'dept_officer'), studentController.createStudent);

// Bulk Create Students (Admin, Officer)
router.post('/bulk', authorize('admin', 'dept_officer'), studentController.bulkCreateStudents);

// Get student by ID
router.get('/:id', studentController.getStudent);

// Update student profile
router.put('/:id', validate(updateProfileSchema), studentController.updateStudent);

// Delete student (Admin, Officer)
router.delete('/:id', authorize('admin', 'dept_officer'), studentController.deleteStudent);

// ==========================================
// SUB-RESOURCE ROUTES (Current User)
// ==========================================

// Skills
router.post('/skills', validate(addSkillSchema), studentController.addSkill);
router.delete('/skills/:skillId', studentController.deleteSkill);

// Projects
router.post('/projects', validate(addProjectSchema), studentController.addProject);
router.put('/projects/:projectId', validate(addProjectSchema), studentController.updateProject);
router.delete('/projects/:projectId', studentController.deleteProject);

// Certifications
router.post('/certifications', validate(addCertificationSchema), studentController.addCertification);
router.put('/certifications/:certId', validate(addCertificationSchema), studentController.updateCertification);
router.delete('/certifications/:certId', studentController.deleteCertification);

// Internships
router.post('/internships', validate(addInternshipSchema), studentController.addInternship);
router.put('/internships/:internshipId', validate(addInternshipSchema), studentController.updateInternship);
router.delete('/internships/:internshipId', studentController.deleteInternship);

// ==========================================
// SUB-RESOURCE ROUTES (Admin/ID-based)
// ==========================================

// Skills
router.post('/:id/skills', validate(addSkillSchema), studentController.addSkill);
router.delete('/:id/skills/:skillId', studentController.deleteSkill);

// Projects
router.post('/:id/projects', validate(addProjectSchema), studentController.addProject);

// Certifications
router.post('/:id/certifications', validate(addCertificationSchema), studentController.addCertification);

// Internships
router.post('/:id/internships', validate(addInternshipSchema), studentController.addInternship);

// Resume upload for logged-in user
router.post('/resume', uploadResume, async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const prisma = require('../config/database');
        const userId = req.user.id;

        // Find student profile by user ID
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { user_id: userId }
        });

        if (!studentProfile) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const resumeUrl = `/uploads/resumes/${req.file.filename}`;

        await prisma.studentProfile.update({
            where: { id: studentProfile.id },
            data: { resume_url: resumeUrl }
        });

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: { resumeUrl }
        });
    } catch (error) {
        next(error);
    }
});

// Remove resume for logged-in user
router.delete('/resume', async (req, res, next) => {
    try {
        const prisma = require('../config/database');
        const userId = req.user.id;

        const studentProfile = await prisma.studentProfile.findUnique({
            where: { user_id: userId }
        });

        if (!studentProfile) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        await prisma.studentProfile.update({
            where: { id: studentProfile.id },
            data: { resume_url: null }
        });

        res.status(200).json({
            success: true,
            message: 'Resume removed successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Resume upload (Admin/Officer)
router.post('/:id/resume', uploadResume, async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const prisma = require('../config/database');
        const studentId = parseInt(req.params.id);

        const resumeUrl = `/uploads/resumes/${req.file.filename}`;

        await prisma.studentProfile.update({
            where: { id: studentId },
            data: { resume_url: resumeUrl }
        });

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: { resumeUrl }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
