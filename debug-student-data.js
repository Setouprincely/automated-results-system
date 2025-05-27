#!/usr/bin/env node

/**
 * 🔍 Debug Student Data - Check what students are available in the system
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

async function debugStudentData() {
  console.log(`${colors.bold}${colors.blue}🔍 Debugging Student Data${colors.reset}\n`);

  // 1. Check if server is running
  console.log(`${colors.yellow}1. Testing server connectivity...${colors.reset}`);
  const serverTest = await makeRequest('GET', '/api/students');
  if (serverTest.status === 'ERROR' || serverTest.status === 'TIMEOUT') {
    console.log(`${colors.red}❌ Server not responding. Make sure to run: npm run dev${colors.reset}`);
    return;
  }
  console.log(`${colors.green}✅ Server is running${colors.reset}`);

  // 2. Get all students
  console.log(`\n${colors.yellow}2. Fetching all students...${colors.reset}`);
  const studentsResponse = await makeRequest('GET', '/api/students');
  
  if (studentsResponse.status === 200) {
    const students = studentsResponse.body.data || [];
    console.log(`${colors.green}✅ Found ${students.length} students${colors.reset}`);
    
    if (students.length > 0) {
      console.log(`\n${colors.cyan}Student List:${colors.reset}`);
      students.forEach((student, index) => {
        console.log(`  ${index + 1}. ID: ${student.id || 'N/A'}`);
        console.log(`     Name: ${student.fullName || student.name || 'N/A'}`);
        console.log(`     Email: ${student.email || 'N/A'}`);
        console.log(`     Type: ${student.userType || 'N/A'}`);
        console.log(`     Status: ${student.registrationStatus || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log(`${colors.yellow}⚠️  No students found in the system${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}❌ Failed to fetch students (${studentsResponse.status})${colors.reset}`);
    if (studentsResponse.body.message) {
      console.log(`   Error: ${studentsResponse.body.message}`);
    }
  }

  // 3. Test specific student IDs
  console.log(`\n${colors.yellow}3. Testing specific student IDs...${colors.reset}`);
  const testIds = [
    'GCE2025-ST-003421', // Common test ID
    'GCE2025-ST-001',    // Another test ID
    'student-1',         // Simple ID
    'test-student'       // Another simple ID
  ];

  for (const testId of testIds) {
    const response = await makeRequest('GET', `/api/students/${testId}`);
    if (response.status === 200) {
      console.log(`${colors.green}✅ Found student: ${testId}${colors.reset}`);
      const student = response.body.data;
      console.log(`   Name: ${student.fullName || student.name || 'N/A'}`);
    } else if (response.status === 404) {
      console.log(`${colors.yellow}⚠️  Student not found: ${testId}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Error fetching ${testId}: ${response.status}${colors.reset}`);
    }
  }

  // 4. Register a test student
  console.log(`\n${colors.yellow}4. Registering a test student...${colors.reset}`);
  const testStudent = {
    fullName: 'Debug Test Student',
    email: 'debug.student@test.com',
    password: 'TestPassword123!',
    userType: 'student',
    dateOfBirth: '2000-01-01',
    candidateNumber: 'DEBUG123'
  };

  const registerResponse = await makeRequest('POST', '/api/auth/register', testStudent);
  if (registerResponse.status === 200) {
    console.log(`${colors.green}✅ Test student registered successfully${colors.reset}`);
    const newStudent = registerResponse.body.data;
    console.log(`   ID: ${newStudent.id}`);
    console.log(`   Name: ${newStudent.name}`);
    
    // Try to fetch the newly registered student
    console.log(`\n${colors.yellow}5. Fetching newly registered student...${colors.reset}`);
    const fetchResponse = await makeRequest('GET', `/api/students/${newStudent.id}`);
    if (fetchResponse.status === 200) {
      console.log(`${colors.green}✅ Successfully fetched newly registered student${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Failed to fetch newly registered student${colors.reset}`);
    }
  } else if (registerResponse.status === 409) {
    console.log(`${colors.yellow}⚠️  Test student already exists${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Failed to register test student (${registerResponse.status})${colors.reset}`);
    if (registerResponse.body.message) {
      console.log(`   Error: ${registerResponse.body.message}`);
    }
  }

  // 6. Check authentication
  console.log(`\n${colors.yellow}6. Testing student authentication...${colors.reset}`);
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'debug.student@test.com',
    password: 'TestPassword123!',
    userType: 'student'
  });

  if (loginResponse.status === 200) {
    console.log(`${colors.green}✅ Student authentication successful${colors.reset}`);
    const userData = loginResponse.body.data;
    console.log(`   User ID: ${userData.id}`);
    console.log(`   User Type: ${userData.userType}`);
    
    // Try to fetch this student's profile
    console.log(`\n${colors.yellow}7. Fetching authenticated student profile...${colors.reset}`);
    const profileResponse = await makeRequest('GET', `/api/students/${userData.id}`);
    if (profileResponse.status === 200) {
      console.log(`${colors.green}✅ Successfully fetched authenticated student profile${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Failed to fetch authenticated student profile${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}❌ Student authentication failed (${loginResponse.status})${colors.reset}`);
  }

  // Summary
  console.log(`\n${colors.bold}${colors.blue}📊 Debug Summary${colors.reset}`);
  console.log(`${colors.cyan}If you're getting "Student not found" errors:${colors.reset}`);
  console.log(`1. Make sure you're using the correct student ID`);
  console.log(`2. Register a student first if none exist`);
  console.log(`3. Check that the student is in the correct database (student vs mock)`);
  console.log(`4. Verify the API endpoints are working correctly`);
  
  console.log(`\n${colors.cyan}Common student IDs to try:${colors.reset}`);
  console.log(`• Use the IDs shown in the student list above`);
  console.log(`• Register a new student and use that ID`);
  console.log(`• Check your frontend code for the ID being requested`);
}

async function main() {
  try {
    await debugStudentData();
  } catch (error) {
    console.error(`${colors.red}❌ Debug failed:${colors.reset}`, error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { debugStudentData };
