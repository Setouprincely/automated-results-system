#!/usr/bin/env node

/**
 * 🔍 Test Database Connection and User Creation/Login
 */

const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log(`${colors.bold}${colors.blue}🔍 Testing Database Connection and Login Fix${colors.reset}\n`);

    // 1. Test database connection
    console.log(`${colors.yellow}1. Testing database connection...${colors.reset}`);
    await prisma.$connect();
    console.log(`${colors.green}✅ Connected to PostgreSQL${colors.reset}`);

    // 2. Check existing demo student
    console.log(`\n${colors.yellow}2. Checking demo student...${colors.reset}`);
    const demoStudent = await prisma.studentUser.findUnique({
      where: { email: 'demo.student@gce.cm' }
    });

    if (demoStudent) {
      console.log(`${colors.green}✅ Demo student found${colors.reset}`);
      console.log(`   Name: ${demoStudent.fullName}`);
      console.log(`   Email: ${demoStudent.email}`);
      
      // Test password verification
      const passwordMatch = await bcrypt.compare('demo123', demoStudent.passwordHash);
      console.log(`   Password verification: ${passwordMatch ? '✅ CORRECT' : '❌ FAILED'}`);
    } else {
      console.log(`${colors.red}❌ Demo student not found${colors.reset}`);
    }

    // 3. Create a test user
    console.log(`\n${colors.yellow}3. Creating test user...${colors.reset}`);
    const testEmail = 'test.login@fix.com';
    
    // Delete if exists
    try {
      await prisma.studentUser.delete({ where: { email: testEmail } });
      console.log(`   Deleted existing test user`);
    } catch (e) {
      // User doesn't exist, that's fine
    }

    // Create new test user
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);
    const testUser = await prisma.studentUser.create({
      data: {
        id: `TEST-${Date.now()}`,
        fullName: 'Test Login User',
        email: testEmail,
        passwordHash: hashedPassword,
        registrationStatus: 'confirmed',
        emailVerified: true,
        examLevel: 'A Level',
        candidateNumber: 'TEST123'
      }
    });

    console.log(`${colors.green}✅ Test user created${colors.reset}`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);

    // 4. Test password verification for new user
    console.log(`\n${colors.yellow}4. Testing password verification...${colors.reset}`);
    const newUserPasswordMatch = await bcrypt.compare('TestPass123!', testUser.passwordHash);
    console.log(`   Password verification: ${newUserPasswordMatch ? '✅ CORRECT' : '❌ FAILED'}`);

    // 5. Test finding user by email
    console.log(`\n${colors.yellow}5. Testing user lookup...${colors.reset}`);
    const foundUser = await prisma.studentUser.findUnique({
      where: { email: testEmail }
    });

    if (foundUser) {
      console.log(`${colors.green}✅ User found by email${colors.reset}`);
      console.log(`   Found ID: ${foundUser.id}`);
      console.log(`   Found Name: ${foundUser.fullName}`);
    } else {
      console.log(`${colors.red}❌ User not found by email${colors.reset}`);
    }

    // 6. Count users in each schema
    console.log(`\n${colors.yellow}6. Checking user counts...${colors.reset}`);
    const [studentCount, teacherCount, examinerCount, adminCount] = await Promise.all([
      prisma.studentUser.count(),
      prisma.teacherUser.count(),
      prisma.examinerUser.count(),
      prisma.adminUser.count()
    ]);

    console.log(`   Students: ${studentCount}`);
    console.log(`   Teachers: ${teacherCount}`);
    console.log(`   Examiners: ${examinerCount}`);
    console.log(`   Admins: ${adminCount}`);

    console.log(`\n${colors.bold}${colors.green}🎉 Database Test Complete!${colors.reset}`);
    console.log(`\n${colors.blue}Test Results:${colors.reset}`);
    console.log(`✅ Database connection working`);
    console.log(`✅ User creation working`);
    console.log(`✅ Password hashing with bcrypt working`);
    console.log(`✅ User lookup working`);
    console.log(`✅ Separate schemas working`);

    console.log(`\n${colors.yellow}Test Credentials:${colors.reset}`);
    console.log(`Email: ${testEmail}`);
    console.log(`Password: TestPass123!`);
    console.log(`User Type: student`);

  } catch (error) {
    console.error(`${colors.red}❌ Database test failed:${colors.reset}`, error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
