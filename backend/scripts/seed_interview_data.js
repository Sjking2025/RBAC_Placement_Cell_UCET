const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding interview data...');

    // 1. Get Student
    const studentUser = await prisma.user.findUnique({
        where: { email: 'student@placementcell.com' },
        include: { student_profile: true }
    });

    if (!studentUser) {
        console.error('Student not found. Run "npm run seed" first.');
        return;
    }

    // 2. Get Job
    const job = await prisma.jobPosting.findFirst({
        where: { status: 'active' }
    });

    if (!job) {
        console.error('No active job found.');
        return;
    }

    // 3. Create Application
    const application = await prisma.application.upsert({
        where: {
            student_id_job_id: {
                student_id: studentUser.student_profile.id,
                job_id: job.id
            }
        },
        update: { status: 'interview_scheduled' },
        create: {
            student_id: studentUser.student_profile.id,
            job_id: job.id,
            status: 'interview_scheduled',
            applied_at: new Date()
        }
    });

    console.log(`✅ Application created/updated for Job: ${job.title}`);

    // 4. Create Interviews
    // Round 1: Technical (Completed, Passed)
    const interview1 = await prisma.interview.create({
        data: {
            application_id: application.id,
            interview_type: 'technical',
            interview_mode: 'online',
            scheduled_date: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
            scheduled_time: new Date('1970-01-01T10:00:00Z'),
            duration_minutes: 60,
            status: 'completed',
            result: 'passed',
            feedback: 'Strong problem solving skills.',
            created_by: studentUser.id // Hack: usually created by officer
        }
    });

    // Round 2: HR (Upcoming)
    const interview2 = await prisma.interview.create({
        data: {
            application_id: application.id,
            interview_type: 'hr',
            interview_mode: 'offline',
            location: 'Conference Room B',
            scheduled_date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days later
            scheduled_time: new Date('1970-01-01T14:00:00Z'),
            duration_minutes: 30,
            status: 'scheduled',
            created_by: studentUser.id
        }
    });

    console.log('✅ Created 2 interviews (1 past/passed, 1 upcoming)');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
