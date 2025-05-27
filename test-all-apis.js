#!/usr/bin/env node

/**
 * 🧪 Comprehensive API Testing Script for GCE System
 *
 * This script tests all your API endpoints automatically
 * Run with: node test-all-apis.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedEndpoints = [];

// Authentication token storage
let authToken = null;

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...headers
      },
      timeout: TIMEOUT
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Test an API endpoint
 */
async function testEndpoint(method, path, expectedStatus = 200, data = null, description = '') {
  totalTests++;
  const testName = `${method} ${path}${description ? ' - ' + description : ''}`;

  try {
    console.log(`${colors.blue}Testing:${colors.reset} ${testName}`);
    const response = await makeRequest(method, path, data);

    // Handle multiple expected status codes
    const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];

    if (expectedStatuses.includes(response.status)) {
      console.log(`${colors.green}✅ PASS:${colors.reset} ${testName} (${response.status})`);
      passedTests++;
      return response;
    } else {
      console.log(`${colors.red}❌ FAIL:${colors.reset} ${testName} - Expected ${expectedStatuses.join(' or ')}, got ${response.status}`);
      failedTests++;
      failedEndpoints.push({ method, path, expected: expectedStatuses, actual: response.status });
      return response;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR:${colors.reset} ${testName} - ${error.message}`);
    failedTests++;
    failedEndpoints.push({ method, path, error: error.message });
    return null;
  }
}

/**
 * Setup authentication for testing
 */
async function setupAuthentication() {
  console.log(`\n${colors.bold}${colors.blue}🔑 Setting up authentication...${colors.reset}`);

  // First, try to register a test user
  const registerData = {
    fullName: "Test User",
    email: "test@example.com",
    password: "Password123!",
    userType: "admin", // Use admin for broader access
    dateOfBirth: "2000-01-01"
  };

  try {
    const registerResponse = await makeRequest('POST', '/api/auth/register', registerData);
    if (registerResponse.status === 200 || registerResponse.status === 409) {
      console.log(`${colors.green}✅ Test user ready${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Registration skipped: ${error.message}${colors.reset}`);
  }

  // Try to login and get token
  const loginData = {
    email: "test@example.com",
    password: "Password123!"
  };

  try {
    const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
    if (loginResponse.status === 200 && loginResponse.body.data?.token) {
      authToken = loginResponse.body.data.token;
      console.log(`${colors.green}✅ Authentication token obtained${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️  Login failed, testing without authentication${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Authentication setup failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test Authentication APIs
 */
async function testAuthAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}🔐 Testing Authentication APIs${colors.reset}`);

  // Test user registration
  const registerData = {
    fullName: "Test User 2",
    email: "test2@example.com",
    password: "Password123!",
    userType: "student",
    dateOfBirth: "2000-01-01"
  };

  await testEndpoint('POST', '/api/auth/register', 200, registerData, 'Register new user');
  await testEndpoint('GET', '/api/auth/register', 200, null, 'Get all users');

  // Test login
  const loginData = {
    email: "test@example.com",
    password: "Password123!"
  };

  const loginResponse = await testEndpoint('POST', '/api/auth/login', 200, loginData, 'User login');

  // Test other auth endpoints (these might require auth)
  await testEndpoint('POST', '/api/auth/logout', [200, 401], null, 'User logout');
  await testEndpoint('POST', '/api/auth/refresh-token', [400, 401], {}, 'Refresh token (no token)');
  await testEndpoint('POST', '/api/auth/forgot-password', 200, { email: "test@example.com" }, 'Forgot password');
  await testEndpoint('GET', '/api/auth/forgot-password?token=invalid', 400, null, 'Verify reset token');
  await testEndpoint('POST', '/api/auth/verify-email', 200, { email: "test@example.com", userId: "test-id" }, 'Send verification email');
  await testEndpoint('GET', '/api/auth/verify-email?token=invalid', 400, null, 'Verify email token');

  return loginResponse;
}

/**
 * Test Student APIs
 */
async function testStudentAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}🎓 Testing Student APIs${colors.reset}`);

  await testEndpoint('GET', '/api/students', 200, null, 'Get all students');
  await testEndpoint('GET', '/api/students/GCE2025-ST-003421', 200, null, 'Get student by ID');
  await testEndpoint('GET', '/api/students/invalid-id', 404, null, 'Get non-existent student');
  await testEndpoint('GET', '/api/students/GCE2025-ST-003421/results', 200, null, 'Get student results');
  await testEndpoint('GET', '/api/students/GCE2025-ST-003421/exams', 200, null, 'Get student exams');
}

/**
 * Test Registration APIs
 */
async function testRegistrationAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}📝 Testing Registration APIs${colors.reset}`);

  await testEndpoint('GET', '/api/registration/subjects', 200, null, 'Get all subjects');
  await testEndpoint('GET', '/api/registration/subjects?level=O%20Level', 200, null, 'Get O Level subjects');
  await testEndpoint('GET', '/api/registration/subjects?category=core', 200, null, 'Get core subjects');

  await testEndpoint('GET', '/api/registration/schools', 200, null, 'Get all schools');
  await testEndpoint('GET', '/api/registration/students/search', 200, null, 'Search students');
  await testEndpoint('GET', '/api/registration/students/search?q=john', 200, null, 'Search students by name');

  // Test payment endpoints
  await testEndpoint('GET', '/api/registration/payment/status/invalid-id', 404, null, 'Get payment status');
  await testEndpoint('GET', '/api/registration/confirmation/invalid-id', 404, null, 'Get confirmation');
}

/**
 * Test Examination APIs
 */
async function testExaminationAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}🏫 Testing Examination APIs${colors.reset}`);

  await testEndpoint('GET', '/api/examinations/centers', 200, null, 'Get exam centers');
  await testEndpoint('GET', '/api/examinations/centers?region=Centre', 200, null, 'Get centers by region');
  await testEndpoint('GET', '/api/examinations/centers?centerType=primary', 200, null, 'Get centers by type');

  await testEndpoint('GET', '/api/examinations/schedule', 200, null, 'Get exam schedules');
  await testEndpoint('GET', '/api/examinations/schedule?examLevel=O%20Level', 200, null, 'Get O Level schedules');

  // These might require authentication
  await testEndpoint('GET', '/api/examinations/materials', [200, 401], null, 'Get exam materials');
  await testEndpoint('GET', '/api/examinations/attendance', [200, 401], null, 'Get attendance records');
  await testEndpoint('GET', '/api/examinations/incidents', [200, 401], null, 'Get incident reports');
  await testEndpoint('GET', '/api/examinations/assign-invigilators', [200, 401], null, 'Get invigilator assignments');
}

/**
 * Test Grading APIs
 */
async function testGradingAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}📊 Testing Grading APIs${colors.reset}`);

  await testEndpoint('GET', '/api/grading/grade-boundaries', 200, null, 'Get grade boundaries');
  await testEndpoint('GET', '/api/grading/quality-assurance', [200, 401], null, 'Get QA dashboard');
}

/**
 * Test Marking APIs
 */
async function testMarkingAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}✏️ Testing Marking APIs${colors.reset}`);

  await testEndpoint('GET', '/api/marking/scores', 200, null, 'Get marking scores');
  await testEndpoint('GET', '/api/marking/allocate-scripts', 200, null, 'Get script allocations');
  await testEndpoint('GET', '/api/marking/chief-examiner-review', [200, 401], null, 'Get chief examiner reviews');
  await testEndpoint('GET', '/api/marking/performance-analytics', [200, 401], null, 'Get marking analytics');
  await testEndpoint('GET', '/api/marking/verify-double-marking', [200, 401], null, 'Get double marking verifications');
}

/**
 * Test Results APIs
 */
async function testResultsAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}📋 Testing Results APIs${colors.reset}`);

  await testEndpoint('GET', '/api/results/certificates', 200, null, 'Get certificates');
  await testEndpoint('GET', '/api/results/statistics', [200, 401], null, 'Get result statistics');
  await testEndpoint('GET', '/api/results/notifications', 200, null, 'Get result notifications');
  await testEndpoint('GET', '/api/results/generate', 200, null, 'Get result generation status');
  await testEndpoint('GET', '/api/results/publish', 200, null, 'Get publication status');
  await testEndpoint('POST', '/api/results/verify', 200, { verificationType: 'result', studentNumber: 'test123' }, 'Test verification');
}

/**
 * Test Admin APIs
 */
async function testAdminAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}👑 Testing Admin APIs${colors.reset}`);

  await testEndpoint('GET', '/api/admin/dashboard/stats', 200, null, 'Get admin dashboard stats');
  await testEndpoint('GET', '/api/admin/system-health', [200, 401], null, 'Get system health');
  await testEndpoint('GET', '/api/admin/audit-logs', [200, 401], null, 'Get audit logs');
  await testEndpoint('GET', '/api/admin/user-activity', [200, 401], null, 'Get user activity');
  await testEndpoint('GET', '/api/admin/bulk-operations', [200, 401], null, 'Get bulk operations');
  await testEndpoint('GET', '/api/admin/system-config', [200, 401], null, 'Get system config');
  await testEndpoint('GET', '/api/admin/statistics/dashboard', [200, 401], null, 'Get admin statistics');
}

/**
 * Test Analytics APIs
 */
async function testAnalyticsAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}📈 Testing Analytics APIs${colors.reset}`);

  await testEndpoint('GET', '/api/analytics/performance/student', [200, 401], null, 'Get student performance');
  await testEndpoint('GET', '/api/analytics/performance/school', [200, 401], null, 'Get school performance');
  await testEndpoint('GET', '/api/analytics/performance/region', [200, 401], null, 'Get region performance');
  await testEndpoint('GET', '/api/analytics/subject-performance', [200, 401], null, 'Get subject performance');
  await testEndpoint('GET', '/api/analytics/comparative-analysis', [200, 401], null, 'Get comparative analysis');
  await testEndpoint('GET', '/api/analytics/examiner-metrics', [200, 401], null, 'Get examiner metrics');
}

/**
 * Test Reports APIs
 */
async function testReportsAPIs() {
  console.log(`\n${colors.bold}${colors.yellow}📄 Testing Reports APIs${colors.reset}`);

  await testEndpoint('GET', '/api/reports/templates', 200, null, 'Get report templates');
  await testEndpoint('GET', '/api/reports/custom', 200, null, 'Get custom reports');
}

/**
 * Print test summary
 */
function printSummary() {
  console.log(`\n${colors.bold}${colors.blue}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.bold}Total Tests:${colors.reset} ${totalTests}`);
  console.log(`${colors.green}Passed:${colors.reset} ${passedTests}`);
  console.log(`${colors.red}Failed:${colors.reset} ${failedTests}`);
  console.log(`${colors.yellow}Success Rate:${colors.reset} ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedEndpoints.length > 0) {
    console.log(`\n${colors.red}❌ Failed Endpoints:${colors.reset}`);
    failedEndpoints.forEach(endpoint => {
      if (endpoint.error) {
        console.log(`  ${endpoint.method} ${endpoint.path} - ${endpoint.error}`);
      } else {
        console.log(`  ${endpoint.method} ${endpoint.path} - Expected ${endpoint.expected}, got ${endpoint.actual}`);
      }
    });
  }

  console.log(`\n${colors.bold}${passedTests === totalTests ? colors.green + '🎉 All tests passed!' : colors.yellow + '⚠️  Some tests failed. Check the details above.'}${colors.reset}`);
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}🧪 Starting Comprehensive API Testing${colors.reset}`);
  console.log(`${colors.blue}Base URL:${colors.reset} ${BASE_URL}`);
  console.log(`${colors.blue}Timeout:${colors.reset} ${TIMEOUT}ms\n`);

  try {
    // Test if server is running
    await testEndpoint('GET', '/api/students', 200, null, 'Server connectivity check');

    // Setup authentication
    await setupAuthentication();

    // Run all test suites
    await testAuthAPIs();
    await testStudentAPIs();
    await testRegistrationAPIs();
    await testExaminationAPIs();
    await testGradingAPIs();
    await testMarkingAPIs();
    await testResultsAPIs();
    await testAdminAPIs();
    await testAnalyticsAPIs();
    await testReportsAPIs();

  } catch (error) {
    console.log(`${colors.red}❌ Fatal Error:${colors.reset} ${error.message}`);
    console.log(`${colors.yellow}Make sure your development server is running: npm run dev${colors.reset}`);
  }

  printSummary();
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testEndpoint };
