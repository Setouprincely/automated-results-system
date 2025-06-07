#!/usr/bin/env node

/**
 * 🧪 Test Login Fix - Complete registration and login flow test
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
      timeout: 15000
    };
    
    const req = http.request(`${BASE_URL}${path}`, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: jsonBody, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, body: { error: 'Invalid JSON', raw: body }, rawBody: body });
        }
      });
    });
    
    req.on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
    req.on('timeout', () => resolve({ status: 'TIMEOUT' }));
    
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testLoginFix() {
  console.log(`${colors.bold}${colors.blue}🧪 Testing Login Fix - Complete Flow${colors.reset}\n`);

  // 1. Test server connectivity
  console.log(`${colors.yellow}1. Testing server connectivity...${colors.reset}`);
  const serverTest = await makeRequest('GET', '/');
  if (serverTest.status === 'ERROR' || serverTest.status === 'TIMEOUT') {
    console.log(`${colors.red}❌ Server not responding. Please start the server: npm run dev${colors.reset}`);
    return;
  }
  console.log(`${colors.green}✅ Server is running (Status: ${serverTest.status})${colors.reset}`);

  // 2. Test existing demo user login
  console.log(`\n${colors.yellow}2. Testing existing demo user login...${colors.reset}`);
  const demoLoginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'demo.student@gce.cm',
    password: 'demo123',
    userType: 'student'
  });

  console.log(`   Demo login status: ${demoLoginResponse.status}`);
  if (demoLoginResponse.status === 200) {
    console.log(`${colors.green}✅ Demo user login successful${colors.reset}`);
    const userData = demoLoginResponse.body.data;
    console.log(`   User ID: ${userData.id}`);
    console.log(`   Name: ${userData.name}`);
  } else {
    console.log(`${colors.red}❌ Demo user login failed${colors.reset}`);
    console.log(`   Response:`, demoLoginResponse.body);
  }

  // 3. Create a new test user
  console.log(`\n${colors.yellow}3. Creating new test user...${colors.reset}`);
  const timestamp = Date.now();
  const testUser = {
    fullName: 'Login Test User',
    email: `logintest${timestamp}@test.com`,
    password: 'LoginTest123!',
    userType: 'student',
    dateOfBirth: '2000-01-01',
    candidateNumber: `TEST${timestamp}`
  };

  console.log(`   Creating user: ${testUser.email}`);
  const registerResponse = await makeRequest('POST', '/api/auth/register', testUser);
  console.log(`   Registration status: ${registerResponse.status}`);
  
  if (registerResponse.status === 200) {
    console.log(`${colors.green}✅ User registered successfully${colors.reset}`);
    const newUser = registerResponse.body.data;
    console.log(`   User ID: ${newUser.id}`);
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Email: ${newUser.email}`);

    // 4. Immediately try to login with the newly created user
    console.log(`\n${colors.yellow}4. Testing login with newly created user...${colors.reset}`);
    console.log(`   Attempting login with: ${testUser.email} / ${testUser.password}`);
    
    const newUserLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password,
      userType: testUser.userType
    });

    console.log(`   New user login status: ${newUserLoginResponse.status}`);
    if (newUserLoginResponse.status === 200) {
      console.log(`${colors.green}✅ NEW USER LOGIN SUCCESSFUL! 🎉${colors.reset}`);
      const loginData = newUserLoginResponse.body.data;
      console.log(`   Logged in as: ${loginData.name}`);
      console.log(`   User ID: ${loginData.id}`);
      console.log(`   User Type: ${loginData.userType}`);
      console.log(`   Token: ${loginData.token ? 'Generated' : 'Missing'}`);
    } else {
      console.log(`${colors.red}❌ NEW USER LOGIN FAILED${colors.reset}`);
      console.log(`   Status: ${newUserLoginResponse.status}`);
      console.log(`   Response:`, newUserLoginResponse.body);
      console.log(`   Raw response:`, newUserLoginResponse.rawBody);
    }

    // 5. Test wrong password
    console.log(`\n${colors.yellow}5. Testing wrong password (should fail)...${colors.reset}`);
    const wrongPasswordResponse = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: 'WrongPassword123!',
      userType: testUser.userType
    });

    if (wrongPasswordResponse.status === 401) {
      console.log(`${colors.green}✅ Wrong password correctly rejected${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Wrong password was accepted (security issue!)${colors.reset}`);
    }

    // 6. Test wrong user type
    console.log(`\n${colors.yellow}6. Testing wrong user type (should fail)...${colors.reset}`);
    const wrongTypeResponse = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password,
      userType: 'admin'  // Wrong type
    });

    if (wrongTypeResponse.status === 401) {
      console.log(`${colors.green}✅ Wrong user type correctly rejected${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Wrong user type was accepted (security issue!)${colors.reset}`);
    }

  } else if (registerResponse.status === 409) {
    console.log(`${colors.yellow}⚠️  User already exists${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ User registration failed${colors.reset}`);
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Response:`, registerResponse.body);
    console.log(`   Raw response:`, registerResponse.rawBody);
  }

  // 7. Test all demo users
  console.log(`\n${colors.yellow}7. Testing all demo users...${colors.reset}`);
  const demoUsers = [
    { email: 'demo.student@gce.cm', password: 'demo123', userType: 'student', name: 'Demo Student' },
    { email: 'admin@gce.cm', password: 'admin123', userType: 'admin', name: 'Admin' },
    { email: 'sarah.mbeki@school.cm', password: 'teacher123', userType: 'teacher', name: 'Teacher' },
    { email: 'emmanuel.ndongo@examiner.cm', password: 'examiner123', userType: 'examiner', name: 'Examiner' }
  ];

  for (const user of demoUsers) {
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: user.email,
      password: user.password,
      userType: user.userType
    });

    if (loginResponse.status === 200) {
      console.log(`   ${colors.green}✅ ${user.name} login successful${colors.reset}`);
    } else {
      console.log(`   ${colors.red}❌ ${user.name} login failed (${loginResponse.status})${colors.reset}`);
    }
  }

  // Summary
  console.log(`\n${colors.bold}${colors.blue}📊 Test Summary${colors.reset}`);
  console.log(`${colors.green}✅ = Working correctly${colors.reset}`);
  console.log(`${colors.red}❌ = Issue detected${colors.reset}`);
  console.log(`${colors.yellow}⚠️  = Warning or expected behavior${colors.reset}`);
  
  console.log(`\n${colors.bold}🎯 Key Test Results:${colors.reset}`);
  console.log(`• Server connectivity: Check above`);
  console.log(`• Demo user login: Check above`);
  console.log(`• New user registration: Check above`);
  console.log(`• New user login: Check above`);
  console.log(`• Password security: Check above`);
  console.log(`• User type security: Check above`);
  
  console.log(`\n${colors.cyan}🔐 Demo Credentials for Manual Testing:${colors.reset}`);
  console.log(`${colors.yellow}Student:${colors.reset}  demo.student@gce.cm / demo123`);
  console.log(`${colors.yellow}Admin:${colors.reset}    admin@gce.cm / admin123`);
  console.log(`${colors.yellow}Teacher:${colors.reset}  sarah.mbeki@school.cm / teacher123`);
  console.log(`${colors.yellow}Examiner:${colors.reset} emmanuel.ndongo@examiner.cm / examiner123`);
  
  console.log(`\n${colors.cyan}🛠️  If login still fails:${colors.reset}`);
  console.log(`1. Check PostgreSQL is running`);
  console.log(`2. Verify .env DATABASE_URL is correct`);
  console.log(`3. Run: npx prisma db push`);
  console.log(`4. Run: npm run db:seed`);
  console.log(`5. Restart the development server`);
}

async function main() {
  try {
    await testLoginFix();
  } catch (error) {
    console.error(`${colors.red}❌ Test failed:${colors.reset}`, error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testLoginFix };
