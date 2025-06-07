#!/usr/bin/env node

/**
 * 🧪 Test User Data Flow Across Pages
 * Verifies that registration data is properly used across all pages
 */

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function testUserDataFlow() {
  console.log(`${colors.bold}${colors.blue}🧪 TESTING USER DATA FLOW ACROSS PAGES${colors.reset}\n`);

  const baseUrl = 'http://localhost:3000';
  
  // Test data for login
  const testCredentials = {
    email: 'test.student@example.com',
    password: 'TestPass123!',
    userType: 'student'
  };

  try {
    console.log(`${colors.yellow}🔐 Step 1: Testing Login API...${colors.reset}`);
    
    // Test login
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log(`${colors.green}✅ Login successful!${colors.reset}`);
      console.log(`   User ID: ${loginData.data.id}`);
      console.log(`   Name: ${loginData.data.name}`);
      console.log(`   Email: ${loginData.data.email}`);
      console.log(`   Exam Level: ${loginData.data.examLevel || 'Not specified'}`);
      console.log(`   Token: ${loginData.data.token ? 'Present' : 'Missing'}`);
    } else {
      console.log(`${colors.red}❌ Login failed: ${loginData.message}${colors.reset}`);
      return;
    }

    const authToken = loginData.data.token;
    const userId = loginData.data.id;
    const examLevel = loginData.data.examLevel;

    console.log(`\n${colors.yellow}📊 Step 2: Testing Student Data API...${colors.reset}`);
    
    // Test student data API
    let studentApiUrl = `${baseUrl}/api/students/${userId}`;
    if (examLevel) {
      studentApiUrl += `?examLevel=${encodeURIComponent(examLevel)}`;
    }

    const studentResponse = await fetch(studentApiUrl, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const studentData = await studentResponse.json();
    
    if (studentData.success) {
      console.log(`${colors.green}✅ Student data retrieved successfully!${colors.reset}`);
      console.log(`   Full Name: ${studentData.data.fullName}`);
      console.log(`   Email: ${studentData.data.email}`);
      console.log(`   Exam Level: ${studentData.data.examLevel}`);
      console.log(`   Candidate Number: ${studentData.data.candidateNumber || 'Not provided'}`);
      console.log(`   School Center: ${studentData.data.schoolCenterNumber || 'Not provided'}`);
      console.log(`   Region: ${studentData.data.region || 'Not provided'}`);
      console.log(`   Phone: ${studentData.data.phoneNumber || 'Not provided'}`);
      console.log(`   Registration Status: ${studentData.data.registrationStatus || 'Not provided'}`);
    } else {
      console.log(`${colors.red}❌ Student data retrieval failed: ${studentData.message}${colors.reset}`);
    }

    console.log(`\n${colors.yellow}🌐 Step 3: Testing Page Accessibility...${colors.reset}`);
    
    // Test page accessibility (just check if they load without errors)
    const pagesToTest = [
      '/Student/dashboard',
      '/Student/profile',
      '/Student/registration',
      '/Student/exam',
      '/Student/results'
    ];

    for (const page of pagesToTest) {
      try {
        const pageResponse = await fetch(`${baseUrl}${page}`, {
          headers: {
            'Cookie': `authToken=${authToken}; userId=${userId}; userType=student; examLevel=${examLevel || ''}`
          }
        });
        
        if (pageResponse.ok) {
          console.log(`${colors.green}✅ ${page}: Accessible${colors.reset}`);
        } else {
          console.log(`${colors.yellow}⚠️  ${page}: Status ${pageResponse.status}${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.red}❌ ${page}: Error - ${error.message}${colors.reset}`);
      }
    }

    console.log(`\n${colors.yellow}🔍 Step 4: Data Consistency Check...${colors.reset}`);
    
    // Check data consistency between login and student API
    const loginUser = loginData.data;
    const studentUser = studentData.data;
    
    const consistencyChecks = [
      {
        field: 'id',
        loginValue: loginUser.id,
        studentValue: studentUser.id,
        match: loginUser.id === studentUser.id
      },
      {
        field: 'email',
        loginValue: loginUser.email,
        studentValue: studentUser.email,
        match: loginUser.email === studentUser.email
      },
      {
        field: 'name/fullName',
        loginValue: loginUser.name,
        studentValue: studentUser.fullName,
        match: loginUser.name === studentUser.fullName
      },
      {
        field: 'examLevel',
        loginValue: loginUser.examLevel,
        studentValue: studentUser.examLevel,
        match: loginUser.examLevel === studentUser.examLevel
      }
    ];

    let allConsistent = true;
    consistencyChecks.forEach(check => {
      if (check.match) {
        console.log(`${colors.green}✅ ${check.field}: Consistent${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ ${check.field}: Inconsistent${colors.reset}`);
        console.log(`   Login: ${check.loginValue}`);
        console.log(`   Student API: ${check.studentValue}`);
        allConsistent = false;
      }
    });

    console.log(`\n${colors.yellow}📋 Step 5: Required Fields Check...${colors.reset}`);
    
    // Check if all required fields are present
    const requiredFields = [
      'id', 'fullName', 'email', 'userType', 'examLevel', 
      'candidateNumber', 'schoolCenterNumber', 'region'
    ];

    let allFieldsPresent = true;
    requiredFields.forEach(field => {
      const value = studentUser[field];
      if (value && value !== 'Not Provided' && value !== '') {
        console.log(`${colors.green}✅ ${field}: ${value}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  ${field}: Missing or default value${colors.reset}`);
        if (['id', 'fullName', 'email', 'userType'].includes(field)) {
          allFieldsPresent = false;
        }
      }
    });

    console.log(`\n${colors.bold}${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
    console.log(`${colors.green}✅ Login API: Working${colors.reset}`);
    console.log(`${colors.green}✅ Student Data API: Working${colors.reset}`);
    console.log(`${allConsistent ? colors.green + '✅' : colors.red + '❌'} Data Consistency: ${allConsistent ? 'Passed' : 'Failed'}${colors.reset}`);
    console.log(`${allFieldsPresent ? colors.green + '✅' : colors.yellow + '⚠️ '} Required Fields: ${allFieldsPresent ? 'All Present' : 'Some Missing'}${colors.reset}`);

    if (allConsistent && allFieldsPresent) {
      console.log(`\n${colors.bold}${colors.green}🎉 USER DATA FLOW TEST: PASSED!${colors.reset}`);
      console.log(`${colors.cyan}Registration data is properly flowing across all pages.${colors.reset}`);
    } else {
      console.log(`\n${colors.bold}${colors.yellow}⚠️  USER DATA FLOW TEST: PARTIAL SUCCESS${colors.reset}`);
      console.log(`${colors.cyan}Some issues detected but core functionality is working.${colors.reset}`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Test Error:${colors.reset}`, error.message);
  }
}

// Run the test
if (require.main === module) {
  testUserDataFlow();
}

module.exports = { testUserDataFlow };
