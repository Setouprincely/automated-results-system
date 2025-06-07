#!/usr/bin/env node

/**
 * 🗄️ Database Viewer - Quick overview of your GCE database
 */

const { PrismaClient } = require('./src/generated/prisma');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function viewDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log(`${colors.bold}${colors.blue}🗄️ GCE Database Overview${colors.reset}\n`);

    // Database connection test
    await prisma.$connect();
    console.log(`${colors.green}✅ Connected to PostgreSQL database${colors.reset}\n`);

    // 1. User counts by schema
    console.log(`${colors.bold}${colors.cyan}👥 User Counts by Schema${colors.reset}`);
    const [studentCount, teacherCount, examinerCount, adminCount] = await Promise.all([
      prisma.studentUser.count(),
      prisma.teacherUser.count(),
      prisma.examinerUser.count(),
      prisma.adminUser.count()
    ]);

    console.log(`${colors.yellow}Students (student_auth):${colors.reset} ${studentCount}`);
    console.log(`${colors.yellow}Teachers (teacher_auth):${colors.reset} ${teacherCount}`);
    console.log(`${colors.yellow}Examiners (examiner_auth):${colors.reset} ${examinerCount}`);
    console.log(`${colors.yellow}Admins (admin_auth):${colors.reset} ${adminCount}`);
    console.log(`${colors.bold}Total Users:${colors.reset} ${studentCount + teacherCount + examinerCount + adminCount}\n`);

    // 2. Students overview
    if (studentCount > 0) {
      console.log(`${colors.bold}${colors.cyan}👨‍🎓 Students Overview${colors.reset}`);
      const students = await prisma.studentUser.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          examLevel: true,
          registrationStatus: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      students.forEach((student, index) => {
        console.log(`${colors.green}${index + 1}.${colors.reset} ${student.fullName}`);
        console.log(`   ID: ${student.id}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Level: ${student.examLevel || 'Not set'}`);
        console.log(`   Status: ${student.registrationStatus}`);
        console.log(`   Created: ${new Date(student.createdAt).toLocaleDateString()}`);
        console.log('');
      });

      if (studentCount > 5) {
        console.log(`   ... and ${studentCount - 5} more students\n`);
      }
    }

    // 3. Admins overview
    if (adminCount > 0) {
      console.log(`${colors.bold}${colors.cyan}👨‍💻 Admins Overview${colors.reset}`);
      const admins = await prisma.adminUser.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          registrationStatus: true
        }
      });

      admins.forEach((admin, index) => {
        console.log(`${colors.green}${index + 1}.${colors.reset} ${admin.fullName}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role || 'admin'}`);
        console.log(`   Status: ${admin.registrationStatus}`);
        console.log('');
      });
    }

    // 4. Teachers overview
    if (teacherCount > 0) {
      console.log(`${colors.bold}${colors.cyan}👨‍🏫 Teachers Overview${colors.reset}`);
      const teachers = await prisma.teacherUser.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          school: true,
          registrationStatus: true
        }
      });

      teachers.forEach((teacher, index) => {
        console.log(`${colors.green}${index + 1}.${colors.reset} ${teacher.fullName}`);
        console.log(`   ID: ${teacher.id}`);
        console.log(`   Email: ${teacher.email}`);
        console.log(`   School: ${teacher.school || 'Not set'}`);
        console.log(`   Status: ${teacher.registrationStatus}`);
        console.log('');
      });
    }

    // 5. Examiners overview
    if (examinerCount > 0) {
      console.log(`${colors.bold}${colors.cyan}👨‍💼 Examiners Overview${colors.reset}`);
      const examiners = await prisma.examinerUser.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          specialization: true,
          registrationStatus: true
        }
      });

      examiners.forEach((examiner, index) => {
        console.log(`${colors.green}${index + 1}.${colors.reset} ${examiner.fullName}`);
        console.log(`   ID: ${examiner.id}`);
        console.log(`   Email: ${examiner.email}`);
        console.log(`   Specialization: ${examiner.specialization || 'Not set'}`);
        console.log(`   Status: ${examiner.registrationStatus}`);
        console.log('');
      });
    }

    // 6. Shared data overview
    console.log(`${colors.bold}${colors.cyan}📚 Shared Data (Public Schema)${colors.reset}`);
    const [subjectCount, centerCount, sessionCount, auditCount] = await Promise.all([
      prisma.subject.count(),
      prisma.examCenter.count(),
      prisma.examSession.count(),
      prisma.auditLog.count()
    ]);

    console.log(`${colors.yellow}Subjects:${colors.reset} ${subjectCount}`);
    console.log(`${colors.yellow}Exam Centers:${colors.reset} ${centerCount}`);
    console.log(`${colors.yellow}Exam Sessions:${colors.reset} ${sessionCount}`);
    console.log(`${colors.yellow}Audit Logs:${colors.reset} ${auditCount}\n`);

    // 7. Recent subjects
    if (subjectCount > 0) {
      console.log(`${colors.bold}${colors.cyan}📖 Available Subjects${colors.reset}`);
      const subjects = await prisma.subject.findMany({
        select: {
          code: true,
          name: true,
          level: true,
          isActive: true
        },
        where: { isActive: true },
        orderBy: { level: 'asc' }
      });

      const oLevelSubjects = subjects.filter(s => s.level === 'O Level');
      const aLevelSubjects = subjects.filter(s => s.level === 'A Level');

      if (oLevelSubjects.length > 0) {
        console.log(`${colors.magenta}O Level Subjects:${colors.reset}`);
        oLevelSubjects.forEach(subject => {
          console.log(`   ${subject.code} - ${subject.name}`);
        });
      }

      if (aLevelSubjects.length > 0) {
        console.log(`${colors.magenta}A Level Subjects:${colors.reset}`);
        aLevelSubjects.forEach(subject => {
          console.log(`   ${subject.code} - ${subject.name}`);
        });
      }
      console.log('');
    }

    // 8. Recent audit logs
    if (auditCount > 0) {
      console.log(`${colors.bold}${colors.cyan}📝 Recent Activity (Audit Logs)${colors.reset}`);
      const recentLogs = await prisma.auditLog.findMany({
        select: {
          action: true,
          tableName: true,
          userType: true,
          userEmail: true,
          timestamp: true
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      });

      recentLogs.forEach((log, index) => {
        console.log(`${colors.green}${index + 1}.${colors.reset} ${log.action} on ${log.tableName}`);
        console.log(`   User: ${log.userEmail} (${log.userType})`);
        console.log(`   Time: ${new Date(log.timestamp).toLocaleString()}`);
        console.log('');
      });
    }

    // Summary
    console.log(`${colors.bold}${colors.blue}📊 Database Summary${colors.reset}`);
    console.log(`${colors.cyan}Database:${colors.reset} PostgreSQL (localhost:5432/gce_system)`);
    console.log(`${colors.cyan}Schemas:${colors.reset} student_auth, teacher_auth, examiner_auth, admin_auth, public`);
    console.log(`${colors.cyan}Total Records:${colors.reset} ${studentCount + teacherCount + examinerCount + adminCount + subjectCount + centerCount + sessionCount} (excluding audit logs)`);
    console.log(`${colors.cyan}Status:${colors.reset} ${colors.green}Healthy and operational${colors.reset}`);

    console.log(`\n${colors.bold}${colors.yellow}🛠️  Database Management Tools:${colors.reset}`);
    console.log(`${colors.cyan}Prisma Studio:${colors.reset} npm run db:studio (http://localhost:5555)`);
    console.log(`${colors.cyan}pgAdmin:${colors.reset} Search "pgAdmin" in Start Menu`);
    console.log(`${colors.cyan}Command Line:${colors.reset} psql -U gce_app -h localhost -d gce_system`);
    console.log(`${colors.cyan}This Script:${colors.reset} node view-database.js`);

  } catch (error) {
    console.error(`${colors.red}❌ Error viewing database:${colors.reset}`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`\n${colors.yellow}💡 Connection refused. Please check:${colors.reset}`);
      console.log(`1. PostgreSQL service is running`);
      console.log(`2. Database 'gce_system' exists`);
      console.log(`3. User 'gce_app' has correct permissions`);
      console.log(`4. Password in .env file is correct`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  viewDatabase();
}

module.exports = { viewDatabase };
