// Quick verification script to test API migration
// Run with: node verify-migration.js

const fetch = require('node-fetch');

async function verifyAPIMigration() {
  console.log('🧪 Verifying API Migration...\n');

  const tests = [
    {
      name: 'Students API',
      url: 'http://localhost:3000/api/students',
      expectedFields: ['id', 'fullName', 'email', 'photoUrl']
    },
    {
      name: 'Admin Dashboard Stats',
      url: 'http://localhost:3000/api/admin/dashboard/stats',
      expectedFields: ['stats', 'recentActivity', 'alerts']
    },
    {
      name: 'Examination Centers',
      url: 'http://localhost:3000/api/examinations/centers',
      expectedFields: ['data', 'total']
    },
    {
      name: 'Authentication (POST)',
      url: 'http://localhost:3000/api/auth/login',
      method: 'POST',
      body: { email: 'test@example.com', password: 'password', userType: 'admin' },
      expectedFields: ['success', 'user', 'message']
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      
      const options = {
        method: test.method || 'GET',
        headers: { 'Content-Type': 'application/json' }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      const data = await response.json();

      if (response.ok && data.success !== false) {
        // Check if expected fields exist
        const hasExpectedFields = test.expectedFields.every(field => {
          return data.hasOwnProperty(field) || (data.data && data.data.hasOwnProperty(field));
        });

        if (hasExpectedFields) {
          console.log(`✅ ${test.name}: PASSED`);
          passedTests++;
        } else {
          console.log(`❌ ${test.name}: FAILED - Missing expected fields`);
          console.log(`   Expected: ${test.expectedFields.join(', ')}`);
          console.log(`   Got: ${Object.keys(data).join(', ')}`);
        }
      } else {
        console.log(`❌ ${test.name}: FAILED - HTTP ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
    }
    console.log('');
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All API endpoints are working correctly!');
    console.log('\n✅ Next Steps:');
    console.log('1. Your Admin Dashboard is now using real API data');
    console.log('2. You can start migrating other pages using the same pattern');
    console.log('3. Check the browser at http://localhost:3000/admin/dashboard');
  } else {
    console.log('⚠️  Some tests failed. Check the server is running and API routes are correct.');
  }
}

// Run the verification
verifyAPIMigration().catch(console.error);
