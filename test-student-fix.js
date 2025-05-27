#!/usr/bin/env node

/**
 * 🧪 Test Student Fix - Verify the "Student not found" issue is resolved
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

async function testStudentFix() {
  console.log(`${colors.bold}${colors.blue}🧪 Testing Student Fix${colors.reset}\n`);

  // 1. Test server connectivity
  console.log(`${colors.yellow}1. Testing server connectivity...${colors.reset}`);
  const serverTest = await makeRequest('GET', '/api/students');
  if (serverTest.status === 'ERROR' || serverTest.status === 'TIMEOUT') {
    console.log(`${colors.red}❌ Server not responding. Make sure to run: npm run dev${colors.reset}`);
    return;
  }
  console.log(`${colors.green}✅ Server is running${colors.reset}`);

  // 2. Test getting all students
  console.log(`\n${colors.yellow}2. Testing GET /api/students...${colors.reset}`);
  const studentsResponse = await makeRequest('GET', '/api/students');
  
  if (studentsResponse.status === 200) {
    const students = studentsResponse.body.data || [];
    console.log(`${colors.green}✅ Successfully fetched ${students.length} students${colors.reset}`);
    
    if (students.length > 0) {
      console.log(`${colors.blue}Available students:${colors.reset}`);
      students.slice(0, 3).forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.id} - ${student.fullName || student.name}`);
      });
      if (students.length > 3) {
        console.log(`  ... and ${students.length - 3} more`);
      }
    }
  } else {
    console.log(`${colors.red}❌ Failed to fetch students (${studentsResponse.status})${colors.reset}`);
  }

  // 3. Test demo student specifically
  console.log(`\n${colors.yellow}3. Testing demo student (demo-student)...${colors.reset}`);
  const demoResponse = await makeRequest('GET', '/api/students/demo-student');
  
  if (demoResponse.status === 200) {
    console.log(`${colors.green}✅ Demo student found successfully${colors.reset}`);
    const student = demoResponse.body.data;
    console.log(`   Name: ${student.fullName}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Subjects: ${student.subjects?.length || 0}`);
  } else {
    console.log(`${colors.red}❌ Demo student not found (${demoResponse.status})${colors.reset}`);
  }

  // 4. Test the old problematic ID
  console.log(`\n${colors.yellow}4. Testing old problematic ID (GCE2025-ST-003421)...${colors.reset}`);
  const oldIdResponse = await makeRequest('GET', '/api/students/GCE2025-ST-003421');
  
  if (oldIdResponse.status === 200) {
    console.log(`${colors.green}✅ Old ID now works (fallback to demo student)${colors.reset}`);
  } else if (oldIdResponse.status === 404) {
    console.log(`${colors.yellow}⚠️  Old ID not found (expected, but should fallback to demo)${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Unexpected response for old ID (${oldIdResponse.status})${colors.reset}`);
  }

  // 5. Test student authentication
  console.log(`\n${colors.yellow}5. Testing demo student login...${colors.reset}`);
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'demo.student@gce.cm',
    password: 'demo123',
    userType: 'student'
  });

  if (loginResponse.status === 200) {
    console.log(`${colors.green}✅ Demo student login successful${colors.reset}`);
    const userData = loginResponse.body.data;
    console.log(`   User ID: ${userData.id}`);
    console.log(`   Token: ${userData.token ? 'Generated' : 'Missing'}`);
    
    // 6. Test fetching the authenticated student's profile
    console.log(`\n${colors.yellow}6. Testing authenticated student profile...${colors.reset}`);
    const profileResponse = await makeRequest('GET', `/api/students/${userData.id}`);
    if (profileResponse.status === 200) {
      console.log(`${colors.green}✅ Authenticated student profile fetched successfully${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Failed to fetch authenticated student profile${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}❌ Demo student login failed (${loginResponse.status})${colors.reset}`);
    if (loginResponse.body.message) {
      console.log(`   Error: ${loginResponse.body.message}`);
    }
  }

  // 7. Test student results and exams
  console.log(`\n${colors.yellow}7. Testing student results and exams...${colors.reset}`);
  const resultsResponse = await makeRequest('GET', '/api/students/demo-student/results');
  const examsResponse = await makeRequest('GET', '/api/students/demo-student/exams');

  if (resultsResponse.status === 200) {
    console.log(`${colors.green}✅ Student results endpoint working${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Student results endpoint: ${resultsResponse.status}${colors.reset}`);
  }

  if (examsResponse.status === 200) {
    console.log(`${colors.green}✅ Student exams endpoint working${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Student exams endpoint: ${examsResponse.status}${colors.reset}`);
  }

  // Summary
  console.log(`\n${colors.bold}${colors.blue}📊 Test Summary${colors.reset}`);
  console.log(`${colors.green}✅ = Working correctly${colors.reset}`);
  console.log(`${colors.yellow}⚠️  = Minor issue or expected behavior${colors.reset}`);
  console.log(`${colors.red}❌ = Needs attention${colors.reset}`);
  
  console.log(`\n${colors.bold}🎯 Solution Applied:${colors.reset}`);
  console.log(`• Added demo student with ID 'demo-student'`);
  console.log(`• Updated student dashboard to use better ID resolution`);
  console.log(`• Enhanced student API endpoints with fallback logic`);
  console.log(`• Integrated with separate database authentication`);
  
  console.log(`\n${colors.bold}💡 For Frontend:${colors.reset}`);
  console.log(`• Use 'demo-student' as the default student ID`);
  console.log(`• After login, use the authenticated user's ID`);
  console.log(`• The dashboard will automatically handle missing students`);
  
  console.log(`\n${colors.bold}🔐 Demo Credentials:${colors.reset}`);
  console.log(`• Email: demo.student@gce.cm`);
  console.log(`• Password: demo123`);
  console.log(`• User Type: student`);
}

async function main() {
  try {
    await testStudentFix();
  } catch (error) {
    console.error(`${colors.red}❌ Test failed:${colors.reset}`, error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testStudentFix };
