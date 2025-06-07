#!/usr/bin/env node

/**
 * 🔧 Fix Profile Picture Paths
 * Ensures profile pictures uploaded during registration are properly linked
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
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

async function fixProfilePicturePaths() {
  console.log(`${colors.bold}${colors.blue}🔧 FIXING PROFILE PICTURE PATHS${colors.reset}\n`);

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

    // Check uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    console.log(`${colors.yellow}📁 Checking uploads directory: ${uploadsDir}${colors.reset}`);
    
    if (!fs.existsSync(uploadsDir)) {
      console.log(`${colors.yellow}⚠️  Creating uploads directory...${colors.reset}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`${colors.green}✅ Created uploads directory${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Uploads directory exists${colors.reset}`);
    }

    // List existing profile pictures
    const profileFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    console.log(`${colors.cyan}📸 Found ${profileFiles.length} profile picture files${colors.reset}`);
    
    if (profileFiles.length > 0) {
      console.log(`Files: ${profileFiles.join(', ')}`);
    }

    // Check O Level students
    console.log(`\n${colors.yellow}📚 Checking O Level students...${colors.reset}`);
    const oLevelQuery = `
      SELECT id, "fullName", email, "profilePicturePath"
      FROM "o_level_students"."users"
      ORDER BY "createdAt" DESC;
    `;
    
    try {
      const oLevelResult = await client.query(oLevelQuery);
      console.log(`${colors.green}✅ Found ${oLevelResult.rows.length} O Level students${colors.reset}`);
      
      let fixedCount = 0;
      for (const student of oLevelResult.rows) {
        console.log(`\n${colors.cyan}Checking ${student.fullName}...${colors.reset}`);
        console.log(`   Current path: ${student.profilePicturePath || 'None'}`);
        
        // Look for profile picture files that might belong to this student
        const possibleFiles = profileFiles.filter(file => 
          file.includes(student.id) || 
          file.toLowerCase().includes(student.fullName.toLowerCase().replace(/\s+/g, ''))
        );
        
        if (possibleFiles.length > 0 && !student.profilePicturePath) {
          const selectedFile = possibleFiles[0];
          const relativePath = `/uploads/profiles/${selectedFile}`;
          
          console.log(`   ${colors.yellow}🔧 Found potential match: ${selectedFile}${colors.reset}`);
          console.log(`   ${colors.yellow}🔧 Updating database with: ${relativePath}${colors.reset}`);
          
          // Update database
          await client.query(
            'UPDATE "o_level_students"."users" SET "profilePicturePath" = $1 WHERE id = $2',
            [relativePath, student.id]
          );
          
          fixedCount++;
          console.log(`   ${colors.green}✅ Updated profile picture path${colors.reset}`);
        } else if (student.profilePicturePath) {
          // Check if the file actually exists
          const fullPath = path.join(process.cwd(), 'public', student.profilePicturePath);
          if (fs.existsSync(fullPath)) {
            console.log(`   ${colors.green}✅ Profile picture file exists${colors.reset}`);
          } else {
            console.log(`   ${colors.red}❌ Profile picture file missing: ${fullPath}${colors.reset}`);
          }
        } else {
          console.log(`   ${colors.yellow}📭 No profile picture found${colors.reset}`);
        }
      }
      
      if (fixedCount > 0) {
        console.log(`\n${colors.green}✅ Fixed ${fixedCount} O Level student profile pictures${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error checking O Level students: ${error.message}${colors.reset}`);
    }

    // Check A Level students
    console.log(`\n${colors.yellow}📚 Checking A Level students...${colors.reset}`);
    const aLevelQuery = `
      SELECT id, "fullName", email, "profilePicturePath"
      FROM "a_level_students"."users"
      ORDER BY "createdAt" DESC;
    `;
    
    try {
      const aLevelResult = await client.query(aLevelQuery);
      console.log(`${colors.green}✅ Found ${aLevelResult.rows.length} A Level students${colors.reset}`);
      
      let fixedCount = 0;
      for (const student of aLevelResult.rows) {
        console.log(`\n${colors.cyan}Checking ${student.fullName}...${colors.reset}`);
        console.log(`   Current path: ${student.profilePicturePath || 'None'}`);
        
        // Look for profile picture files that might belong to this student
        const possibleFiles = profileFiles.filter(file => 
          file.includes(student.id) || 
          file.toLowerCase().includes(student.fullName.toLowerCase().replace(/\s+/g, ''))
        );
        
        if (possibleFiles.length > 0 && !student.profilePicturePath) {
          const selectedFile = possibleFiles[0];
          const relativePath = `/uploads/profiles/${selectedFile}`;
          
          console.log(`   ${colors.yellow}🔧 Found potential match: ${selectedFile}${colors.reset}`);
          console.log(`   ${colors.yellow}🔧 Updating database with: ${relativePath}${colors.reset}`);
          
          // Update database
          await client.query(
            'UPDATE "a_level_students"."users" SET "profilePicturePath" = $1 WHERE id = $2',
            [relativePath, student.id]
          );
          
          fixedCount++;
          console.log(`   ${colors.green}✅ Updated profile picture path${colors.reset}`);
        } else if (student.profilePicturePath) {
          // Check if the file actually exists
          const fullPath = path.join(process.cwd(), 'public', student.profilePicturePath);
          if (fs.existsSync(fullPath)) {
            console.log(`   ${colors.green}✅ Profile picture file exists${colors.reset}`);
          } else {
            console.log(`   ${colors.red}❌ Profile picture file missing: ${fullPath}${colors.reset}`);
          }
        } else {
          console.log(`   ${colors.yellow}📭 No profile picture found${colors.reset}`);
        }
      }
      
      if (fixedCount > 0) {
        console.log(`\n${colors.green}✅ Fixed ${fixedCount} A Level student profile pictures${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error checking A Level students: ${error.message}${colors.reset}`);
    }

    console.log(`\n${colors.bold}${colors.green}🎉 Profile picture path fix complete!${colors.reset}`);
    console.log(`${colors.cyan}Students should now see their uploaded profile pictures in their accounts.${colors.reset}\n`);

    // Instructions for testing
    console.log(`${colors.bold}🧪 TO TEST:${colors.reset}`);
    console.log(`1. Start the development server: npm run dev`);
    console.log(`2. Login as a student`);
    console.log(`3. Check if profile picture appears in:`);
    console.log(`   - Dashboard banner`);
    console.log(`   - Navigation header`);
    console.log(`   - Profile page`);
    console.log(`4. If not working, check browser console for errors`);

  } catch (error) {
    console.error(`${colors.red}❌ Database error:${colors.reset}`, error.message);
  } finally {
    await client.end();
  }
}

// Run the fix
if (require.main === module) {
  fixProfilePicturePaths();
}

module.exports = { fixProfilePicturePaths };
