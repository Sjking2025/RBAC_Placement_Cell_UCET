const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearTestUsers() {
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

        const result = await prisma.user.deleteMany({
            where: { email: { in: emails } }
        });

        console.log(`Deleted ${result.count} test users.`);

    } catch (error) {
        console.error('Error clearing users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearTestUsers();
