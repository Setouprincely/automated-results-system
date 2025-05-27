#!/usr/bin/env node

/**
 * 🔐 Test Separate Database Authentication
 * This script tests that each account type has its own isolated authentication
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function makeRequest(method, path, data = null) {
  return new Promise((resolve) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };
    
    const req = http.request(`${BASE_URL}${path}`, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });
    
    req.on('error', () => resolve({ status: 'ERROR' }));
    req.on('timeout', () => resolve({ status: 'TIMEOUT' }));
    
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function registerUser(userType, email, password, fullName) {
  const userData = {
    fullName,
    email,
    password,
    userType,
    dateOfBirth: '1990-01-01',
    school: userType === 'teacher' ? 'Test School' : undefined,
    candidateNumber: userType === 'student' ? 'TEST123' : undefined
  };

  const response = await makeRequest('POST', '/api/auth/register', userData);
  return response;
}

async function loginUser(userType, email, password) {
  const loginData = {
    email,
    password,
    userType
  };

  const response = await makeRequest('POST', '/api/auth/login', loginData);
  return response;
}

async function testSeparateAuthentication() {
  console.log(`${colors.bold}${colors.blue}🔐 Testing Separate Database Authentication${colors.reset}\n`);

  // Test data for different user types
  const testUsers = [
    { userType: 'student', email: 'student@test.com', password: 'Student123!', fullName: 'Test Student' },
    { userType: 'teacher', email: 'teacher@test.com', password: 'Teacher123!', fullName: 'Test Teacher' },
    { userType: 'examiner', email: 'examiner@test.com', password: 'Examiner123!', fullName: 'Test Examiner' },
    { userType: 'admin', email: 'admin@test.com', password: 'Admin123!', fullName: 'Test Admin' }
  ];

  console.log(`${colors.yellow}📝 Step 1: Registering test users...${colors.reset}`);
  
  // Register users in each database
  for (const user of testUsers) {
    const response = await registerUser(user.userType, user.email, user.password, user.fullName);
    if (response.status === 200 || response.status === 409) {
      console.log(`${colors.green}✅${colors.reset} ${user.userType}: ${user.email} registered/exists`);
    } else {
      console.log(`${colors.red}❌${colors.reset} ${user.userType}: ${user.email} registration failed (${response.status})`);
    }
  }

  console.log(`\n${colors.yellow}🔒 Step 2: Testing correct authentication...${colors.reset}`);
  
  // Test correct authentication (should work)
  for (const user of testUsers) {
    const response = await loginUser(user.userType, user.email, user.password);
    if (response.status === 200) {
      console.log(`${colors.green}✅${colors.reset} ${user.userType} login with correct credentials: SUCCESS`);
    } else {
      console.log(`${colors.red}❌${colors.reset} ${user.userType} login with correct credentials: FAILED (${response.status})`);
      if (response.body.message) {
        console.log(`   Error: ${response.body.message}`);
      }
    }
  }

  console.log(`\n${colors.yellow}🚫 Step 3: Testing cross-account type authentication (should fail)...${colors.reset}`);
  
  // Test cross-authentication (should fail)
  const crossTests = [
    { attempt: 'student credentials with admin account type', email: 'student@test.com', password: 'Student123!', userType: 'admin' },
    { attempt: 'admin credentials with student account type', email: 'admin@test.com', password: 'Admin123!', userType: 'student' },
    { attempt: 'teacher credentials with examiner account type', email: 'teacher@test.com', password: 'Teacher123!', userType: 'examiner' },
    { attempt: 'examiner credentials with teacher account type', email: 'examiner@test.com', password: 'Examiner123!', userType: 'teacher' }
  ];

  for (const test of crossTests) {
    const response = await loginUser(test.userType, test.email, test.password);
    if (response.status === 401) {
      console.log(`${colors.green}✅${colors.reset} ${test.attempt}: CORRECTLY BLOCKED`);
    } else {
      console.log(`${colors.red}❌${colors.reset} ${test.attempt}: SECURITY BREACH! (${response.status})`);
    }
  }

  console.log(`\n${colors.yellow}🔍 Step 4: Testing with wrong passwords (should fail)...${colors.reset}`);
  
  // Test wrong passwords
  for (const user of testUsers) {
    const response = await loginUser(user.userType, user.email, 'WrongPassword123!');
    if (response.status === 401) {
      console.log(`${colors.green}✅${colors.reset} ${user.userType} with wrong password: CORRECTLY BLOCKED`);
    } else {
      console.log(`${colors.red}❌${colors.reset} ${user.userType} with wrong password: SECURITY BREACH! (${response.status})`);
    }
  }

  console.log(`\n${colors.yellow}📧 Step 5: Testing same email across different account types...${colors.reset}`);
  
  // Test registering same email in different account types (should be blocked)
  const sameEmailTests = [
    { userType: 'student', email: 'same@test.com', password: 'Student123!', fullName: 'Same Email Student' },
    { userType: 'teacher', email: 'same@test.com', password: 'Teacher123!', fullName: 'Same Email Teacher' }
  ];

  // Register first user
  const firstResponse = await registerUser(sameEmailTests[0].userType, sameEmailTests[0].email, sameEmailTests[0].password, sameEmailTests[0].fullName);
  if (firstResponse.status === 200) {
    console.log(`${colors.green}✅${colors.reset} First registration (${sameEmailTests[0].userType}): SUCCESS`);
    
    // Try to register same email with different user type
    const secondResponse = await registerUser(sameEmailTests[1].userType, sameEmailTests[1].email, sameEmailTests[1].password, sameEmailTests[1].fullName);
    if (secondResponse.status === 409) {
      console.log(`${colors.green}✅${colors.reset} Second registration (${sameEmailTests[1].userType}) with same email: CORRECTLY BLOCKED`);
    } else {
      console.log(`${colors.red}❌${colors.reset} Second registration (${sameEmailTests[1].userType}) with same email: ALLOWED (${secondResponse.status})`);
    }
  } else {
    console.log(`${colors.yellow}⚠️${colors.reset} First registration failed, skipping same email test`);
  }

  console.log(`\n${colors.bold}${colors.blue}📊 Test Summary${colors.reset}`);
  console.log(`${colors.green}✅ = Security working correctly${colors.reset}`);
  console.log(`${colors.red}❌ = Security issue detected${colors.reset}`);
  console.log(`${colors.yellow}⚠️ = Test skipped or inconclusive${colors.reset}`);
  
  console.log(`\n${colors.bold}🎯 Expected Results:${colors.reset}`);
  console.log(`• Users can only login with their own account type`);
  console.log(`• Cross-account type authentication is blocked`);
  console.log(`• Wrong passwords are rejected`);
  console.log(`• Same email cannot be used across different account types`);
  
  console.log(`\n${colors.cyan}💡 This ensures that:${colors.reset}`);
  console.log(`• Students cannot login with admin credentials`);
  console.log(`• Admins cannot login with student credentials`);
  console.log(`• Each account type has its own isolated database`);
  console.log(`• Account type selection is enforced at authentication level`);
}

async function main() {
  try {
    await testSeparateAuthentication();
  } catch (error) {
    console.error(`${colors.red}❌ Test failed:${colors.reset}`, error.message);
    console.log(`${colors.yellow}💡 Make sure your development server is running: npm run dev${colors.reset}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testSeparateAuthentication };
