const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listDepartments() {
    try {
        const depts = await prisma.department.findMany();
        console.log('--- Existing Departments ---');
        console.table(depts.map(d => ({ ID: d.id, Name: d.name, Code: d.code })));

        // Check for MECH and CIVIL specifically
        const mech = depts.find(d => d.code === 'MECH');
        const civil = depts.find(d => d.code === 'CIVIL');

        if (!mech) console.log('❌ MECH Department missing');
        if (!civil) console.log('❌ CIVIL Department missing');

    } catch (error) {
        console.error('Error listing departments:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listDepartments();
