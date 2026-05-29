const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const emails = [
            'john.doe@example.com',
            'jane.smith@example.com',
            'robert.j@example.com',
            'emily.d@example.com',
            'michael.b@example.com',
            'sarah.w@example.com',
            'david.m@example.com',
            'jennifer.t@example.com',
            'james.a@example.com',
            'lisa.t@example.com'
        ];

        const users = await prisma.user.findMany({
            where: { email: { in: emails } },
            select: { email: true, id: true, student_profile: { select: { department: { select: { code: true } } } } }
        });

        console.log('Existing Users Check:');
        console.log(JSON.stringify(users, null, 2));

    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
