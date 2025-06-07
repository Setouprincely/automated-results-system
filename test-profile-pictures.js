#!/usr/bin/env node

/**
 * 🖼️ Test Profile Picture Display
 * Verifies that uploaded profile pictures show up correctly in student accounts
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

async function testProfilePictures() {
  console.log(`${colors.bold}${colors.blue}🖼️ TESTING PROFILE PICTURE DISPLAY${colors.reset}\n`);

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

    // Check O Level students with profile pictures
    console.log(`${colors.yellow}📚 Checking O Level students...${colors.reset}`);
    const oLevelQuery = `
      SELECT id, "fullName", email, "profilePicturePath", "createdAt"
      FROM "o_level_students"."users"
      ORDER BY "createdAt" DESC;
    `;
    
    try {
      const oLevelResult = await client.query(oLevelQuery);
      console.log(`${colors.green}✅ Found ${oLevelResult.rows.length} O Level students${colors.reset}`);
      
      oLevelResult.rows.forEach((student, index) => {
        console.log(`\n${colors.cyan}${index + 1}. ${student.fullName}${colors.reset}`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   🆔 ID: ${student.id}`);
        console.log(`   📸 Profile Picture: ${student.profilePicturePath || 'None'}`);
        console.log(`   📅 Registered: ${new Date(student.createdAt).toLocaleDateString()}`);
        
        if (student.profilePicturePath) {
          console.log(`   ${colors.green}✅ Has profile picture${colors.reset}`);
        } else {
          console.log(`   ${colors.yellow}⚠️  No profile picture${colors.reset}`);
        }
      });
    } catch (error) {
      console.log(`${colors.red}❌ Error checking O Level students: ${error.message}${colors.reset}`);
    }

    // Check A Level students with profile pictures
    console.log(`\n${colors.yellow}📚 Checking A Level students...${colors.reset}`);
    const aLevelQuery = `
      SELECT id, "fullName", email, "profilePicturePath", "createdAt"
      FROM "a_level_students"."users"
      ORDER BY "createdAt" DESC;
    `;
    
    try {
      const aLevelResult = await client.query(aLevelQuery);
      console.log(`${colors.green}✅ Found ${aLevelResult.rows.length} A Level students${colors.reset}`);
      
      aLevelResult.rows.forEach((student, index) => {
        console.log(`\n${colors.cyan}${index + 1}. ${student.fullName}${colors.reset}`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   🆔 ID: ${student.id}`);
        console.log(`   📸 Profile Picture: ${student.profilePicturePath || 'None'}`);
        console.log(`   📅 Registered: ${new Date(student.createdAt).toLocaleDateString()}`);
        
        if (student.profilePicturePath) {
          console.log(`   ${colors.green}✅ Has profile picture${colors.reset}`);
        } else {
          console.log(`   ${colors.yellow}⚠️  No profile picture${colors.reset}`);
        }
      });
    } catch (error) {
      console.log(`${colors.red}❌ Error checking A Level students: ${error.message}${colors.reset}`);
    }

    // Test profile picture API for each student
    console.log(`\n${colors.yellow}🌐 Testing Profile Picture API...${colors.reset}`);
    
    const allStudents = [
      ...(await client.query(oLevelQuery)).rows.map(s => ({...s, examLevel: 'O Level'})),
      ...(await client.query(aLevelQuery)).rows.map(s => ({...s, examLevel: 'A Level'}))
    ];

    for (const student of allStudents) {
      console.log(`\n${colors.cyan}Testing API for ${student.fullName}...${colors.reset}`);
      
      try {
        const apiUrl = `http://localhost:3000/api/upload/profile-picture?userId=${student.id}&userType=student&examLevel=${encodeURIComponent(student.examLevel)}`;
        console.log(`📡 API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log(`   ${colors.green}✅ API Success: ${result.data.fileUrl}${colors.reset}`);
          } else {
            console.log(`   ${colors.yellow}⚠️  API returned success=false: ${result.message}${colors.reset}`);
          }
        } else if (response.status === 404) {
          console.log(`   ${colors.yellow}📭 No profile picture found (404)${colors.reset}`);
        } else {
          console.log(`   ${colors.red}❌ API Error: ${response.status} ${response.statusText}${colors.reset}`);
        }
      } catch (error) {
        console.log(`   ${colors.red}❌ API Request failed: ${error.message}${colors.reset}`);
      }
    }

    // Summary
    console.log(`\n${colors.bold}${colors.cyan}📊 PROFILE PICTURE SUMMARY${colors.reset}`);
    
    const totalStudents = allStudents.length;
    const studentsWithPictures = allStudents.filter(s => s.profilePicturePath).length;
    const studentsWithoutPictures = totalStudents - studentsWithPictures;
    
    console.log(`${colors.green}👥 Total Students: ${totalStudents}${colors.reset}`);
    console.log(`${colors.green}📸 With Pictures: ${studentsWithPictures}${colors.reset}`);
    console.log(`${colors.yellow}📭 Without Pictures: ${studentsWithoutPictures}${colors.reset}`);
    
    if (studentsWithPictures > 0) {
      console.log(`\n${colors.bold}${colors.green}🎉 Profile pictures are working!${colors.reset}`);
      console.log(`${colors.cyan}Students with uploaded pictures should see them in their accounts.${colors.reset}`);
    } else {
      console.log(`\n${colors.bold}${colors.yellow}⚠️  No profile pictures found${colors.reset}`);
      console.log(`${colors.cyan}Students need to upload profile pictures during registration or in their profile.${colors.reset}`);
    }

    // Troubleshooting tips
    if (studentsWithoutPictures > 0) {
      console.log(`\n${colors.bold}💡 TROUBLESHOOTING TIPS:${colors.reset}`);
      console.log(`1. Check if profile pictures were uploaded during registration`);
      console.log(`2. Verify the uploads/profiles directory exists and has correct permissions`);
      console.log(`3. Check if the profile picture upload API is working`);
      console.log(`4. Ensure the ProfilePicture component is receiving the correct profilePicturePath`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Database error:${colors.reset}`, error.message);
  } finally {
    await client.end();
  }
}

// Run the test
if (require.main === module) {
  testProfilePictures();
}

module.exports = { testProfilePictures };
