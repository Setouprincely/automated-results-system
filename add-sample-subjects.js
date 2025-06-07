#!/usr/bin/env node

/**
 * 📚 Add Sample Subjects to Students
 * Adds sample subject registrations to existing students for testing the Results page
 */

const { Client } = require('pg');
require('dotenv').config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Sample subjects for O Level and A Level
const O_LEVEL_SUBJECTS = [
  { name: 'English Language', code: 'ENG', status: 'registered' },
  { name: 'Mathematics', code: 'MATH', status: 'registered' },
  { name: 'Physics', code: 'PHY', status: 'registered' },
  { name: 'Chemistry', code: 'CHEM', status: 'registered' },
  { name: 'Biology', code: 'BIO', status: 'registered' },
  { name: 'Computer Science', code: 'CS', status: 'registered' },
  { name: 'French', code: 'FR', status: 'registered' }
];

const A_LEVEL_SUBJECTS = [
  { name: 'Mathematics', code: 'MATH', status: 'registered' },
  { name: 'Physics', code: 'PHY', status: 'registered' },
  { name: 'Chemistry', code: 'CHEM', status: 'registered' },
  { name: 'Computer Science', code: 'CS', status: 'registered' }
];

async function addSampleSubjects() {
  console.log(`${colors.bold}${colors.blue}📚 ADDING SAMPLE SUBJECTS TO STUDENTS${colors.reset}\n`);

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

    // Update O Level students
    console.log(`${colors.bold}${colors.cyan}📚 UPDATING O LEVEL STUDENTS${colors.reset}`);
    
    const oLevelQuery = `
      SELECT id, "fullName", email, "candidateNumber"
      FROM "o_level_students"."users"
      ORDER BY "createdAt" DESC;
    `;
    
    const oLevelResult = await client.query(oLevelQuery);
    console.log(`Found ${oLevelResult.rows.length} O Level students\n`);
    
    for (const student of oLevelResult.rows) {
      console.log(`${colors.yellow}Updating: ${student.fullName}${colors.reset}`);
      
      const updateQuery = `
        UPDATE "o_level_students"."users"
        SET "oLevelSubjects" = $1, "updatedAt" = NOW()
        WHERE id = $2;
      `;
      
      await client.query(updateQuery, [JSON.stringify(O_LEVEL_SUBJECTS), student.id]);
      console.log(`${colors.green}✅ Added ${O_LEVEL_SUBJECTS.length} O Level subjects${colors.reset}`);
      console.log(`   Subjects: ${O_LEVEL_SUBJECTS.map(s => s.name).join(', ')}\n`);
    }

    // Update A Level students
    console.log(`${colors.bold}${colors.cyan}📚 UPDATING A LEVEL STUDENTS${colors.reset}`);
    
    const aLevelQuery = `
      SELECT id, "fullName", email, "candidateNumber"
      FROM "a_level_students"."users"
      ORDER BY "createdAt" DESC;
    `;
    
    const aLevelResult = await client.query(aLevelQuery);
    console.log(`Found ${aLevelResult.rows.length} A Level students\n`);
    
    for (const student of aLevelResult.rows) {
      console.log(`${colors.yellow}Updating: ${student.fullName}${colors.reset}`);
      
      const updateQuery = `
        UPDATE "a_level_students"."users"
        SET "aLevelSubjects" = $1, "updatedAt" = NOW()
        WHERE id = $2;
      `;
      
      await client.query(updateQuery, [JSON.stringify(A_LEVEL_SUBJECTS), student.id]);
      console.log(`${colors.green}✅ Added ${A_LEVEL_SUBJECTS.length} A Level subjects${colors.reset}`);
      console.log(`   Subjects: ${A_LEVEL_SUBJECTS.map(s => s.name).join(', ')}\n`);
    }

    // Verify updates
    console.log(`${colors.bold}${colors.cyan}🔍 VERIFYING UPDATES${colors.reset}`);
    
    const verifyOLevelQuery = `
      SELECT "fullName", "oLevelSubjects"
      FROM "o_level_students"."users"
      WHERE "oLevelSubjects" IS NOT NULL;
    `;
    
    const verifyOLevelResult = await client.query(verifyOLevelQuery);
    console.log(`\n${colors.green}✅ ${verifyOLevelResult.rows.length} O Level students now have subjects${colors.reset}`);
    
    const verifyALevelQuery = `
      SELECT "fullName", "aLevelSubjects"
      FROM "a_level_students"."users"
      WHERE "aLevelSubjects" IS NOT NULL;
    `;
    
    const verifyALevelResult = await client.query(verifyALevelQuery);
    console.log(`${colors.green}✅ ${verifyALevelResult.rows.length} A Level students now have subjects${colors.reset}`);

    console.log(`\n${colors.bold}${colors.green}🎉 SUCCESS: Sample subjects added to all students!${colors.reset}`);
    console.log(`\n${colors.bold}📊 WHAT'S NOW AVAILABLE:${colors.reset}`);
    console.log(`• O Level students have 7 subjects each`);
    console.log(`• A Level students have 4 subjects each`);
    console.log(`• Results page will now show subject data`);
    console.log(`• Students can see their registered subjects`);

    console.log(`\n${colors.bold}🧪 TO TEST RESULTS PAGE:${colors.reset}`);
    console.log(`1. Start the development server: npm run dev`);
    console.log(`2. Login as any student (e.g., setou@gmail.com)`);
    console.log(`3. Navigate to /Student/results`);
    console.log(`4. You should now see:`);
    console.log(`   • Student profile information`);
    console.log(`   • O Level and A Level tabs`);
    console.log(`   • Subject tables with registered subjects`);
    console.log(`   • Mock grades and scores for each subject`);

    console.log(`\n${colors.bold}📝 SUBJECT DATA FORMAT:${colors.reset}`);
    console.log(`Each subject is stored as:`);
    console.log(`{`);
    console.log(`  "name": "Mathematics",`);
    console.log(`  "code": "MATH",`);
    console.log(`  "status": "registered"`);
    console.log(`}`);

  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
  } finally {
    await client.end();
  }
}

// Run the script
if (require.main === module) {
  addSampleSubjects();
}

module.exports = { addSampleSubjects };
