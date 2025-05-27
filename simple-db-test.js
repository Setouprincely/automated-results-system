#!/usr/bin/env node

/**
 * 🐘 Simple PostgreSQL Test
 */

const { PrismaClient } = require('./src/generated/prisma');

async function simpleTest() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🐘 Testing PostgreSQL...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Count users in each schema
    const studentCount = await prisma.studentUser.count();
    const teacherCount = await prisma.teacherUser.count();
    const examinerCount = await prisma.examinerUser.count();
    const adminCount = await prisma.adminUser.count();

    console.log('\n📊 User counts:');
    console.log(`   Students: ${studentCount}`);
    console.log(`   Teachers: ${teacherCount}`);
    console.log(`   Examiners: ${examinerCount}`);
    console.log(`   Admins: ${adminCount}`);

    // Test demo student
    const demoStudent = await prisma.studentUser.findUnique({
      where: { email: 'demo.student@gce.cm' }
    });

    if (demoStudent) {
      console.log('\n✅ Demo student found:');
      console.log(`   Name: ${demoStudent.fullName}`);
      console.log(`   Email: ${demoStudent.email}`);
    }

    // Test admin
    const admin = await prisma.adminUser.findUnique({
      where: { email: 'admin@gce.cm' }
    });

    if (admin) {
      console.log('\n✅ Admin user found:');
      console.log(`   Name: ${admin.fullName}`);
      console.log(`   Email: ${admin.email}`);
    }

    console.log('\n🎉 PostgreSQL is working perfectly!');
    console.log('\n🔐 Demo Credentials:');
    console.log('   Admin: admin@gce.cm / admin123');
    console.log('   Student: demo.student@gce.cm / demo123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest();
