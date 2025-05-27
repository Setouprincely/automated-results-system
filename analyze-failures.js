#!/usr/bin/env node

/**
 * 🔍 Analyze API Failures - Identify and categorize the remaining 21 failures
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

// Authentication token storage
let authToken = null;

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      timeout: 5000
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: jsonBody, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, body: {}, rawBody: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function setupAuth() {
  console.log(`${colors.blue}🔑 Setting up authentication...${colors.reset}`);
  
  try {
    // Try to register admin user
    const registerData = {
      fullName: "Test Admin",
      email: "admin@test.com",
      password: "Password123!",
      userType: "admin",
      dateOfBirth: "2000-01-01"
    };
    
    await makeRequest('POST', '/api/auth/register', registerData);
    
    // Login to get token
    const loginData = {
      email: "admin@test.com",
      password: "Password123!"
    };
    
    const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
    if (loginResponse.status === 200 && loginResponse.body.data?.token) {
      authToken = loginResponse.body.data.token;
      console.log(`${colors.green}✅ Authentication token obtained${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Auth setup failed: ${error.message}${colors.reset}`);
  }
  return false;
}

async function analyzeEndpoint(method, path, description) {
  try {
    const response = await makeRequest(method, path);
    
    const result = {
      method,
      path,
      description,
      status: response.status,
      success: response.body.success,
      message: response.body.message || '',
      category: 'unknown',
      issue: '',
      fix: ''
    };

    // Categorize the response
    if (response.status >= 200 && response.status < 300) {
      result.category = 'success';
      result.issue = 'None';
      result.fix = 'Working correctly';
    } else if (response.status === 401) {
      result.category = 'auth_required';
      result.issue = 'Requires authentication';
      result.fix = 'Normal behavior for protected endpoints';
    } else if (response.status === 403) {
      result.category = 'forbidden';
      result.issue = 'Insufficient permissions';
      result.fix = 'Check user role/permissions';
    } else if (response.status === 404) {
      result.category = 'not_found';
      result.issue = 'Route not found';
      result.fix = 'Check if route file exists';
    } else if (response.status === 500) {
      result.category = 'server_error';
      result.issue = 'Internal server error';
      result.fix = 'Check server logs for details';
    } else if (response.status === 400) {
      result.category = 'bad_request';
      result.issue = 'Bad request/validation error';
      result.fix = 'Check request format/required fields';
    } else {
      result.category = 'other';
      result.issue = `HTTP ${response.status}`;
      result.fix = 'Investigate specific status code';
    }

    return result;
  } catch (error) {
    return {
      method,
      path,
      description,
      status: 'ERROR',
      category: 'network_error',
      issue: error.message,
      fix: 'Check if server is running'
    };
  }
}

async function analyzeAllEndpoints() {
  console.log(`${colors.bold}${colors.blue}🔍 Analyzing API Endpoints${colors.reset}\n`);

  // Setup authentication first
  await setupAuth();

  const endpoints = [
    // Authentication APIs
    ['POST', '/api/auth/register', 'Register user'],
    ['GET', '/api/auth/register', 'Get all users'],
    ['POST', '/api/auth/login', 'User login'],
    ['POST', '/api/auth/logout', 'User logout'],
    ['POST', '/api/auth/refresh-token', 'Refresh token'],
    ['POST', '/api/auth/forgot-password', 'Forgot password'],
    ['GET', '/api/auth/forgot-password?token=test', 'Verify reset token'],
    ['POST', '/api/auth/verify-email', 'Send verification email'],
    ['GET', '/api/auth/verify-email?token=test', 'Verify email token'],
    ['POST', '/api/auth/enable-2fa', 'Enable 2FA'],
    ['POST', '/api/auth/disable-2fa', 'Disable 2FA'],
    ['POST', '/api/auth/verify-2fa', 'Verify 2FA'],

    // Student APIs
    ['GET', '/api/students', 'Get all students'],
    ['GET', '/api/students/GCE2025-ST-003421', 'Get student by ID'],
    ['GET', '/api/students/GCE2025-ST-003421/results', 'Get student results'],
    ['GET', '/api/students/GCE2025-ST-003421/exams', 'Get student exams'],

    // Registration APIs
    ['GET', '/api/registration/subjects', 'Get all subjects'],
    ['GET', '/api/registration/schools', 'Get all schools'],
    ['GET', '/api/registration/students/search', 'Search students'],
    ['POST', '/api/registration/student', 'Register student'],
    ['POST', '/api/registration/payment', 'Process payment'],
    ['GET', '/api/registration/payment/status/test-id', 'Get payment status'],

    // Examination APIs
    ['GET', '/api/examinations/centers', 'Get exam centers'],
    ['GET', '/api/examinations/schedule', 'Get exam schedules'],
    ['GET', '/api/examinations/materials', 'Get exam materials'],
    ['GET', '/api/examinations/attendance', 'Get attendance records'],
    ['GET', '/api/examinations/incidents', 'Get incident reports'],
    ['GET', '/api/examinations/assign-invigilators', 'Get invigilator assignments'],

    // Grading & Marking APIs
    ['GET', '/api/grading/grade-boundaries', 'Get grade boundaries'],
    ['GET', '/api/grading/quality-assurance', 'Get QA dashboard'],
    ['GET', '/api/marking/scores', 'Get marking scores'],
    ['GET', '/api/marking/allocate-scripts', 'Get script allocations'],
    ['GET', '/api/marking/chief-examiner-review', 'Get chief examiner reviews'],
    ['GET', '/api/marking/performance-analytics', 'Get marking analytics'],

    // Results APIs
    ['GET', '/api/results/certificates', 'Get certificates'],
    ['GET', '/api/results/statistics', 'Get result statistics'],
    ['GET', '/api/results/notifications', 'Get result notifications'],
    ['GET', '/api/results/generate', 'Get result generation status'],
    ['GET', '/api/results/publish', 'Get publication status'],
    ['POST', '/api/results/verify', 'Verify results'],

    // Admin APIs
    ['GET', '/api/admin/dashboard/stats', 'Get admin dashboard stats'],
    ['GET', '/api/admin/system-health', 'Get system health'],
    ['GET', '/api/admin/audit-logs', 'Get audit logs'],
    ['GET', '/api/admin/user-activity', 'Get user activity'],
    ['GET', '/api/admin/bulk-operations', 'Get bulk operations'],
    ['GET', '/api/admin/system-config', 'Get system config'],

    // Analytics APIs
    ['GET', '/api/analytics/performance/student', 'Get student performance'],
    ['GET', '/api/analytics/performance/school', 'Get school performance'],
    ['GET', '/api/analytics/performance/region', 'Get region performance'],
    ['GET', '/api/analytics/subject-performance', 'Get subject performance'],
    ['GET', '/api/analytics/comparative-analysis', 'Get comparative analysis'],
    ['GET', '/api/analytics/examiner-metrics', 'Get examiner metrics'],

    // Reports APIs
    ['GET', '/api/reports/templates', 'Get report templates'],
    ['GET', '/api/reports/custom', 'Get custom reports'],

    // User Management APIs
    ['GET', '/api/users/search', 'Search users'],
    ['GET', '/api/users/profile', 'Get user profile'],
    ['POST', '/api/users/create', 'Create user'],
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  console.log(`${colors.blue}Testing ${endpoints.length} endpoints...${colors.reset}\n`);

  for (const [method, path, description] of endpoints) {
    const result = await analyzeEndpoint(method, path, description);
    results.push(result);

    if (result.category === 'success' || result.category === 'auth_required') {
      passed++;
      console.log(`${colors.green}✅${colors.reset} ${result.description}`);
    } else {
      failed++;
      console.log(`${colors.red}❌${colors.reset} ${result.description} - ${result.issue}`);
    }

    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
  }

  // Analyze results
  console.log(`\n${colors.bold}📊 Analysis Results${colors.reset}`);
  console.log(`${colors.green}Passed:${colors.reset} ${passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${failed}`);
  console.log(`${colors.yellow}Success Rate:${colors.reset} ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  // Categorize failures
  const categories = {};
  results.filter(r => r.category !== 'success' && r.category !== 'auth_required').forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = [];
    }
    categories[result.category].push(result);
  });

  console.log(`${colors.bold}🔍 Failure Analysis${colors.reset}`);
  
  Object.keys(categories).forEach(category => {
    const items = categories[category];
    console.log(`\n${colors.cyan}${category.toUpperCase().replace('_', ' ')} (${items.length})${colors.reset}`);
    items.forEach(item => {
      console.log(`  ${colors.red}❌${colors.reset} ${item.method} ${item.path}`);
      console.log(`     Issue: ${item.issue}`);
      console.log(`     Fix: ${item.fix}`);
    });
  });

  // Provide recommendations
  console.log(`\n${colors.bold}💡 Recommendations${colors.reset}`);
  
  if (categories.not_found) {
    console.log(`${colors.yellow}📁 Missing Routes (${categories.not_found.length})${colors.reset}`);
    console.log(`   Create missing route.ts files for 404 endpoints`);
  }
  
  if (categories.server_error) {
    console.log(`${colors.red}🔥 Server Errors (${categories.server_error.length})${colors.reset}`);
    console.log(`   Check server console for detailed error messages`);
  }
  
  if (categories.bad_request) {
    console.log(`${colors.orange}📝 Bad Requests (${categories.bad_request.length})${colors.reset}`);
    console.log(`   Check request format and required fields`);
  }

  console.log(`\n${colors.green}🎯 Your API infrastructure is ${((passed / (passed + failed)) * 100).toFixed(1)}% functional!${colors.reset}`);
}

if (require.main === module) {
  analyzeAllEndpoints().catch(console.error);
}

module.exports = { analyzeAllEndpoints };
