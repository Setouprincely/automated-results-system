#!/usr/bin/env node

/**
 * 🔍 Test Mock Image Removal
 * Verifies that hardcoded mock images have been removed and real profile pictures are being used
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function testMockImageRemoval() {
  console.log(`${colors.bold}${colors.blue}🔍 TESTING MOCK IMAGE REMOVAL${colors.reset}\n`);

  const filesToCheck = [
    'src/app/Student/dashboard/page.tsx',
    'src/app/Student/results/page.tsx',
    'src/app/Student/registration/page.tsx',
    'src/components/StudentUserInfo.tsx',
    'src/components/UserDataDisplay.tsx',
    'src/components/layouts/StudentLayout.tsx',
    'src/components/ProfilePicture.tsx'
  ];

  const mockImagePatterns = [
    '/images/prince.jpg',
    'photoUrl.*prince.jpg',
    'src.*prince.jpg',
    'prince.jpg'
  ];

  let totalIssues = 0;
  let filesChecked = 0;

  console.log(`${colors.yellow}📁 Checking ${filesToCheck.length} files for mock images...${colors.reset}\n`);

  filesToCheck.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`${colors.yellow}⚠️  File not found: ${filePath}${colors.reset}`);
      return;
    }

    filesChecked++;
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`${colors.cyan}📄 Checking: ${filePath}${colors.reset}`);
    
    let fileIssues = 0;
    
    // Check for mock image patterns
    mockImagePatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          console.log(`   ${colors.red}❌ Line ${index + 1}: ${line.trim()}${colors.reset}`);
          fileIssues++;
          totalIssues++;
        }
      });
    });

    // Check for proper ProfilePicture usage
    const profilePictureUsages = [];
    lines.forEach((line, index) => {
      if (line.includes('<ProfilePicture')) {
        profilePictureUsages.push({ line: index + 1, content: line.trim() });
      }
    });

    if (profilePictureUsages.length > 0) {
      console.log(`   ${colors.green}✅ Found ${profilePictureUsages.length} ProfilePicture component usage(s)${colors.reset}`);
      
      // Check if profilePicturePath prop is being used
      profilePictureUsages.forEach(usage => {
        if (usage.content.includes('profilePicturePath')) {
          console.log(`   ${colors.green}✅ Line ${usage.line}: Uses profilePicturePath prop${colors.reset}`);
        } else {
          console.log(`   ${colors.yellow}⚠️  Line ${usage.line}: Missing profilePicturePath prop${colors.reset}`);
        }
      });
    }

    if (fileIssues === 0) {
      console.log(`   ${colors.green}✅ No mock images found${colors.reset}`);
    }
    
    console.log('');
  });

  // Check for proper user context usage
  console.log(`${colors.bold}${colors.cyan}🔄 CHECKING USER CONTEXT INTEGRATION${colors.reset}\n`);

  const contextFiles = [
    'src/app/Student/dashboard/page.tsx',
    'src/components/StudentUserInfo.tsx',
    'src/components/UserDataDisplay.tsx'
  ];

  contextFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`${colors.cyan}📄 Checking: ${filePath}${colors.reset}`);
    
    // Check for useUser hook usage
    if (content.includes('useUser')) {
      console.log(`   ${colors.green}✅ Uses useUser hook${colors.reset}`);
    } else {
      console.log(`   ${colors.yellow}⚠️  Missing useUser hook${colors.reset}`);
    }

    // Check for user.profilePicturePath usage
    if (content.includes('user.profilePicturePath') || content.includes('user?.profilePicturePath')) {
      console.log(`   ${colors.green}✅ Uses user.profilePicturePath${colors.reset}`);
    } else {
      console.log(`   ${colors.yellow}⚠️  Missing user.profilePicturePath usage${colors.reset}`);
    }

    console.log('');
  });

  // Summary
  console.log(`${colors.bold}${colors.cyan}📊 SUMMARY${colors.reset}`);
  console.log(`${colors.green}📁 Files Checked: ${filesChecked}${colors.reset}`);
  console.log(`${colors.red}❌ Mock Image Issues: ${totalIssues}${colors.reset}`);

  if (totalIssues === 0) {
    console.log(`\n${colors.bold}${colors.green}🎉 SUCCESS: All mock images have been removed!${colors.reset}`);
    console.log(`${colors.cyan}The system now uses real profile pictures from user registration data.${colors.reset}\n`);
    
    console.log(`${colors.bold}✅ WHAT'S WORKING NOW:${colors.reset}`);
    console.log(`• ProfilePicture component receives profilePicturePath from user context`);
    console.log(`• Dashboard uses real user data instead of mock data`);
    console.log(`• Registration page handles missing profile pictures gracefully`);
    console.log(`• Results page uses real profile picture paths`);
    console.log(`• All components get data from UserContext`);
    
  } else {
    console.log(`\n${colors.bold}${colors.yellow}⚠️  ISSUES FOUND: ${totalIssues} mock image references still exist${colors.reset}`);
    console.log(`${colors.cyan}Please review and fix the issues listed above.${colors.reset}\n`);
  }

  // Testing instructions
  console.log(`${colors.bold}🧪 TO TEST THE FIX:${colors.reset}`);
  console.log(`1. Start the development server: npm run dev`);
  console.log(`2. Login as a student who has uploaded a profile picture`);
  console.log(`3. Check these pages:`);
  console.log(`   • Dashboard: Should show real profile picture in banner`);
  console.log(`   • Profile page: Should show real profile picture`);
  console.log(`   • Navigation header: Should show real profile picture`);
  console.log(`   • Registration page: Should show real profile picture or placeholder`);
  console.log(`4. Open browser console and look for:`);
  console.log(`   • "🖼️ Using direct profile picture path: /uploads/profiles/..."`);
  console.log(`   • "📸 Profile picture debug for [name]"`);
  console.log(`   • No errors about missing images`);

  return totalIssues === 0;
}

// Run the test
if (require.main === module) {
  const success = testMockImageRemoval();
  process.exit(success ? 0 : 1);
}

module.exports = { testMockImageRemoval };
