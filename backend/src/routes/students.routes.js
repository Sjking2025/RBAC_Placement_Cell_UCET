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

// Get student by ID
router.get('/:id', studentController.getStudent);

// Update student profile
router.put('/:id', validate(updateProfileSchema), studentController.updateStudent);

// Skills
router.post('/:id/skills', validate(addSkillSchema), studentController.addSkill);
router.delete('/:id/skills/:skillId', studentController.deleteSkill);

// Projects
router.post('/:id/projects', validate(addProjectSchema), studentController.addProject);

// Certifications
router.post('/:id/certifications', validate(addCertificationSchema), studentController.addCertification);

// Internships
router.post('/:id/internships', validate(addInternshipSchema), studentController.addInternship);

// Resume upload
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
