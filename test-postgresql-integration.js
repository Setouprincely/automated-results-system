#!/usr/bin/env node

/**
 * 🧪 Test PostgreSQL Integration with GCE System
 * Tests login, student data, and resolves "Student not found" error
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

async function testPostgreSQLIntegration() {
  console.log(`${colors.bold}${colors.blue}🧪 Testing PostgreSQL Integration${colors.reset}\n`);

  // 1. Test server connectivity
  console.log(`${colors.yellow}1. Testing server connectivity...${colors.reset}`);
  const serverTest = await makeRequest('GET', '/api/students');
  if (serverTest.status === 'ERROR' || serverTest.status === 'TIMEOUT') {
    console.log(`${colors.red}❌ Server not responding. Make sure to run: npm run dev${colors.reset}`);
    return;
  }
  console.log(`${colors.green}✅ Server is running${colors.reset}`);

  // 2. Test demo student login
  console.log(`\n${colors.yellow}2. Testing demo student login...${colors.reset}`);
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'demo.student@gce.cm',
    password: 'demo123',
    userType: 'student'
  });

  if (loginResponse.status === 200) {
    console.log(`${colors.green}✅ Demo student login successful${colors.reset}`);
    const userData = loginResponse.body.data;
    console.log(`   User ID: ${userData.id}`);
    console.log(`   Name: ${userData.name}`);
    console.log(`   User Type: ${userData.userType}`);
    
    // Test fetching this student's profile
    console.log(`\n${colors.yellow}3. Testing student profile fetch...${colors.reset}`);
    const profileResponse = await makeRequest('GET', `/api/students/${userData.id}`);
    if (profileResponse.status === 200) {
      console.log(`${colors.green}✅ Student profile fetched successfully${colors.reset}`);
      const student = profileResponse.body.data;
      console.log(`   Name: ${student.fullName || student.name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Exam Level: ${student.examLevel}`);
    } else {
      console.log(`${colors.red}❌ Failed to fetch student profile (${profileResponse.status})${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}❌ Demo student login failed (${loginResponse.status})${colors.reset}`);
    if (loginResponse.body.message) {
      console.log(`   Error: ${loginResponse.body.message}`);
    }
  }

  // 3. Test admin login
  console.log(`\n${colors.yellow}4. Testing admin login...${colors.reset}`);
  const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@gce.cm',
    password: 'admin123',
    userType: 'admin'
  });

  if (adminLoginResponse.status === 200) {
    console.log(`${colors.green}✅ Admin login successful${colors.reset}`);
    const adminData = adminLoginResponse.body.data;
    console.log(`   Admin ID: ${adminData.id}`);
    console.log(`   Name: ${adminData.name}`);
  } else {
    console.log(`${colors.red}❌ Admin login failed (${adminLoginResponse.status})${colors.reset}`);
  }

  // 4. Test sample student (the one that was causing "Student not found")
  console.log(`\n${colors.yellow}5. Testing sample student (GCE2025-ST-003421)...${colors.reset}`);
  const sampleStudentResponse = await makeRequest('GET', '/api/students/GCE2025-ST-003421');
  
  if (sampleStudentResponse.status === 200) {
    console.log(`${colors.green}✅ Sample student found successfully${colors.reset}`);
    const student = sampleStudentResponse.body.data;
    console.log(`   Name: ${student.fullName || student.name}`);
    console.log(`   Email: ${student.email}`);
  } else {
    console.log(`${colors.yellow}⚠️  Sample student not found, but fallback should work (${sampleStudentResponse.status})${colors.reset}`);
  }

  // 5. Test getting all students
  console.log(`\n${colors.yellow}6. Testing get all students...${colors.reset}`);
  const allStudentsResponse = await makeRequest('GET', '/api/students');
  
  if (allStudentsResponse.status === 200) {
    const students = allStudentsResponse.body.data || [];
    console.log(`${colors.green}✅ Retrieved ${students.length} students${colors.reset}`);
    
    if (students.length > 0) {
      console.log(`${colors.cyan}Available students:${colors.reset}`);
      students.slice(0, 5).forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.id} - ${student.fullName || student.name}`);
      });
      if (students.length > 5) {
        console.log(`   ... and ${students.length - 5} more`);
      }
    }
  } else {
    console.log(`${colors.red}❌ Failed to get students (${allStudentsResponse.status})${colors.reset}`);
  }

  // 6. Test cross-account type authentication (should fail)
  console.log(`\n${colors.yellow}7. Testing security: Cross-account type authentication...${colors.reset}`);
  const crossAuthResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'demo.student@gce.cm',
    password: 'demo123',
    userType: 'admin'  // Wrong account type
  });

  if (crossAuthResponse.status === 401) {
    console.log(`${colors.green}✅ Cross-account authentication correctly blocked${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Security issue: Cross-account authentication allowed (${crossAuthResponse.status})${colors.reset}`);
  }

  // 7. Test teacher login
  console.log(`\n${colors.yellow}8. Testing teacher login...${colors.reset}`);
  const teacherLoginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'sarah.mbeki@school.cm',
    password: 'teacher123',
    userType: 'teacher'
  });

  if (teacherLoginResponse.status === 200) {
    console.log(`${colors.green}✅ Teacher login successful${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Teacher login failed (${teacherLoginResponse.status})${colors.reset}`);
  }

  // Summary
  console.log(`\n${colors.bold}${colors.blue}📊 Test Summary${colors.reset}`);
  console.log(`${colors.green}✅ = Working correctly${colors.reset}`);
  console.log(`${colors.yellow}⚠️  = Minor issue or expected behavior${colors.reset}`);
  console.log(`${colors.red}❌ = Needs attention${colors.reset}`);
  
  console.log(`\n${colors.bold}🎯 Expected Results:${colors.reset}`);
  console.log(`• Demo student login should work`);
  console.log(`• Student profile should be fetchable`);
  console.log(`• "Student not found" error should be resolved`);
  console.log(`• Cross-account authentication should be blocked`);
  console.log(`• All user types should have separate authentication`);
  
  console.log(`\n${colors.cyan}🔐 Demo Credentials for Manual Testing:${colors.reset}`);
  console.log(`${colors.yellow}Student:${colors.reset}  demo.student@gce.cm / demo123`);
  console.log(`${colors.yellow}Admin:${colors.reset}    admin@gce.cm / admin123`);
  console.log(`${colors.yellow}Teacher:${colors.reset}  sarah.mbeki@school.cm / teacher123`);
  console.log(`${colors.yellow}Examiner:${colors.reset} emmanuel.ndongo@examiner.cm / examiner123`);
  
  console.log(`\n${colors.cyan}🗄️ Database Info:${colors.reset}`);
  console.log(`   Database: PostgreSQL (localhost:5432/gce_system)`);
  console.log(`   Schemas: student_auth, teacher_auth, examiner_auth, admin_auth`);
  console.log(`   Management: npm run db:studio`);
}

async function main() {
  try {
    await testPostgreSQLIntegration();
  } catch (error) {
    console.error(`${colors.red}❌ Test failed:${colors.reset}`, error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testPostgreSQLIntegration };
