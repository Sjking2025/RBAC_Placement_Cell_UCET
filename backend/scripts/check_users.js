const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const emails = [
            'robert.j@example.com',
            'emily.d@example.com',
            'john.doe@example.com',
            'jane.smith@example.com'
        ];

        const users = await prisma.user.findMany({
            where: { email: { in: emails } },
            select: { email: true, id: true }
        });

        console.log('--- Existing Users ---');
        console.table(users);

    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
