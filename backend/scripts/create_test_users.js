const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser(email, role, firstName, lastName, phone, deptId) {
    console.log(`Processing ${email}...`);
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        const passwordHash = await bcrypt.hash('password123', 10);

        if (!user) {
            console.log(`Creating user ${email}...`);
            user = await prisma.user.create({
                data: {
                    email,
                    password_hash: passwordHash,
                    role,
                    status: 'active',
                    email_verified: true,
                    user_profile: {
                        create: {
                            first_name: firstName,
                            last_name: lastName,
                            phone: phone,
                            department_id: deptId
                        }
                    }
                },
                include: { user_profile: true }
            });
            console.log(`Created user ${user.id}`);
        } else {
            console.log(`Updating user ${email}...`);
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    role,
                    status: 'active',
                    password_hash: passwordHash
                },
                include: { user_profile: true }
            });
        }

        // Ensure profile exists and is correct
        if (!user.user_profile) {
            console.log(`Creating profile for ${email}...`);
            await prisma.userProfile.create({
                data: {
                    user_id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    department_id: deptId
                }
            });
        } else if (user.user_profile.department_id !== deptId) {
            console.log(`Updating profile department for ${email}...`);
            await prisma.userProfile.update({
                where: { user_id: user.id },
                data: { department_id: deptId }
            });
        }
        console.log(`Success: ${email}`);
    } catch (error) {
        console.error(`Failed to process ${email}:`);
        console.error(error);
        throw error;
    }
}

async function main() {
    console.log('Seeding test users...');

    // 1. Ensure Departments exist
    const departments = ['CSE', 'ECE', 'ME', 'CE'].map(code => ({
        code,
        name: `${code} Department`,
        description: `Department of ${code}`
    }));

    for (const dept of departments) {
        await prisma.department.upsert({
            where: { code: dept.code },
            update: {},
            create: dept
        });
    }

    const cseDept = await prisma.department.findUnique({ where: { code: 'CSE' } });
    console.log(`CSE Department ID: ${cseDept.id}`);

    await createUser('officer@college.edu', 'dept_officer', 'Test', 'Officer', '9876543210', cseDept.id);
    await createUser('coordinator@college.edu', 'coordinator', 'Test', 'Coordinator', '9876543211', cseDept.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
