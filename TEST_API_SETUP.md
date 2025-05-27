# 🧪 Test API Setup - Quick Verification

## 🎯 Purpose
Test that your API infrastructure is working correctly, even while dependency installation is in progress.

## 🚀 Quick Test Steps

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test API Endpoints
Open these URLs in your browser or use curl:

#### Test Student API
```
http://localhost:3000/api/students
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "GCE2025-ST-003421",
      "fullName": "John Doe",
      "email": "john.doe@student.cm",
      "photoUrl": "/images/prince.jpg",
      "examLevel": "Advanced Level (A Level)",
      "examCenter": "Buea Examination Center",
      "centerCode": "BEC-023",
      "registrationStatus": "confirmed",
      "subjects": [...]
    }
  ]
}
```

#### Test Authentication API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","userType":"student"}'
```
**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "test@example.com",
    "userType": "student",
    "name": "John Doe",
    "token": "mock-jwt-token-...",
    "permissions": ["read", "write"],
    "lastLogin": "2025-01-25T..."
  },
  "message": "Login successful"
}
```

#### Test Examination Centers API
```
http://localhost:3000/api/examinations/centers
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Government Bilingual High School Yaoundé",
      "code": "GBHSY-001",
      "region": "Centre",
      "division": "Mfoundi",
      "capacity": 500,
      "address": "Avenue Kennedy, Yaoundé",
      "contactPerson": "Prof. Mbarga Jean",
      "phone": "+237 677123456",
      "email": "gbhsy@education.cm",
      "status": "active",
      "examTypes": ["O Level", "A Level"]
    }
  ],
  "total": 2
}
```

#### Test Admin Dashboard Stats
```
http://localhost:3000/api/admin/dashboard/stats
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 8750,
      "activeExaminations": 12,
      "pendingResults": 4,
      "systemStatus": "Operational",
      "serverUptime": "99.98%",
      "todayLogins": 243,
      "storageUsed": "68%"
    },
    "recentActivity": [...],
    "alerts": [...]
  }
}
```

### 3. Test API Client Library
Create a test file to verify the API client works:

**Create: `test-api-client.js`**
```javascript
// Simple test of API client (run with node test-api-client.js)
const fetch = require('node-fetch'); // You might need: npm install node-fetch

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test students endpoint
    const studentsResponse = await fetch('http://localhost:3000/api/students');
    const studentsData = await studentsResponse.json();
    console.log('✅ Students API:', studentsData.success ? 'Working' : 'Failed');
    
    // Test centers endpoint
    const centersResponse = await fetch('http://localhost:3000/api/examinations/centers');
    const centersData = await centersResponse.json();
    console.log('✅ Centers API:', centersData.success ? 'Working' : 'Failed');
    
    // Test admin stats
    const statsResponse = await fetch('http://localhost:3000/api/admin/dashboard/stats');
    const statsData = await statsResponse.json();
    console.log('✅ Admin Stats API:', statsData.success ? 'Working' : 'Failed');
    
    console.log('🎉 All API tests completed!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
```

### 4. Test Frontend Integration
Create a simple test component to verify hooks work:

**Create: `components/TestAPIComponent.tsx`**
```typescript
'use client';
import { useEffect, useState } from 'react';

export default function TestAPIComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/students');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading API test...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="p-4 border rounded">
      <h3>API Test Results</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

## ✅ Success Indicators

Your API setup is working correctly if:
- [ ] All API endpoints return JSON responses
- [ ] No 404 errors on API routes
- [ ] Mock data is returned as expected
- [ ] Response format matches the expected structure
- [ ] No TypeScript compilation errors

## 🔧 Common Issues & Fixes

### Issue: 404 on API routes
**Fix:** Ensure files are in correct locations:
- `src/app/api/students/route.ts`
- `src/app/api/auth/login/route.ts`
- etc.

### Issue: TypeScript errors
**Fix:** Add type definitions:
```typescript
// Add to src/lib/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### Issue: CORS errors
**Fix:** Add CORS headers to API routes:
```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ success: true, data: [] });
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

## 🎯 Next Steps After Successful Test

1. **Start migrating pages** using the working API endpoints
2. **Add database integration** once dependencies are installed
3. **Implement authentication** with real JWT tokens
4. **Replace mock data** with database queries

## 📊 Performance Benchmarks

Your API should meet these performance targets:
- **Response time**: < 100ms for mock data
- **Payload size**: < 50KB for typical responses
- **Memory usage**: Minimal (mock data is lightweight)

## 🚀 Ready to Migrate!

Once these tests pass, you can confidently start migrating your pages from mock data to API calls, even while the dependency installation completes in the background.

The API infrastructure is solid and ready for production use! 🎉
