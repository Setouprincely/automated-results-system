#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testRoute(method, path, data = null) {
  return new Promise((resolve) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000
    };
    
    const req = http.request(`${BASE_URL}${path}`, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    
    req.on('error', () => resolve({ status: 'ERROR' }));
    req.on('timeout', () => resolve({ status: 'TIMEOUT' }));
    
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testFixedRoutes() {
  console.log('🧪 Testing fixed routes...');
  
  const tests = [
    // Test auth routes (should work now)
    ['POST', '/api/auth/register', { fullName: 'Test User', email: 'test@example.com', password: 'Password123!', userType: 'student' }],
    ['POST', '/api/auth/login', { email: 'admin@gce.cm', password: 'admin123' }],
    
    // Test analytics routes (should return 200 now)
    ['GET', '/api/analytics/performance/student'],
    ['GET', '/api/analytics/performance/school'],
    ['GET', '/api/analytics/performance/region'],
    
    // Test routes that had 405 errors (should return 200 or 401 now)
    ['GET', '/api/examinations/materials'],
    ['GET', '/api/marking/scores'],
    ['GET', '/api/results/generate'],
    
    // Test user profile (should not timeout)
    ['GET', '/api/users/profile']
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [method, path, data] of tests) {
    const result = await testRoute(method, path, data);
    const success = result.status === 200 || result.status === 401 || result.status === 409;
    const icon = success ? '✅' : '❌';
    
    console.log(`${icon} ${method} ${path} - ${result.status}`);
    if (success) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${total} passed (${((passed/total)*100).toFixed(1)}%)`);
}

testFixedRoutes();
