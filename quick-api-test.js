#!/usr/bin/env node

/**
 * 🚀 Quick API Test - Test key endpoints to verify your setup
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
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };

    const req = http.request(url, options, (res) => {
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

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testEndpoint(method, path, description) {
  try {
    console.log(`${colors.blue}Testing:${colors.reset} ${description}`);
    const response = await makeRequest(method, path);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`${colors.green}✅ PASS:${colors.reset} ${description} (${response.status})`);
      return true;
    } else if (response.status === 401) {
      console.log(`${colors.yellow}🔐 AUTH:${colors.reset} ${description} (${response.status}) - Requires authentication`);
      return true; // Count as pass since it's expected
    } else {
      console.log(`${colors.red}❌ FAIL:${colors.reset} ${description} (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR:${colors.reset} ${description} - ${error.message}`);
    return false;
  }
}

async function runQuickTest() {
  console.log(`${colors.bold}${colors.blue}🚀 Quick API Test${colors.reset}`);
  console.log(`${colors.blue}Testing key endpoints...${colors.reset}\n`);

  const tests = [
    // Public endpoints (should work without auth)
    ['GET', '/api/students', 'Get all students'],
    ['GET', '/api/registration/subjects', 'Get all subjects'],
    ['GET', '/api/examinations/centers', 'Get exam centers'],
    ['GET', '/api/examinations/schedule', 'Get exam schedules'],
    ['GET', '/api/admin/dashboard/stats', 'Get admin dashboard stats'],
    ['GET', '/api/grading/grade-boundaries', 'Get grade boundaries'],
    ['GET', '/api/marking/scores', 'Get marking scores'],
    ['GET', '/api/results/certificates', 'Get certificates'],
    ['GET', '/api/reports/templates', 'Get report templates'],
    ['GET', '/api/registration/schools', 'Get schools'],
    
    // Auth endpoints
    ['GET', '/api/auth/register', 'Get all users'],
    ['POST', '/api/auth/forgot-password', 'Forgot password'],
    
    // Endpoints that might require auth (401 is acceptable)
    ['GET', '/api/examinations/attendance', 'Get attendance (may require auth)'],
    ['GET', '/api/admin/audit-logs', 'Get audit logs (may require auth)'],
    ['GET', '/api/analytics/performance/student', 'Get student analytics (may require auth)'],
  ];

  let passed = 0;
  let total = tests.length;

  for (const [method, path, description] of tests) {
    if (await testEndpoint(method, path, description)) {
      passed++;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }

  console.log(`\n${colors.bold}📊 Quick Test Results:${colors.reset}`);
  console.log(`${colors.green}Passed:${colors.reset} ${passed}/${total}`);
  console.log(`${colors.yellow}Success Rate:${colors.reset} ${((passed / total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log(`\n${colors.green}🎉 All tests passed! Your API setup is working correctly.${colors.reset}`);
  } else if (passed >= total * 0.8) {
    console.log(`\n${colors.yellow}⚠️  Most tests passed. Some endpoints may require authentication or have issues.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Many tests failed. Check your server and API routes.${colors.reset}`);
  }

  console.log(`\n${colors.blue}💡 Tips:${colors.reset}`);
  console.log(`- Make sure your dev server is running: ${colors.bold}npm run dev${colors.reset}`);
  console.log(`- Some endpoints require authentication (401 responses are normal)`);
  console.log(`- Run the full test suite: ${colors.bold}node test-all-apis.js${colors.reset}`);
  console.log(`- Use the browser tester: ${colors.bold}http://localhost:3000/api-tester.html${colors.reset}`);
}

if (require.main === module) {
  runQuickTest().catch(console.error);
}

module.exports = { runQuickTest };
