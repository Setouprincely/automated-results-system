#!/usr/bin/env node

/**
 * 🔍 Debug Login Issue - Test registration and login flow
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
      timeout: 10000
    };
    
    const req = http.request(`${BASE_URL}${path}`, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: jsonBody, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, body: body, rawBody: body });
        }
      });
    });
    
    req.on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
    req.on('timeout', () => resolve({ status: 'TIMEOUT' }));
    
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function debugLoginIssue() {
  console.log(`${colors.bold}${colors.blue}🔍 Debugging Login Issue${colors.reset}\n`);

  // 1. Test server connectivity
  console.log(`${colors.yellow}1. Testing server connectivity...${colors.reset}`);
  const serverTest = await makeRequest('GET', '/api/students');
  if (serverTest.status === 'ERROR' || serverTest.status === 'TIMEOUT') {
    console.log(`${colors.red}❌ Server not responding. Make sure to run: npm run dev${colors.reset}`);
    return;
  }
  console.log(`${colors.green}✅ Server is running${colors.reset}`);

  // 2. Test existing demo user login
  console.log(`\n${colors.yellow}2. Testing existing demo user login...${colors.reset}`);
  const demoLoginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'demo.student@gce.cm',
    password: 'demo123',
    userType: 'student'
  });

  console.log(`Demo login status: ${demoLoginResponse.status}`);
  if (demoLoginResponse.status === 200) {
    console.log(`${colors.green}✅ Demo user login works${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Demo user login failed${colors.reset}`);
    console.log(`Response:`, demoLoginResponse.body);
  }

  // 3. Create a new test user
  console.log(`\n${colors.yellow}3. Creating new test user...${colors.reset}`);
  const testUser = {
    fullName: 'Test User Debug',
    email: 'testuser@debug.com',
    password: 'TestPass123!',
    userType: 'student',
    dateOfBirth: '2000-01-01',
    candidateNumber: 'TEST123'
  };

  const registerResponse = await makeRequest('POST', '/api/auth/register', testUser);
  console.log(`Registration status: ${registerResponse.status}`);
  
  if (registerResponse.status === 200) {
    console.log(`${colors.green}✅ User registered successfully${colors.reset}`);
    const newUser = registerResponse.body.data;
    console.log(`   User ID: ${newUser.id}`);
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Email: ${newUser.email}`);

    // 4. Try to login with the newly created user
    console.log(`\n${colors.yellow}4. Testing login with newly created user...${colors.reset}`);
    const newUserLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password,
      userType: testUser.userType
    });

    console.log(`New user login status: ${newUserLoginResponse.status}`);
    if (newUserLoginResponse.status === 200) {
      console.log(`${colors.green}✅ New user login successful${colors.reset}`);
      const loginData = newUserLoginResponse.body.data;
      console.log(`   Logged in as: ${loginData.name}`);
      console.log(`   User ID: ${loginData.id}`);
    } else {
      console.log(`${colors.red}❌ New user login failed${colors.reset}`);
      console.log(`Response:`, newUserLoginResponse.body);
      console.log(`Raw response:`, newUserLoginResponse.rawBody);
    }

    // 5. Check if user exists in database
    console.log(`\n${colors.yellow}5. Checking if user exists in database...${colors.reset}`);
    const allStudentsResponse = await makeRequest('GET', '/api/students');
    if (allStudentsResponse.status === 200) {
      const students = allStudentsResponse.body.data || [];
      const foundUser = students.find(s => s.email === testUser.email);
      if (foundUser) {
        console.log(`${colors.green}✅ User found in database${colors.reset}`);
        console.log(`   Database ID: ${foundUser.id}`);
        console.log(`   Database Name: ${foundUser.fullName || foundUser.name}`);
        console.log(`   Database Email: ${foundUser.email}`);
        console.log(`   Database User Type: ${foundUser.userType}`);
      } else {
        console.log(`${colors.red}❌ User NOT found in database${colors.reset}`);
        console.log(`Available students: ${students.length}`);
        students.slice(0, 3).forEach(s => {
          console.log(`   - ${s.email} (${s.id})`);
        });
      }
    }

  } else if (registerResponse.status === 409) {
    console.log(`${colors.yellow}⚠️  User already exists, testing login...${colors.reset}`);
    
    // Try to login with existing user
    const existingUserLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password,
      userType: testUser.userType
    });

    console.log(`Existing user login status: ${existingUserLoginResponse.status}`);
    if (existingUserLoginResponse.status === 200) {
      console.log(`${colors.green}✅ Existing user login successful${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Existing user login failed${colors.reset}`);
      console.log(`Response:`, existingUserLoginResponse.body);
    }
  } else {
    console.log(`${colors.red}❌ User registration failed${colors.reset}`);
    console.log(`Response:`, registerResponse.body);
    console.log(`Raw response:`, registerResponse.rawBody);
  }

  // 6. Test password hashing consistency
  console.log(`\n${colors.yellow}6. Testing password hashing...${colors.reset}`);
  
  // Test with a simple password verification
  const simpleTestResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@gce.cm',
    password: 'admin123',
    userType: 'admin'
  });

  console.log(`Admin login status: ${simpleTestResponse.status}`);
  if (simpleTestResponse.status === 200) {
    console.log(`${colors.green}✅ Admin login works (password hashing is consistent)${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Admin login failed (password hashing issue)${colors.reset}`);
    console.log(`Response:`, simpleTestResponse.body);
  }

  // Summary
  console.log(`\n${colors.bold}${colors.blue}📊 Debug Summary${colors.reset}`);
  console.log(`${colors.cyan}Possible issues:${colors.reset}`);
  console.log(`1. Password hashing mismatch between registration and login`);
  console.log(`2. Database connection issues`);
  console.log(`3. User type validation problems`);
  console.log(`4. Email case sensitivity issues`);
  console.log(`5. Async/await issues in database operations`);
  
  console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
  console.log(`1. Check database connection`);
  console.log(`2. Verify password hashing consistency`);
  console.log(`3. Test with PostgreSQL directly`);
  console.log(`4. Check API route implementations`);
}

async function main() {
  try {
    await debugLoginIssue();
  } catch (error) {
    console.error(`${colors.red}❌ Debug failed:${colors.reset}`, error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { debugLoginIssue };
