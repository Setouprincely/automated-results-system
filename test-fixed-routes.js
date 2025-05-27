#!/usr/bin/env node

// Quick test for the routes we just fixed
const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve('ERROR'));
    req.setTimeout(5000, () => resolve('TIMEOUT'));
  });
}

async function testFixedRoutes() {
  console.log('🧪 Testing fixed routes...');
  
  const routes = [
    '/api/users/change-password',
    '/api/admin/notifications/broadcast',
    '/api/admin/restore',
    '/api/schools/dashboard',
    '/api/results/school',
    '/api/results/student'
  ];
  
  for (const route of routes) {
    const status = await testRoute(route);
    const icon = status === 200 ? '✅' : status === 401 ? '🔐' : '❌';
    console.log(`${icon} ${route} - ${status}`);
  }
}

testFixedRoutes();
