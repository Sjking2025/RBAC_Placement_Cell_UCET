const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Analytics Service - Generate placement statistics and reports
 */

/**
 * Get overall placement statistics
 */
exports.getOverallStats = async (academicYear) => {
    try {
        // Get real counts from database
        const totalStudents = await prisma.studentProfile.count();
        const placedStudents = await prisma.studentProfile.count({
            where: { placement_status: 'placed' }
        });
        const totalCompanies = await prisma.company.count({
            where: { status: 'active' }
        });
        const activeJobs = await prisma.jobPosting.count({
            where: { status: 'active' }
        });
        const pendingApplications = await prisma.application.count({
            where: { status: 'pending' }
        });
        const totalOffers = await prisma.placementRecord.count({
            where: { offer_status: 'accepted' }
        });

        // Get package stats
        const packageStats = await prisma.placementRecord.aggregate({
            where: { offer_status: 'accepted' },
            _avg: { package_lpa: true },
            _max: { package_lpa: true },
            _min: { package_lpa: true }
        });

        // Calculate placement rate
        const placementRate = totalStudents > 0
            ? ((placedStudents / totalStudents) * 100).toFixed(1)
            : 0;

        return {
            totalStudents,
            placedStudents,
            totalCompanies,
            activeJobs,
            pendingApplications,
            totalOffers,
            placementRate,
            averagePackage: packageStats._avg?.package_lpa || 0,
            highestPackage: packageStats._max?.package_lpa || 0,
            lowestPackage: packageStats._min?.package_lpa || 0
        };
    } catch (error) {
        logger.error('Failed to get overall stats:', error);
        throw error;
    }
};

/**
 * Get department-wise statistics
 */
exports.getDepartmentStats = async (departmentId, academicYear) => {
    try {
        const where = { department_id: departmentId };
        if (academicYear) {
            where.academic_year = academicYear;
        }

        const stats = await prisma.placementStatsCache.findFirst({
            where,
            include: {
                department: true
            }
        });

        if (!stats) {
            return null;
        }

        // Get top recruiters for department
        const topRecruiters = await prisma.placementRecord.groupBy({
            by: ['company_id'],
            where: {
                student: {
                    department_id: departmentId
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });

        // Get company details
        const companyIds = topRecruiters.map(r => r.company_id).filter(Boolean);
        const companies = await prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true, logo_url: true }
        });

        const topRecruitersWithDetails = topRecruiters.map(r => ({
            ...r,
            company: companies.find(c => c.id === r.company_id)
        }));

        return {
            ...stats,
            topRecruiters: topRecruitersWithDetails
        };
    } catch (error) {
        logger.error('Failed to get department stats:', error);
        throw error;
    }
};

/**
 * Get company-wise statistics
 */
exports.getCompanyStats = async () => {
    try {
        const companies = await prisma.company.findMany({
            where: { status: 'active' },
            include: {
                job_postings: {
                    where: { status: 'active' }
                },
                placement_records: true
            }
        });

        return companies.map(company => ({
            id: company.id,
            name: company.name,
            logo_url: company.logo_url,
            totalJobs: company.job_postings.length,
            totalHires: company.placement_records.length,
            averagePackage: company.placement_records.length > 0
                ? (company.placement_records.reduce((sum, r) => sum + parseFloat(r.package_lpa || 0), 0) / company.placement_records.length).toFixed(2)
                : 0
        }));
    } catch (error) {
        logger.error('Failed to get company stats:', error);
        throw error;
    }
};

/**
 * Get student placement trend
 */
exports.getPlacementTrend = async (years = 5) => {
    try {
        const currentYear = new Date().getFullYear();
        const trends = [];

        for (let i = 0; i < years; i++) {
            const year = currentYear - i;
            const academicYear = `${year}-${year + 1}`;

            const stats = await prisma.placementStatsCache.aggregate({
                where: { academic_year: academicYear },
                _sum: {
                    total_students: true,
                    placed_students: true,
                    total_offers: true
                },
                _avg: {
                    average_package: true
                },
                _max: {
                    highest_package: true
                }
            });

            trends.push({
                academicYear,
                totalStudents: stats._sum.total_students || 0,
                placedStudents: stats._sum.placed_students || 0,
                totalOffers: stats._sum.total_offers || 0,
                averagePackage: stats._avg.average_package || 0,
                highestPackage: stats._max.highest_package || 0
            });
        }

        return trends.reverse();
    } catch (error) {
        logger.error('Failed to get placement trend:', error);
        throw error;
    }
};

/**
 * Refresh placement stats cache
 */
exports.refreshStatsCache = async (academicYear, departmentId = null) => {
    try {
        const where = {};
        if (departmentId) {
            where.department_id = departmentId;
        }

        // Get all departments
        const departments = departmentId
            ? [{ id: departmentId }]
            : await prisma.department.findMany({ select: { id: true } });

        for (const dept of departments) {
            // Calculate stats for each department
            const students = await prisma.studentProfile.count({
                where: { department_id: dept.id }
            });

            const placements = await prisma.placementRecord.findMany({
                where: {
                    student: { department_id: dept.id },
                    offer_status: 'accepted'
                }
            });

            const packages = placements.map(p => parseFloat(p.package_lpa) || 0).filter(p => p > 0);

            await prisma.placementStatsCache.upsert({
                where: {
                    academic_year_department_id: {
                        academic_year: academicYear,
                        department_id: dept.id
                    }
                },
                update: {
                    total_students: students,
                    placed_students: placements.length,
                    average_package: packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : null,
                    highest_package: packages.length > 0 ? Math.max(...packages) : null,
                    lowest_package: packages.length > 0 ? Math.min(...packages) : null,
                    total_offers: placements.length
                },
                create: {
                    academic_year: academicYear,
                    department_id: dept.id,
                    total_students: students,
                    placed_students: placements.length,
                    average_package: packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : null,
                    highest_package: packages.length > 0 ? Math.max(...packages) : null,
                    lowest_package: packages.length > 0 ? Math.min(...packages) : null,
                    total_offers: placements.length
                }
            });
        }

        logger.info(`Stats cache refreshed for ${academicYear}`);
        return true;
    } catch (error) {
        logger.error('Failed to refresh stats cache:', error);
        throw error;
    }
};

module.exports = exports;
