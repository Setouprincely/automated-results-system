# 🧪 Complete API Testing Guide for GCE System

## 🎯 Overview
This guide helps you verify all the API endpoints you've created for the GCE Automated Results System.

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Your server should be running at `http://localhost:3000`

### 2. Testing Methods

#### Method A: Browser Testing (GET endpoints only)
Simply open URLs in your browser

#### Method B: Using curl (All HTTP methods)
```bash
# GET request
curl -X GET "http://localhost:3000/api/students"

# POST request
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Method C: Using Postman/Insomnia
Import the collection or manually create requests

#### Method D: Using VS Code REST Client
Create `.http` files with requests

## 📋 API Endpoints Checklist

### 🔐 Authentication APIs
- [ ] `POST /api/auth/login` - User login
- [ ] `POST /api/auth/register` - User registration  
- [ ] `GET /api/auth/register` - Get all users (admin)
- [ ] `POST /api/auth/logout` - User logout
- [ ] `POST /api/auth/refresh-token` - Refresh access token
- [ ] `POST /api/auth/forgot-password` - Request password reset
- [ ] `GET /api/auth/forgot-password` - Verify reset token
- [ ] `POST /api/auth/reset-password` - Reset password
- [ ] `POST /api/auth/verify-email` - Send verification email
- [ ] `GET /api/auth/verify-email` - Verify email token
- [ ] `POST /api/auth/enable-2fa` - Enable 2FA
- [ ] `POST /api/auth/disable-2fa` - Disable 2FA
- [ ] `POST /api/auth/verify-2fa` - Verify 2FA code

### 👥 User Management APIs
- [ ] `GET /api/users/search` - Search users
- [ ] `POST /api/users/create` - Create new user
- [ ] `POST /api/users/bulk-create` - Bulk create users
- [ ] `GET /api/users/profile` - Get user profile
- [ ] `PUT /api/users/profile` - Update user profile
- [ ] `POST /api/users/change-password` - Change password
- [ ] `GET /api/users/[id]` - Get user by ID
- [ ] `PUT /api/users/[id]` - Update user by ID
- [ ] `DELETE /api/users/[id]` - Delete user by ID

### 🎓 Student APIs
- [ ] `GET /api/students` - Get all students
- [ ] `GET /api/students/[id]` - Get student by ID
- [ ] `PUT /api/students/[id]` - Update student
- [ ] `DELETE /api/students/[id]` - Delete student
- [ ] `GET /api/students/[id]/exams` - Get student exams
- [ ] `GET /api/students/[id]/results` - Get student results

### 📝 Registration APIs
- [ ] `GET /api/registration/subjects` - Get all subjects
- [ ] `POST /api/registration/subjects` - Create subject
- [ ] `GET /api/registration/subjects/[id]` - Get subject by ID
- [ ] `PUT /api/registration/subjects/[id]` - Update subject
- [ ] `DELETE /api/registration/subjects/[id]` - Delete subject
- [ ] `GET /api/registration/students/search` - Search students
- [ ] `POST /api/registration/student` - Register student
- [ ] `GET /api/registration/student/[id]` - Get student registration
- [ ] `PUT /api/registration/student/[id]` - Update student registration
- [ ] `GET /api/registration/schools` - Get all schools
- [ ] `POST /api/registration/schools` - Register school
- [ ] `GET /api/registration/school/[id]` - Get school by ID
- [ ] `PUT /api/registration/school/[id]` - Update school
- [ ] `POST /api/registration/photo-upload` - Upload student photo
- [ ] `POST /api/registration/payment` - Process payment
- [ ] `GET /api/registration/payment/status/[id]` - Get payment status
- [ ] `GET /api/registration/confirmation/[id]` - Get registration confirmation

### 🏫 Examination APIs
- [ ] `GET /api/examinations/centers` - Get exam centers
- [ ] `POST /api/examinations/centers` - Create exam center
- [ ] `GET /api/examinations/centers/[id]` - Get center by ID
- [ ] `PUT /api/examinations/centers/[id]` - Update center
- [ ] `DELETE /api/examinations/centers/[id]` - Delete center
- [ ] `GET /api/examinations/schedule` - Get exam schedules
- [ ] `POST /api/examinations/schedule` - Create schedule
- [ ] `GET /api/examinations/schedule/[id]` - Get schedule by ID
- [ ] `PUT /api/examinations/schedule/[id]` - Update schedule
- [ ] `DELETE /api/examinations/schedule/[id]` - Delete schedule
- [ ] `GET /api/examinations/materials` - Get exam materials
- [ ] `POST /api/examinations/materials` - Upload materials
- [ ] `GET /api/examinations/materials/[id]` - Get material by ID
- [ ] `PUT /api/examinations/materials/[id]` - Update material
- [ ] `DELETE /api/examinations/materials/[id]` - Delete material
- [ ] `GET /api/examinations/attendance` - Get attendance records
- [ ] `POST /api/examinations/attendance` - Record attendance
- [ ] `GET /api/examinations/attendance/[id]` - Get attendance by ID
- [ ] `PUT /api/examinations/attendance/[id]` - Update attendance
- [ ] `GET /api/examinations/incidents` - Get incident reports
- [ ] `POST /api/examinations/incidents` - Report incident
- [ ] `GET /api/examinations/incidents/[examId]` - Get exam incidents
- [ ] `PUT /api/examinations/incidents/[examId]` - Update incident
- [ ] `GET /api/examinations/assign-invigilators` - Get invigilator assignments
- [ ] `POST /api/examinations/assign-invigilators` - Assign invigilators
- [ ] `GET /api/examinations/assign-invigilators/[id]` - Get assignment by ID
- [ ] `PUT /api/examinations/assign-invigilators/[id]` - Update assignment

## 🧪 Sample Test Requests

### Authentication Test
```bash
# Register a new user
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "userType": "student",
    "dateOfBirth": "2000-01-01"
  }'

# Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Student Data Test
```bash
# Get all students
curl -X GET "http://localhost:3000/api/students"

# Get specific student
curl -X GET "http://localhost:3000/api/students/GCE2025-ST-003421"

# Get student results
curl -X GET "http://localhost:3000/api/students/GCE2025-ST-003421/results"
```

### Examination Centers Test
```bash
# Get all centers
curl -X GET "http://localhost:3000/api/examinations/centers"

# Get centers by region
curl -X GET "http://localhost:3000/api/examinations/centers?region=Centre"

# Get centers by type
curl -X GET "http://localhost:3000/api/examinations/centers?centerType=primary"
```

### Subjects Test
```bash
# Get all subjects
curl -X GET "http://localhost:3000/api/registration/subjects"

# Get O Level subjects
curl -X GET "http://localhost:3000/api/registration/subjects?level=O%20Level"

# Get core subjects
curl -X GET "http://localhost:3000/api/registration/subjects?category=core"
```

## 🔍 Expected Response Format

All APIs should return responses in this format:
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation completed successfully"
}
```

For errors:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (optional)"
}
```

## ✅ Verification Checklist

### Basic Functionality
- [ ] All GET endpoints return 200 status
- [ ] All endpoints return valid JSON
- [ ] Response format matches expected structure
- [ ] Mock data is returned correctly
- [ ] No 404 errors on existing routes

### Authentication Flow
- [ ] Registration creates new user
- [ ] Login returns authentication token
- [ ] Logout invalidates token
- [ ] Password reset flow works
- [ ] Email verification works
- [ ] 2FA setup and verification works

### Data Operations
- [ ] GET requests return data
- [ ] POST requests create data
- [ ] PUT requests update data
- [ ] DELETE requests remove data
- [ ] Search and filtering work
- [ ] Pagination works (where implemented)

### Error Handling
- [ ] Invalid requests return appropriate errors
- [ ] Missing data returns 400 Bad Request
- [ ] Non-existent resources return 404 Not Found
- [ ] Server errors return 500 Internal Server Error

## 🛠️ Troubleshooting

### Common Issues

1. **404 Not Found**
   - Check file paths in `src/app/api/`
   - Ensure `route.ts` files exist
   - Verify folder structure

2. **500 Internal Server Error**
   - Check server console for errors
   - Verify import statements
   - Check for syntax errors

3. **CORS Issues**
   - Add CORS headers if testing from different origin
   - Use same origin for testing

4. **TypeScript Errors**
   - Run `npm run build` to check for compilation errors
   - Fix type issues before testing

### Debug Tips
- Check browser Network tab for request details
- Use `console.log` in API routes for debugging
- Check server terminal for error messages
- Use proper Content-Type headers for POST requests

## 📊 Testing Tools Recommendations

1. **Postman** - GUI-based API testing
2. **Insomnia** - Alternative to Postman
3. **VS Code REST Client** - Test directly in VS Code
4. **curl** - Command line testing
5. **Browser DevTools** - For GET requests and debugging

## 🎯 Next Steps

After verifying APIs:
1. Test frontend integration
2. Add proper error handling
3. Implement authentication middleware
4. Add input validation
5. Set up database integration
6. Add comprehensive logging
7. Implement rate limiting
8. Add API documentation
