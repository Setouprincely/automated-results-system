#!/usr/bin/env node

/**
 * 🔧 Fix Email Verification for Existing Students
 * Sets emailVerified to true for all existing students
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

async function fixEmailVerification() {
  console.log(`${colors.bold}${colors.blue}🔧 FIXING EMAIL VERIFICATION FOR EXISTING STUDENTS${colors.reset}\n`);

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
    console.log(`${colors.yellow}📚 Updating O Level students...${colors.reset}`);
    const oLevelQuery = `
      UPDATE "o_level_students"."users" 
      SET "emailVerified" = true 
      WHERE "emailVerified" = false;
    `;
    
    try {
      const oLevelResult = await client.query(oLevelQuery);
      console.log(`${colors.green}✅ Updated ${oLevelResult.rowCount} O Level students${colors.reset}`);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log(`${colors.yellow}⚠️  O Level students table doesn't exist yet${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Error updating O Level students: ${error.message}${colors.reset}`);
      }
    }

    // Update A Level students
    console.log(`${colors.yellow}📚 Updating A Level students...${colors.reset}`);
    const aLevelQuery = `
      UPDATE "a_level_students"."users" 
      SET "emailVerified" = true 
      WHERE "emailVerified" = false;
    `;
    
    try {
      const aLevelResult = await client.query(aLevelQuery);
      console.log(`${colors.green}✅ Updated ${aLevelResult.rowCount} A Level students${colors.reset}`);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log(`${colors.yellow}⚠️  A Level students table doesn't exist yet${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Error updating A Level students: ${error.message}${colors.reset}`);
      }
    }

    // Update Teachers
    console.log(`${colors.yellow}👨‍🏫 Updating teachers...${colors.reset}`);
    const teacherQuery = `
      UPDATE "teacher_auth"."users" 
      SET "emailVerified" = true 
      WHERE "emailVerified" = false;
    `;
    
    try {
      const teacherResult = await client.query(teacherQuery);
      console.log(`${colors.green}✅ Updated ${teacherResult.rowCount} teachers${colors.reset}`);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log(`${colors.yellow}⚠️  Teachers table doesn't exist yet${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Error updating teachers: ${error.message}${colors.reset}`);
      }
    }

    // Update Examiners
    console.log(`${colors.yellow}👨‍💼 Updating examiners...${colors.reset}`);
    const examinerQuery = `
      UPDATE "examiner_auth"."users" 
      SET "emailVerified" = true 
      WHERE "emailVerified" = false;
    `;
    
    try {
      const examinerResult = await client.query(examinerQuery);
      console.log(`${colors.green}✅ Updated ${examinerResult.rowCount} examiners${colors.reset}`);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log(`${colors.yellow}⚠️  Examiners table doesn't exist yet${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Error updating examiners: ${error.message}${colors.reset}`);
      }
    }

    console.log(`\n${colors.bold}${colors.green}🎉 Email verification fix complete!${colors.reset}`);
    console.log(`${colors.cyan}All existing users can now login without email verification issues.${colors.reset}\n`);

    // Show verification status
    console.log(`${colors.bold}${colors.cyan}📊 VERIFICATION STATUS CHECK${colors.reset}`);
    
    const statusQueries = [
      {
        name: 'O Level Students',
        query: 'SELECT COUNT(*) as total, SUM(CASE WHEN "emailVerified" = true THEN 1 ELSE 0 END) as verified FROM "o_level_students"."users";'
      },
      {
        name: 'A Level Students', 
        query: 'SELECT COUNT(*) as total, SUM(CASE WHEN "emailVerified" = true THEN 1 ELSE 0 END) as verified FROM "a_level_students"."users";'
      },
      {
        name: 'Teachers',
        query: 'SELECT COUNT(*) as total, SUM(CASE WHEN "emailVerified" = true THEN 1 ELSE 0 END) as verified FROM "teacher_auth"."users";'
      },
      {
        name: 'Examiners',
        query: 'SELECT COUNT(*) as total, SUM(CASE WHEN "emailVerified" = true THEN 1 ELSE 0 END) as verified FROM "examiner_auth"."users";'
      }
    ];

    for (const statusQuery of statusQueries) {
      try {
        const result = await client.query(statusQuery.query);
        const { total, verified } = result.rows[0];
        const totalNum = parseInt(total) || 0;
        const verifiedNum = parseInt(verified) || 0;
        
        if (totalNum > 0) {
          console.log(`${colors.green}✅ ${statusQuery.name}: ${verifiedNum}/${totalNum} verified (${Math.round(verifiedNum/totalNum*100)}%)${colors.reset}`);
        } else {
          console.log(`${colors.dim}📭 ${statusQuery.name}: No users found${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.yellow}⚠️  ${statusQuery.name}: Table not found${colors.reset}`);
      }
    }

  } catch (error) {
    console.error(`${colors.red}❌ Database error:${colors.reset}`, error.message);
  } finally {
    await client.end();
  }
}

// Run the fix
if (require.main === module) {
  fixEmailVerification();
}

module.exports = { fixEmailVerification };
