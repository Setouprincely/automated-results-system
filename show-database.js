#!/usr/bin/env node

/**
 * 🗄️ Database Viewer for GCE System
 * Shows all data in your separate databases
 */

const { PrismaClient } = require('@prisma/client');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Initialize Prisma clients for each schema
const prisma = new PrismaClient();

async function showDatabase() {
  console.log(`${colors.bold}${colors.blue}🗄️ GCE SYSTEM DATABASE OVERVIEW${colors.reset}\n`);

  try {
    // 1. Show O Level Students
    console.log(`${colors.bold}${colors.cyan}📚 O LEVEL STUDENTS DATABASE${colors.reset}`);
    console.log(`${colors.dim}Schema: o_level_students${colors.reset}\n`);

    try {
      const oLevelStudents = await prisma.oLevelStudent.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          candidateNumber: true,
          schoolCenterNumber: true,
          region: true,
          registrationStatus: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (oLevelStudents.length > 0) {
        console.log(`${colors.green}✅ Found ${oLevelStudents.length} O Level students:${colors.reset}\n`);

        oLevelStudents.forEach((student, index) => {
          console.log(`${colors.yellow}${index + 1}. ${student.fullName}${colors.reset}`);
          console.log(`   📧 Email: ${student.email}`);
          console.log(`   🆔 ID: ${student.id}`);
          console.log(`   🎓 Candidate: ${student.candidateNumber}`);
          console.log(`   🏫 School: ${student.schoolCenterNumber}`);
          console.log(`   📍 Region: ${student.region}`);
          console.log(`   📅 Registered: ${new Date(student.createdAt).toLocaleDateString()}`);
          console.log(`   ✅ Status: ${student.registrationStatus}\n`);
        });
      } else {
        console.log(`${colors.dim}📭 No O Level students found${colors.reset}\n`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error accessing O Level database: ${error.message}${colors.reset}\n`);
    }

    // 2. Show A Level Students
    console.log(`${colors.bold}${colors.cyan}📚 A LEVEL STUDENTS DATABASE${colors.reset}`);
    console.log(`${colors.dim}Schema: a_level_students${colors.reset}\n`);

    try {
      const aLevelStudents = await prisma.aLevelStudent.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          candidateNumber: true,
          schoolCenterNumber: true,
          region: true,
          registrationStatus: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (aLevelStudents.length > 0) {
        console.log(`${colors.green}✅ Found ${aLevelStudents.length} A Level students:${colors.reset}\n`);

        aLevelStudents.forEach((student, index) => {
          console.log(`${colors.yellow}${index + 1}. ${student.fullName}${colors.reset}`);
          console.log(`   📧 Email: ${student.email}`);
          console.log(`   🆔 ID: ${student.id}`);
          console.log(`   🎓 Candidate: ${student.candidateNumber}`);
          console.log(`   🏫 School: ${student.schoolCenterNumber}`);
          console.log(`   📍 Region: ${student.region}`);
          console.log(`   📅 Registered: ${new Date(student.createdAt).toLocaleDateString()}`);
          console.log(`   ✅ Status: ${student.registrationStatus}\n`);
        });
      } else {
        console.log(`${colors.dim}📭 No A Level students found${colors.reset}\n`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error accessing A Level database: ${error.message}${colors.reset}\n`);
    }

    // 3. Show Schools
    console.log(`${colors.bold}${colors.cyan}🏫 SCHOOLS DATABASE${colors.reset}`);
    console.log(`${colors.dim}Schema: public.schools${colors.reset}\n`);

    try {
      const schools = await prisma.school.findMany({
        orderBy: { centerNumber: 'asc' }
      });

      if (schools.length > 0) {
        console.log(`${colors.green}✅ Found ${schools.length} schools:${colors.reset}\n`);

        schools.forEach((school, index) => {
          console.log(`${colors.yellow}${index + 1}. ${school.name}${colors.reset}`);
          console.log(`   🏷️  Center: ${school.centerNumber}`);
          console.log(`   📍 Region: ${school.region}`);
          console.log(`   👥 Students: ${school.totalStudents} (O: ${school.oLevelStudents}, A: ${school.aLevelStudents})`);
          console.log(`   📞 Phone: ${school.phoneNumber || 'Not provided'}`);
          console.log(`   ✅ Status: ${school.isActive ? 'Active' : 'Inactive'}\n`);
        });
      } else {
        console.log(`${colors.dim}📭 No schools found${colors.reset}\n`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error accessing schools database: ${error.message}${colors.reset}\n`);
    }

    // 4. Show Teachers
    console.log(`${colors.bold}${colors.cyan}👨‍🏫 TEACHERS DATABASE${colors.reset}`);
    console.log(`${colors.dim}Schema: teacher_auth${colors.reset}\n`);

    try {
      const teachers = await prisma.teacherUser.findMany({
        orderBy: { createdAt: 'desc' }
      });

      if (teachers.length > 0) {
        console.log(`${colors.green}✅ Found ${teachers.length} teachers:${colors.reset}\n`);

        teachers.forEach((teacher, index) => {
          console.log(`${colors.yellow}${index + 1}. ${teacher.fullName}${colors.reset}`);
          console.log(`   📧 Email: ${teacher.email}`);
          console.log(`   🆔 ID: ${teacher.id}`);
          console.log(`   🏫 School: ${teacher.school || 'Not specified'}`);
          console.log(`   📅 Registered: ${new Date(teacher.createdAt).toLocaleDateString()}`);
          console.log(`   ✅ Status: ${teacher.registrationStatus}\n`);
        });
      } else {
        console.log(`${colors.dim}📭 No teachers found${colors.reset}\n`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error accessing teachers database: ${error.message}${colors.reset}\n`);
    }

    // 5. Show Examiners
    console.log(`${colors.bold}${colors.cyan}👨‍💼 EXAMINERS DATABASE${colors.reset}`);
    console.log(`${colors.dim}Schema: examiner_auth${colors.reset}\n`);

    try {
      const examiners = await prisma.examinerUser.findMany({
        orderBy: { createdAt: 'desc' }
      });

      if (examiners.length > 0) {
        console.log(`${colors.green}✅ Found ${examiners.length} examiners:${colors.reset}\n`);

        examiners.forEach((examiner, index) => {
          console.log(`${colors.yellow}${index + 1}. ${examiner.fullName}${colors.reset}`);
          console.log(`   📧 Email: ${examiner.email}`);
          console.log(`   🆔 ID: ${examiner.id}`);
          console.log(`   🎯 Specialization: ${examiner.specialization || 'Not specified'}`);
          console.log(`   📅 Registered: ${new Date(examiner.createdAt).toLocaleDateString()}`);
          console.log(`   ✅ Status: ${examiner.registrationStatus}\n`);
        });
      } else {
        console.log(`${colors.dim}📭 No examiners found${colors.reset}\n`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error accessing examiners database: ${error.message}${colors.reset}\n`);
    }

    // 6. Show Database Statistics
    console.log(`${colors.bold}${colors.magenta}📊 DATABASE STATISTICS${colors.reset}\n`);

    try {
      const [oLevelCount, aLevelCount, schoolCount, teacherCount, examinerCount] = await Promise.all([
        prisma.oLevelStudent.count(),
        prisma.aLevelStudent.count(),
        prisma.school.count(),
        prisma.teacherUser.count(),
        prisma.examinerUser.count()
      ]);

      const totalStudents = oLevelCount + aLevelCount;

      console.log(`${colors.cyan}👥 Total Students: ${totalStudents}${colors.reset}`);
      console.log(`${colors.cyan}📚 O Level Students: ${oLevelCount}${colors.reset}`);
      console.log(`${colors.cyan}📚 A Level Students: ${aLevelCount}${colors.reset}`);
      console.log(`${colors.cyan}🏫 Total Schools: ${schoolCount}${colors.reset}`);
      console.log(`${colors.cyan}👨‍🏫 Total Teachers: ${teacherCount}${colors.reset}`);
      console.log(`${colors.cyan}👨‍💼 Total Examiners: ${examinerCount}${colors.reset}\n`);



    } catch (error) {
      console.log(`${colors.red}❌ Error getting statistics: ${error.message}${colors.reset}\n`);
    }

    console.log(`${colors.bold}${colors.green}🎉 Database overview complete!${colors.reset}`);
    console.log(`${colors.dim}Run this script anytime to see your current database state.${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}❌ Database connection error:${colors.reset}`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the database viewer
if (require.main === module) {
  showDatabase();
}

module.exports = { showDatabase };
