#!/usr/bin/env node

/**
 * 🐘 Test PostgreSQL Connection and Data
 */

const { PrismaClient } = require('./src/generated/prisma');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function testPostgreSQL() {
  const prisma = new PrismaClient();
  
  try {
    console.log(`${colors.bold}${colors.blue}🐘 Testing PostgreSQL Connection${colors.reset}\n`);

    // Test connection
    console.log(`${colors.yellow}1. Testing database connection...${colors.reset}`);
    await prisma.$connect();
    console.log(`${colors.green}✅ Connected to PostgreSQL successfully${colors.reset}`);

    // Test each schema
    console.log(`\n${colors.yellow}2. Testing separate schemas...${colors.reset}`);
    
    // Count users in each schema
    const [studentCount, teacherCount, examinerCount, adminCount] = await Promise.all([
      prisma.studentUser.count(),
      prisma.teacherUser.count(),
      prisma.examinerUser.count(),
      prisma.adminUser.count()
    ]);

    console.log(`${colors.cyan}📊 User counts by schema:${colors.reset}`);
    console.log(`   Students (student_auth): ${studentCount}`);
    console.log(`   Teachers (teacher_auth): ${teacherCount}`);
    console.log(`   Examiners (examiner_auth): ${examinerCount}`);
    console.log(`   Admins (admin_auth): ${adminCount}`);

    // Test demo student
    console.log(`\n${colors.yellow}3. Testing demo student data...${colors.reset}`);
    const demoStudent = await prisma.studentUser.findUnique({
      where: { email: 'demo.student@gce.cm' }
    });

    if (demoStudent) {
      console.log(`${colors.green}✅ Demo student found:${colors.reset}`);
      console.log(`   ID: ${demoStudent.id}`);
      console.log(`   Name: ${demoStudent.fullName}`);
      console.log(`   Email: ${demoStudent.email}`);
      console.log(`   Exam Level: ${demoStudent.examLevel}`);
      console.log(`   Subjects: ${demoStudent.subjects ? JSON.parse(demoStudent.subjects).length : 0}`);
    } else {
      console.log(`${colors.red}❌ Demo student not found${colors.reset}`);
    }

    // Test admin user
    console.log(`\n${colors.yellow}4. Testing admin user...${colors.reset}`);
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: 'admin@gce.cm' }
    });

    if (adminUser) {
      console.log(`${colors.green}✅ Admin user found:${colors.reset}`);
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Name: ${adminUser.fullName}`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      console.log(`${colors.red}❌ Admin user not found${colors.reset}`);
    }

    // Test shared data
    console.log(`\n${colors.yellow}5. Testing shared data (public schema)...${colors.reset}`);
    const [subjectCount, centerCount, sessionCount] = await Promise.all([
      prisma.subject.count(),
      prisma.examCenter.count(),
      prisma.examSession.count()
    ]);

    console.log(`${colors.cyan}📊 Shared data counts:${colors.reset}`);
    console.log(`   Subjects: ${subjectCount}`);
    console.log(`   Exam Centers: ${centerCount}`);
    console.log(`   Exam Sessions: ${sessionCount}`);

    // Test isolation (try to find student in wrong schema)
    console.log(`\n${colors.yellow}6. Testing schema isolation...${colors.reset}`);
    
    // This should work (student in student schema)
    const studentInStudentSchema = await prisma.studentUser.findUnique({
      where: { email: 'demo.student@gce.cm' }
    });
    
    // This should return null (student email in admin schema)
    const studentInAdminSchema = await prisma.adminUser.findUnique({
      where: { email: 'demo.student@gce.cm' }
    });

    if (studentInStudentSchema && !studentInAdminSchema) {
      console.log(`${colors.green}✅ Schema isolation working correctly${colors.reset}`);
      console.log(`   Student found in student_auth schema: ✅`);
      console.log(`   Student NOT found in admin_auth schema: ✅`);
    } else {
      console.log(`${colors.red}❌ Schema isolation issue detected${colors.reset}`);
    }

    console.log(`\n${colors.bold}${colors.green}🎉 PostgreSQL Test Complete!${colors.reset}`);
    console.log(`\n${colors.cyan}🔐 Demo Credentials for Testing:${colors.reset}`);
    console.log(`${colors.yellow}Admin:${colors.reset}    admin@gce.cm / admin123`);
    console.log(`${colors.yellow}Student:${colors.reset}  demo.student@gce.cm / demo123`);
    console.log(`${colors.yellow}Student:${colors.reset}  jean.fopa@student.cm / student123`);
    console.log(`${colors.yellow}Teacher:${colors.reset}  sarah.mbeki@school.cm / teacher123`);
    console.log(`${colors.yellow}Examiner:${colors.reset} emmanuel.ndongo@examiner.cm / examiner123`);

    console.log(`\n${colors.cyan}📊 Database Location:${colors.reset}`);
    console.log(`   Host: localhost:5432`);
    console.log(`   Database: gce_system`);
    console.log(`   Schemas: student_auth, teacher_auth, examiner_auth, admin_auth, public`);

    console.log(`\n${colors.cyan}🛠️  Management Tools:${colors.reset}`);
    console.log(`   Prisma Studio: npm run db:studio`);
    console.log(`   pgAdmin: Use the pgAdmin tool installed with PostgreSQL`);

  } catch (error) {
    console.error(`${colors.red}❌ PostgreSQL test failed:${colors.reset}`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`\n${colors.yellow}💡 Connection refused. Please check:${colors.reset}`);
      console.log(`   1. PostgreSQL service is running`);
      console.log(`   2. Database 'gce_system' exists`);
      console.log(`   3. User 'gce_app' has correct permissions`);
      console.log(`   4. Password in .env file is correct`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testPostgreSQL();
}

module.exports = { testPostgreSQL };
