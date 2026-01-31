const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Generate CSV string from data array
 */
const generateCSV = (data, columns) => {
    if (!data || data.length === 0) {
        return columns.map(c => c.label).join(',') + '\n';
    }

    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
        columns.map(c => {
            let value = c.accessor(row);
            if (value === null || value === undefined) value = '';
            if (typeof value === 'string') {
                value = value.replace(/"/g, '""');
                return `"${value}"`;
            }
            return value;
        }).join(',')
    );

    return [header, ...rows].join('\n');
};

/**
 * @desc    Export students data as CSV
 * @route   GET /api/v1/export/students
 * @access  Private (Admin, Officer)
 */
exports.exportStudents = async (req, res, next) => {
    try {
        const { departmentId, batchYear, placementStatus } = req.query;

        const where = {};
        if (departmentId) where.department_id = parseInt(departmentId);
        if (batchYear) where.batch_year = parseInt(batchYear);
        if (placementStatus) where.placement_status = placementStatus;

        const students = await prisma.studentProfile.findMany({
            where,
            include: {
                user: {
                    include: { user_profile: true }
                },
                department: true,
                skills: true
            },
            orderBy: { roll_number: 'asc' }
        });

        const columns = [
            { label: 'Roll Number', accessor: s => s.roll_number },
            { label: 'Name', accessor: s => `${s.user?.user_profile?.first_name || ''} ${s.user?.user_profile?.last_name || ''}` },
            { label: 'Email', accessor: s => s.user?.email || '' },
            { label: 'Phone', accessor: s => s.user?.user_profile?.phone || '' },
            { label: 'Department', accessor: s => s.department?.name || '' },
            { label: 'Degree', accessor: s => s.degree },
            { label: 'Batch Year', accessor: s => s.batch_year },
            { label: 'CGPA', accessor: s => s.cgpa },
            { label: '10th %', accessor: s => s.tenth_percentage },
            { label: '12th %', accessor: s => s.twelfth_percentage },
            { label: 'Backlogs', accessor: s => s.active_backlogs },
            { label: 'Skills', accessor: s => s.skills?.map(sk => sk.skill_name).join('; ') || '' },
            { label: 'Placement Status', accessor: s => s.placement_status },
            { label: 'Profile Complete', accessor: s => s.profile_completed ? 'Yes' : 'No' }
        ];

        const csv = generateCSV(students, columns);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=students_export_${Date.now()}.csv`);
        res.send(csv);

    } catch (error) {
        logger.error('Export students failed:', error);
        next(error);
    }
};

/**
 * @desc    Export placements data as CSV
 * @route   GET /api/v1/export/placements
 * @access  Private (Admin, Officer)
 */
exports.exportPlacements = async (req, res, next) => {
    try {
        const { academicYear, departmentId } = req.query;

        const where = { offer_status: 'accepted' };
        if (departmentId) {
            where.student = { department_id: parseInt(departmentId) };
        }

        const placements = await prisma.placementRecord.findMany({
            where,
            include: {
                student: {
                    include: {
                        user: { include: { user_profile: true } },
                        department: true
                    }
                },
                company: true,
                job: true
            },
            orderBy: { offer_date: 'desc' }
        });

        const columns = [
            { label: 'Roll Number', accessor: p => p.student?.roll_number || '' },
            { label: 'Student Name', accessor: p => `${p.student?.user?.user_profile?.first_name || ''} ${p.student?.user?.user_profile?.last_name || ''}` },
            { label: 'Department', accessor: p => p.student?.department?.name || '' },
            { label: 'Company', accessor: p => p.company?.name || '' },
            { label: 'Job Title', accessor: p => p.job?.title || '' },
            { label: 'Package (LPA)', accessor: p => p.package_lpa },
            { label: 'Offer Date', accessor: p => p.offer_date ? new Date(p.offer_date).toLocaleDateString() : '' },
            { label: 'Joining Date', accessor: p => p.joining_date ? new Date(p.joining_date).toLocaleDateString() : '' },
            { label: 'Location', accessor: p => p.job?.location || '' }
        ];

        const csv = generateCSV(placements, columns);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=placements_export_${Date.now()}.csv`);
        res.send(csv);

    } catch (error) {
        logger.error('Export placements failed:', error);
        next(error);
    }
};

/**
 * @desc    Export companies data as CSV
 * @route   GET /api/v1/export/companies
 * @access  Private (Admin, Officer)
 */
exports.exportCompanies = async (req, res, next) => {
    try {
        const companies = await prisma.company.findMany({
            where: { status: 'active' },
            include: {
                contacts: { where: { is_primary: true } },
                job_postings: { where: { status: 'active' } },
                _count: { select: { placement_records: true } }
            },
            orderBy: { name: 'asc' }
        });

        const columns = [
            { label: 'Company Name', accessor: c => c.name },
            { label: 'Industry', accessor: c => c.industry || '' },
            { label: 'Website', accessor: c => c.website || '' },
            { label: 'City', accessor: c => c.city || '' },
            { label: 'State', accessor: c => c.state || '' },
            { label: 'Contact Person', accessor: c => c.contacts?.[0]?.name || '' },
            { label: 'Contact Email', accessor: c => c.contacts?.[0]?.email || '' },
            { label: 'Contact Phone', accessor: c => c.contacts?.[0]?.phone || '' },
            { label: 'Active Jobs', accessor: c => c.job_postings?.length || 0 },
            { label: 'Total Hires', accessor: c => c._count?.placement_records || 0 }
        ];

        const csv = generateCSV(companies, columns);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=companies_export_${Date.now()}.csv`);
        res.send(csv);

    } catch (error) {
        logger.error('Export companies failed:', error);
        next(error);
    }
};

/**
 * @desc    Export analytics summary as CSV
 * @route   GET /api/v1/export/analytics
 * @access  Private (Admin, Officer)
 */
exports.exportAnalytics = async (req, res, next) => {
    try {
        // Get department-wise stats
        const departments = await prisma.department.findMany({
            include: {
                student_profiles: true,
                _count: {
                    select: { student_profiles: true }
                }
            }
        });

        const stats = await Promise.all(departments.map(async (dept) => {
            const totalStudents = dept._count.student_profiles;
            const placedStudents = await prisma.studentProfile.count({
                where: {
                    department_id: dept.id,
                    placement_status: 'placed'
                }
            });
            const avgPackage = await prisma.placementRecord.aggregate({
                where: {
                    student: { department_id: dept.id },
                    offer_status: 'accepted'
                },
                _avg: { package_lpa: true },
                _max: { package_lpa: true }
            });

            return {
                department: dept.name,
                code: dept.code,
                totalStudents,
                placedStudents,
                placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0,
                avgPackage: avgPackage._avg?.package_lpa || 0,
                highestPackage: avgPackage._max?.package_lpa || 0
            };
        }));

        const columns = [
            { label: 'Department', accessor: s => s.department },
            { label: 'Code', accessor: s => s.code },
            { label: 'Total Students', accessor: s => s.totalStudents },
            { label: 'Placed Students', accessor: s => s.placedStudents },
            { label: 'Placement Rate (%)', accessor: s => s.placementRate },
            { label: 'Avg Package (LPA)', accessor: s => s.avgPackage },
            { label: 'Highest Package (LPA)', accessor: s => s.highestPackage }
        ];

        const csv = generateCSV(stats, columns);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics_export_${Date.now()}.csv`);
        res.send(csv);

    } catch (error) {
        logger.error('Export analytics failed:', error);
        next(error);
    }
};

module.exports = exports;
