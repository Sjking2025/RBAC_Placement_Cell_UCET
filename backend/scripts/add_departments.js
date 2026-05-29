const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDepartments() {
    try {
        const depts = [
            { name: 'Mechanical Engineering', code: 'MECH' },
            { name: 'Civil Engineering', code: 'CIVIL' },
            { name: 'Computer Science and Engineering', code: 'CSE' },
            { name: 'Electronics and Communication Engineering', code: 'ECE' },
            { name: 'Electrical and Electronics Engineering', code: 'EEE' }
        ];

        for (const d of depts) {
            const existing = await prisma.department.findUnique({
                where: { code: d.code }
            });

            if (!existing) {
                await prisma.department.create({
                    data: {
                        name: d.name,
                        code: d.code,
                        description: `${d.name} Department`
                    }
                });
                console.log(`✅ Created ${d.code}`);
            } else {
                console.log(`ℹ️ ${d.code} already exists`);
            }
        }

    } catch (error) {
        console.error('Error adding departments:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addDepartments();
