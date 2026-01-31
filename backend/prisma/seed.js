const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create departments
    const departments = await Promise.all([
        prisma.department.upsert({
            where: { code: 'CSE' },
            update: {},
            create: {
                name: 'Computer Science and Engineering',
                code: 'CSE',
                description: 'Department of Computer Science and Engineering'
            }
        }),
        prisma.department.upsert({
            where: { code: 'ECE' },
            update: {},
            create: {
                name: 'Electronics and Communication Engineering',
                code: 'ECE',
                description: 'Department of Electronics and Communication Engineering'
            }
        }),
        prisma.department.upsert({
            where: { code: 'EEE' },
            update: {},
            create: {
                name: 'Electrical and Electronics Engineering',
                code: 'EEE',
                description: 'Department of Electrical and Electronics Engineering'
            }
        }),
        prisma.department.upsert({
            where: { code: 'ME' },
            update: {},
            create: {
                name: 'Mechanical Engineering',
                code: 'ME',
                description: 'Department of Mechanical Engineering'
            }
        }),
        prisma.department.upsert({
            where: { code: 'CE' },
            update: {},
            create: {
                name: 'Civil Engineering',
                code: 'CE',
                description: 'Department of Civil Engineering'
            }
        }),
        prisma.department.upsert({
            where: { code: 'IT' },
            update: {},
            create: {
                name: 'Information Technology',
                code: 'IT',
                description: 'Department of Information Technology'
            }
        })
    ]);

    console.log(`✅ Created ${departments.length} departments`);

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@placementcell.com' },
        update: {},
        create: {
            email: 'admin@placementcell.com',
            password_hash: hashedPassword,
            role: 'admin',
            status: 'active',
            email_verified: true,
            user_profile: {
                create: {
                    first_name: 'System',
                    last_name: 'Administrator',
                    phone: '+91-9876543210'
                }
            }
        }
    });

    console.log('✅ Created admin user: admin@placementcell.com / Admin@123');

    // Create a dept officer
    const officerUser = await prisma.user.upsert({
        where: { email: 'officer@placementcell.com' },
        update: {},
        create: {
            email: 'officer@placementcell.com',
            password_hash: hashedPassword,
            role: 'dept_officer',
            status: 'active',
            email_verified: true,
            user_profile: {
                create: {
                    first_name: 'Placement',
                    last_name: 'Officer',
                    phone: '+91-9876543211',
                    department_id: departments[0].id
                }
            }
        }
    });

    console.log('✅ Created officer user: officer@placementcell.com / Admin@123');

    // Create a coordinator
    const coordinatorUser = await prisma.user.upsert({
        where: { email: 'coordinator@placementcell.com' },
        update: {},
        create: {
            email: 'coordinator@placementcell.com',
            password_hash: hashedPassword,
            role: 'coordinator',
            status: 'active',
            email_verified: true,
            user_profile: {
                create: {
                    first_name: 'Department',
                    last_name: 'Coordinator',
                    phone: '+91-9876543212',
                    department_id: departments[0].id
                }
            }
        }
    });

    console.log('✅ Created coordinator user: coordinator@placementcell.com / Admin@123');

    // Create a sample student
    const studentPassword = await bcrypt.hash('Student@123', 10);

    const studentUser = await prisma.user.upsert({
        where: { email: 'student@placementcell.com' },
        update: {},
        create: {
            email: 'student@placementcell.com',
            password_hash: studentPassword,
            role: 'student',
            status: 'active',
            email_verified: true,
            user_profile: {
                create: {
                    first_name: 'Demo',
                    last_name: 'Student',
                    phone: '+91-9876543213',
                    department_id: departments[0].id
                }
            },
            student_profile: {
                create: {
                    roll_number: 'CSE2025001',
                    degree: 'BTech',
                    department_id: departments[0].id,
                    batch_year: 2025,
                    current_semester: 7,
                    cgpa: 8.5,
                    tenth_percentage: 92.5,
                    twelfth_percentage: 88.0,
                    active_backlogs: 0,
                    profile_completed: true,
                    placement_status: 'active',
                    skills: {
                        create: [
                            { skill_name: 'JavaScript', proficiency_level: 'advanced' },
                            { skill_name: 'React', proficiency_level: 'intermediate' },
                            { skill_name: 'Node.js', proficiency_level: 'intermediate' },
                            { skill_name: 'Python', proficiency_level: 'advanced' },
                            { skill_name: 'SQL', proficiency_level: 'intermediate' }
                        ]
                    },
                    projects: {
                        create: [
                            {
                                title: 'E-Commerce Platform',
                                description: 'Full-stack e-commerce application with React and Node.js',
                                technologies: 'React, Node.js, MongoDB, Express, Redux',
                                start_date: new Date('2024-01-01'),
                                end_date: new Date('2024-04-30'),
                                project_url: 'https://github.com/demo/ecommerce'
                            }
                        ]
                    }
                }
            }
        }
    });

    console.log('✅ Created student user: student@placementcell.com / Student@123');

    // Create sample companies
    const company1 = await prisma.company.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Tech Corp India',
            website: 'https://techcorp.in',
            industry: 'Information Technology',
            description: 'Leading IT services and consulting company',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            status: 'active',
            created_by: adminUser.id,
            approved_by: adminUser.id,
            approved_at: new Date(),
            contacts: {
                create: [
                    {
                        name: 'HR Manager',
                        designation: 'HR Manager',
                        email: 'hr@techcorp.in',
                        phone: '+91-9876543300',
                        is_primary: true
                    }
                ]
            }
        }
    });

    const company2 = await prisma.company.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Innovation Labs',
            website: 'https://innovationlabs.com',
            industry: 'Software Development',
            description: 'Product development and innovation company',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            status: 'active',
            created_by: adminUser.id,
            approved_by: adminUser.id,
            approved_at: new Date(),
            contacts: {
                create: [
                    {
                        name: 'Talent Acquisition',
                        designation: 'Talent Acquisition Lead',
                        email: 'careers@innovationlabs.com',
                        phone: '+91-9876543400',
                        is_primary: true
                    }
                ]
            }
        }
    });

    console.log('✅ Created 2 sample companies');

    // Create sample job postings
    const job1 = await prisma.jobPosting.create({
        data: {
            company_id: company1.id,
            title: 'Software Development Engineer',
            description: 'We are looking for talented Software Development Engineers to join our team. You will work on cutting-edge technologies and build scalable solutions for our clients.',
            job_type: 'full_time',
            location: 'Bangalore',
            work_mode: 'hybrid',
            salary_min: 800000,
            salary_max: 1200000,
            currency: 'INR',
            positions_available: 10,
            required_cgpa: 7.0,
            allowed_backlogs: 0,
            eligible_departments: [departments[0].id, departments[5].id],
            eligible_degrees: ['BTech', 'MTech'],
            eligible_batches: [2025],
            skills_required: ['JavaScript', 'React', 'Node.js', 'SQL'],
            responsibilities: '• Design and develop scalable software solutions\n• Write clean, maintainable code\n• Participate in code reviews\n• Collaborate with cross-functional teams',
            requirements: '• Strong programming fundamentals\n• Knowledge of web technologies\n• Good problem-solving skills\n• Excellent communication',
            perks: 'Health Insurance, Flexible Hours, Remote Work Options, Learning Allowance',
            application_deadline: new Date('2025-03-31'),
            status: 'active',
            created_by: adminUser.id,
            approved_by: adminUser.id,
            approved_at: new Date()
        }
    });

    const job2 = await prisma.jobPosting.create({
        data: {
            company_id: company2.id,
            title: 'Data Science Intern',
            description: 'Join our data science team as an intern and work on real-world machine learning projects.',
            job_type: 'internship',
            location: 'Hyderabad',
            work_mode: 'onsite',
            salary_min: 25000,
            salary_max: 40000,
            currency: 'INR',
            positions_available: 5,
            required_cgpa: 7.5,
            allowed_backlogs: 1,
            eligible_departments: [departments[0].id, departments[5].id],
            eligible_degrees: ['BTech', 'MTech', 'MCA'],
            eligible_batches: [2025, 2026],
            skills_required: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
            responsibilities: '• Work on ML model development\n• Analyze and visualize data\n• Assist in research projects',
            requirements: '• Knowledge of Python and ML libraries\n• Understanding of statistics\n• Eagerness to learn',
            perks: 'Certificate, PPO Opportunity, Mentorship',
            application_deadline: new Date('2025-02-28'),
            status: 'active',
            created_by: adminUser.id,
            approved_by: adminUser.id,
            approved_at: new Date()
        }
    });

    console.log('✅ Created 2 sample job postings');

    // Create sample announcement
    await prisma.announcement.create({
        data: {
            title: 'Welcome to Placement Cell Portal',
            content: 'Welcome to the new Placement Cell Management System. This portal will help you manage your placement journey effectively. Please complete your profile to start applying for jobs.',
            type: 'general',
            priority: 'high',
            target_roles: ['student', 'coordinator', 'dept_officer', 'admin'],
            target_departments: [],
            target_batches: [],
            is_pinned: true,
            published: true,
            published_at: new Date(),
            created_by: adminUser.id
        }
    });

    console.log('✅ Created sample announcement');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@placementcell.com / Admin@123');
    console.log('   Officer: officer@placementcell.com / Admin@123');
    console.log('   Coordinator: coordinator@placementcell.com / Admin@123');
    console.log('   Student: student@placementcell.com / Student@123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
