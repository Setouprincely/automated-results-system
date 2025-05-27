# 🚀 API Migration Guide - GCE Automated Results System

## Overview
This guide provides a comprehensive roadmap for transitioning from mock data to real API calls in your GCE Automated Results System.

## 📁 Project Structure Created

### API Routes (`src/app/api/`)
```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   ├── logout/route.ts
│   └── forgot-password/route.ts
├── students/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── exams/route.ts
│       └── results/route.ts
├── examinations/
│   ├── centers/route.ts
│   ├── subjects/route.ts
│   └── grading-config/route.ts
├── admin/
│   ├── dashboard/stats/route.ts
│   ├── users/route.ts
│   └── logs/route.ts
├── schools/
│   ├── dashboard/stats/route.ts
│   ├── students/route.ts
│   └── communications/route.ts
├── examiners/
│   ├── scripts/route.ts
│   └── verification-tasks/route.ts
└── processing/
    ├── results/route.ts
    ├── certificates/route.ts
    └── notifications/route.ts
```

### Utility Libraries (`src/lib/`)
```
src/lib/
├── api.ts              # Main API client and functions
├── hooks/
│   ├── useApi.ts       # Generic API hooks
│   ├── useStudent.ts   # Student-specific hooks
│   ├── useAdmin.ts     # Admin-specific hooks
│   └── useExaminer.ts  # Examiner-specific hooks
└── types/
    ├── api.ts          # API response types
    ├── student.ts      # Student data types
    └── examination.ts  # Examination data types
```

## 🔄 Migration Steps

### Phase 1: Infrastructure Setup ✅
- [x] Create API route structure
- [x] Set up API client utility
- [x] Create React hooks for data fetching
- [x] Define TypeScript interfaces

### Phase 2: Authentication & Core APIs
1. **Authentication System**
   - Replace mock login with JWT authentication
   - Implement session management
   - Add role-based access control

2. **Student APIs**
   - Student registration
   - Profile management
   - Exam schedules
   - Results retrieval

### Phase 3: Administrative APIs
1. **Admin Dashboard**
   - System statistics
   - User management
   - System monitoring

2. **Examination Management**
   - Center management
   - Subject configuration
   - Grading setup

### Phase 4: Specialized Modules
1. **Schools Module**
   - Student registration by schools
   - Performance analytics
   - Communication system

2. **Examiner Module**
   - Script marking
   - Verification tasks
   - Performance tracking

3. **Processing Module**
   - Results processing
   - Certificate generation
   - Notification system

## 📋 Pages to Migrate (Priority Order)

### High Priority (Core Functionality)
1. **Authentication Pages**
   - `/auth/Login/page.tsx`
   - `/auth/Register/page.tsx`
   - `/auth/Forgot/page.tsx`

2. **Student Pages**
   - `/Student/dashboard/page.tsx`
   - `/Student/registration/page.tsx`
   - `/Student/results/page.tsx`
   - `/Student/exam/page.tsx`

3. **Admin Pages**
   - `/admin/dashboard/page.tsx`
   - `/admin/user/page.tsx`

### Medium Priority (Management Features)
4. **Examination Pages**
   - `/Examination/Centers/page.tsx`
   - `/Examination/Examboard/page.tsx`
   - `/Examination/Examsetup/page.tsx`

5. **Schools Pages**
   - `/Schools/dashboard/page.tsx`
   - `/Schools/registration/page.tsx`
   - `/Schools/results/page.tsx`

### Lower Priority (Advanced Features)
6. **Examiner Pages**
   - `/Examinar/marking/page.tsx`
   - `/Examinar/verification/page.tsx`
   - `/Examinar/dashboard/page.tsx`

7. **Processing Pages**
   - `/processing/publication/page.tsx`
   - `/processing/certification/page.tsx`
   - `/processing/notification/page.tsx`

## 🛠️ Implementation Examples

### Example 1: Converting Student Dashboard

**Before (Mock Data):**
```typescript
const mockStudentInfo = {
  id: 'GCE2025-78956',
  name: 'Jean-Michel Fopa',
  // ... other mock data
};
```

**After (API Integration):**
```typescript
import { useStudentProfile } from '@/lib/hooks/useStudent';

const StudentDashboard = () => {
  const { data: studentInfo, loading, error } = useStudentProfile('current');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>Welcome, {studentInfo?.name}</h1>
      {/* Rest of component */}
    </div>
  );
};
```

### Example 2: Converting Examination Centers

**Before (Mock Data):**
```typescript
const mockCenters = [
  { id: '1', name: 'GBHS Yaoundé', ... },
  // ... more mock data
];
```

**After (API Integration):**
```typescript
import { useApi } from '@/lib/hooks/useApi';
import { examinationApi } from '@/lib/api';

const ExaminationCenters = () => {
  const { data: centers, loading, error, refetch } = useApi(
    () => examinationApi.getCenters(),
    []
  );
  
  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {centers?.map(center => (
        <CenterCard key={center.id} center={center} />
      ))}
    </div>
  );
};
```

## 🔧 Database Integration

### Recommended Database Setup
1. **PostgreSQL** (Primary recommendation)
   - Excellent for relational data
   - Strong ACID compliance
   - Good performance for complex queries

2. **Alternative: MongoDB**
   - Good for flexible schemas
   - Easy to scale horizontally

### Database Schema (PostgreSQL Example)
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(500),
  exam_level VARCHAR(50) NOT NULL,
  exam_center_id UUID REFERENCES examination_centers(id),
  registration_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Examination Centers table
CREATE TABLE examination_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  region VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Next Steps

### Immediate Actions (Week 1)
1. Install additional dependencies:
   ```bash
   npm install @prisma/client prisma
   npm install bcryptjs jsonwebtoken
   npm install @types/bcryptjs @types/jsonwebtoken
   ```

2. Set up environment variables:
   ```env
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   NEXT_PUBLIC_API_URL="/api"
   ```

3. Initialize database schema
4. Start with authentication APIs

### Short-term Goals (Week 2-3)
1. Complete student module APIs
2. Implement admin dashboard APIs
3. Test API integration with existing UI

### Medium-term Goals (Month 1)
1. Complete all core module APIs
2. Add proper error handling
3. Implement caching strategies
4. Add API documentation

### Long-term Goals (Month 2+)
1. Performance optimization
2. Advanced features (real-time updates, notifications)
3. API rate limiting and security
4. Comprehensive testing

## 📚 Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🤝 Support

For questions or assistance with the migration:
1. Review this guide thoroughly
2. Check the example implementations
3. Test with small components first
4. Gradually migrate larger modules

Remember: **Start small, test frequently, and migrate incrementally!**
