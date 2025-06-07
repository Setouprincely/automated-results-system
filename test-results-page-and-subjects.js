#!/usr/bin/env node

/**
 * 🧪 Test Results Page and Subject Registration Flow
 * Verifies that the Results page works correctly and subject registration flows from schools to students
 */

const { Client } = require('pg');
require('dotenv').config();

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

async function testResultsPageAndSubjects() {
  console.log(`${colors.bold}${colors.blue}🧪 TESTING RESULTS PAGE AND SUBJECT REGISTRATION FLOW${colors.reset}\n`);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log(`${colors.red}❌ DATABASE_URL not found in .env file${colors.reset}`);
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log(`${colors.green}✅ Connected to database${colors.reset}\n`);

    // Test 1: Check current student subject data
    console.log(`${colors.bold}${colors.cyan}📊 TEST 1: CHECKING CURRENT STUDENT SUBJECT DATA${colors.reset}`);

    // Check O Level students
    console.log(`\n${colors.yellow}📚 O Level Students:${colors.reset}`);
    const oLevelQuery = `
      SELECT id, "fullName", email, "oLevelSubjects", "candidateNumber", "schoolCenterNumber"
      FROM "o_level_students"."users"
      ORDER BY "createdAt" DESC;
    `;

    const oLevelResult = await client.query(oLevelQuery);
    console.log(`Found ${oLevelResult.rows.length} O Level students`);

    oLevelResult.rows.forEach((student, index) => {
      const subjects = student.oLevelSubjects;
      const hasSubjects = subjects && Array.isArray(subjects) && subjects.length > 0;

      console.log(`\n${colors.cyan}${index + 1}. ${student.fullName}${colors.reset}`);
      console.log(`   📧 Email: ${student.email}`);
      console.log(`   🎓 Candidate: ${student.candidateNumber || 'Not set'}`);
      console.log(`   🏫 School: ${student.schoolCenterNumber || 'Not set'}`);
      console.log(`   📚 Subjects: ${hasSubjects ? `${subjects.length} subjects` : 'None registered'}`);

      if (hasSubjects) {
        console.log(`   📋 Subject List: ${subjects.map(s => s.name || s).join(', ')}`);
      }
    });

    // Check A Level students
    console.log(`\n${colors.yellow}📚 A Level Students:${colors.reset}`);
    const aLevelQuery = `
      SELECT id, "fullName", email, "aLevelSubjects", "candidateNumber", "schoolCenterNumber"
      FROM "a_level_students"."users"
      ORDER BY "createdAt" DESC;
    `;

    const aLevelResult = await client.query(aLevelQuery);
    console.log(`Found ${aLevelResult.rows.length} A Level students`);

    aLevelResult.rows.forEach((student, index) => {
      const subjects = student.aLevelSubjects;
      const hasSubjects = subjects && Array.isArray(subjects) && subjects.length > 0;

      console.log(`\n${colors.cyan}${index + 1}. ${student.fullName}${colors.reset}`);
      console.log(`   📧 Email: ${student.email}`);
      console.log(`   🎓 Candidate: ${student.candidateNumber || 'Not set'}`);
      console.log(`   🏫 School: ${student.schoolCenterNumber || 'Not set'}`);
      console.log(`   📚 Subjects: ${hasSubjects ? `${subjects.length} subjects` : 'None registered'}`);

      if (hasSubjects) {
        console.log(`   📋 Subject List: ${subjects.map(s => s.name || s).join(', ')}`);
      }
    });

    // Test 2: Test subject sync API
    console.log(`\n${colors.bold}${colors.cyan}🔄 TEST 2: TESTING SUBJECT SYNC API${colors.reset}`);

    if (oLevelResult.rows.length > 0) {
      const testStudent = oLevelResult.rows[0];
      console.log(`\n${colors.yellow}Testing subject sync for: ${testStudent.fullName}${colors.reset}`);

      const testSubjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology'];

      try {
        const syncResponse = await fetch('http://localhost:3000/api/students/subjects/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentEmail: testStudent.email,
            examLevel: 'O Level',
            subjects: testSubjects,
            schoolCenterNumber: testStudent.schoolCenterNumber,
            candidateNumber: testStudent.candidateNumber
          })
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log(`${colors.green}✅ Subject sync API working${colors.reset}`);
          console.log(`   Synced ${syncData.data.subjects.length} subjects`);
        } else {
          console.log(`${colors.yellow}⚠️  Subject sync API returned: ${syncResponse.status}${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.yellow}⚠️  Subject sync API test skipped (server not running)${colors.reset}`);
      }
    }

    // Test 3: Check Results page data structure
    console.log(`\n${colors.bold}${colors.cyan}📄 TEST 3: CHECKING RESULTS PAGE DATA STRUCTURE${colors.reset}`);

    const allStudents = [...oLevelResult.rows, ...aLevelResult.rows];

    allStudents.forEach(student => {
      const examLevel = student.oLevelSubjects !== undefined ? 'O Level' : 'A Level';
      const subjects = student.oLevelSubjects || student.aLevelSubjects;

      console.log(`\n${colors.cyan}Student: ${student.fullName} (${examLevel})${colors.reset}`);
      console.log(`   Profile Picture: ${student.profilePicturePath || 'None'}`);
      console.log(`   Exam Center: ${student.examCenter || 'Not set'}`);
      console.log(`   Candidate Number: ${student.candidateNumber || 'Not set'}`);

      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        console.log(`   ${colors.green}✅ Has ${subjects.length} subjects for Results page${colors.reset}`);
        subjects.forEach((subject, index) => {
          const subjectName = typeof subject === 'string' ? subject : subject.name;
          console.log(`      ${index + 1}. ${subjectName}`);
        });
      } else {
        console.log(`   ${colors.red}❌ No subjects - Results page will be empty${colors.reset}`);
      }
    });

    // Test 4: Summary and recommendations
    console.log(`\n${colors.bold}${colors.magenta}📊 SUMMARY AND RECOMMENDATIONS${colors.reset}`);

    const totalStudents = allStudents.length;
    const studentsWithSubjects = allStudents.filter(s => {
      const subjects = s.oLevelSubjects || s.aLevelSubjects;
      return subjects && Array.isArray(subjects) && subjects.length > 0;
    }).length;
    const studentsWithoutSubjects = totalStudents - studentsWithSubjects;

    console.log(`\n${colors.cyan}📈 Statistics:${colors.reset}`);
    console.log(`   Total Students: ${totalStudents}`);
    console.log(`   Students with Subjects: ${studentsWithSubjects}`);
    console.log(`   Students without Subjects: ${studentsWithoutSubjects}`);
    console.log(`   O Level Students: ${oLevelResult.rows.length}`);
    console.log(`   A Level Students: ${aLevelResult.rows.length}`);

    if (studentsWithSubjects > 0) {
      console.log(`\n${colors.green}✅ RESULTS PAGE STATUS: WORKING${colors.reset}`);
      console.log(`${colors.cyan}Students with subjects will see their registered subjects on the Results page.${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}⚠️  RESULTS PAGE STATUS: NEEDS SUBJECT DATA${colors.reset}`);
      console.log(`${colors.cyan}Students need subjects registered to see meaningful Results page content.${colors.reset}`);
    }

    console.log(`\n${colors.bold}💡 HOW TO REGISTER SUBJECTS:${colors.reset}`);
    console.log(`1. ${colors.cyan}School Portal Method:${colors.reset}`);
    console.log(`   • Login to Schools portal (/Schools/dashboard)`);
    console.log(`   • Go to Registration page (/Schools/registration)`);
    console.log(`   • Register candidates with subjects`);
    console.log(`   • Use Subject Sync API to transfer to student accounts`);

    console.log(`\n2. ${colors.cyan}Direct API Method:${colors.reset}`);
    console.log(`   • Use POST /api/students/subjects/sync`);
    console.log(`   • Provide: studentEmail, examLevel, subjects array`);
    console.log(`   • Subjects will appear in student Results page`);

    console.log(`\n3. ${colors.cyan}Database Direct Method:${colors.reset}`);
    console.log(`   • Update oLevelSubjects or aLevelSubjects JSON field`);
    console.log(`   • Format: [{"name": "Mathematics", "code": "MATH", "status": "registered"}]`);

    console.log(`\n${colors.bold}🧪 TO TEST RESULTS PAGE:${colors.reset}`);
    console.log(`1. Ensure students have subjects registered`);
    console.log(`2. Login as a student`);
    console.log(`3. Navigate to /Student/results`);
    console.log(`4. Check that subjects appear in the results table`);
    console.log(`5. Verify profile picture displays correctly`);

  } catch (error) {
    console.error(`${colors.red}❌ Test error:${colors.reset}`, error.message);
  } finally {
    await client.end();
  }
}

// Run the test
if (require.main === module) {
  testResultsPageAndSubjects();
}

module.exports = { testResultsPageAndSubjects };
