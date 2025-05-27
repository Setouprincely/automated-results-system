# 🐘 PostgreSQL Setup for GCE System

## 🎯 Architecture: Separate Schemas for Each User Type

```
🗄️ PostgreSQL Database: gce_system
├── 📊 Schema: student_auth     (student users only)
├── 📊 Schema: teacher_auth     (teacher users only)
├── 📊 Schema: examiner_auth    (examiner users only)
├── 📊 Schema: admin_auth       (admin users only)
└── 📊 Schema: public          (shared data like subjects, centers)
```

## 🚀 Installation Steps

### Step 1: Install PostgreSQL

#### Windows
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use chocolatey:
choco install postgresql

# Or use winget:
winget install PostgreSQL.PostgreSQL
```

#### macOS
```bash
# Using Homebrew:
brew install postgresql
brew services start postgresql

# Or download from: https://www.postgresql.org/download/macos/
```

#### Ubuntu/Linux
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database
CREATE DATABASE gce_system;

# Create dedicated user for the application
CREATE USER gce_app WITH PASSWORD 'your_secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gce_system TO gce_app;

# Connect to the new database
\c gce_system

# Create separate schemas for each user type
CREATE SCHEMA student_auth;
CREATE SCHEMA teacher_auth;
CREATE SCHEMA examiner_auth;
CREATE SCHEMA admin_auth;

# Grant schema permissions
GRANT ALL ON SCHEMA student_auth TO gce_app;
GRANT ALL ON SCHEMA teacher_auth TO gce_app;
GRANT ALL ON SCHEMA examiner_auth TO gce_app;
GRANT ALL ON SCHEMA admin_auth TO gce_app;

# Exit
\q
```

### Step 3: Install Node.js Dependencies

```bash
# Install PostgreSQL client and Prisma ORM
npm install pg @types/pg
npm install prisma @prisma/client
npm install bcryptjs @types/bcryptjs

# Initialize Prisma
npx prisma init
```

## 🔧 Configuration Files

### Environment Variables (.env)
```env
# PostgreSQL Connection
DATABASE_URL="postgresql://gce_app:your_secure_password_here@localhost:5432/gce_system"

# Alternative format for connection pooling
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gce_system
POSTGRES_USER=gce_app
POSTGRES_PASSWORD=your_secure_password_here

# Application settings
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
BCRYPT_ROUNDS=12
```

### Prisma Schema (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Student users in separate schema
model StudentUser {
  id                 String   @id @default(cuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  registrationStatus String  @default("pending")
  emailVerified     Boolean  @default(false)
  examLevel         String?
  examCenter        String?
  centerCode        String?
  candidateNumber   String?
  dateOfBirth       String?
  subjects          Json?    // Store subjects as JSON
  createdAt         DateTime @default(now())
  lastLogin         DateTime?
  updatedAt         DateTime @updatedAt

  @@map("users")
  @@schema("student_auth")
}

// Teacher users in separate schema
model TeacherUser {
  id                 String   @id @default(cuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  registrationStatus String  @default("pending")
  emailVerified     Boolean  @default(false)
  school            String?
  createdAt         DateTime @default(now())
  lastLogin         DateTime?
  updatedAt         DateTime @updatedAt

  @@map("users")
  @@schema("teacher_auth")
}

// Examiner users in separate schema
model ExaminerUser {
  id                 String   @id @default(cuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  registrationStatus String  @default("pending")
  emailVerified     Boolean  @default(false)
  createdAt         DateTime @default(now())
  lastLogin         DateTime?
  updatedAt         DateTime @updatedAt

  @@map("users")
  @@schema("examiner_auth")
}

// Admin users in separate schema
model AdminUser {
  id                 String   @id @default(cuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  registrationStatus String  @default("pending")
  emailVerified     Boolean  @default(false)
  createdAt         DateTime @default(now())
  lastLogin         DateTime?
  updatedAt         DateTime @updatedAt

  @@map("users")
  @@schema("admin_auth")
}

// Shared data in public schema
model Subject {
  id          String @id @default(cuid())
  code        String @unique
  name        String
  level       String // "O Level" or "A Level"
  description String?
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())

  @@map("subjects")
  @@schema("public")
}

model ExamCenter {
  id          String @id @default(cuid())
  code        String @unique
  name        String
  location    String
  capacity    Int
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())

  @@map("exam_centers")
  @@schema("public")
}
```

## 🔒 Security Features

### Row-Level Security (RLS)
```sql
-- Enable RLS on all user tables
ALTER TABLE student_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE examiner_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_auth.users ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY student_policy ON student_auth.users
  FOR ALL TO gce_app
  USING (email = current_setting('app.current_user_email', true));

CREATE POLICY teacher_policy ON teacher_auth.users
  FOR ALL TO gce_app
  USING (email = current_setting('app.current_user_email', true));

CREATE POLICY examiner_policy ON examiner_auth.users
  FOR ALL TO gce_app
  USING (email = current_setting('app.current_user_email', true));

CREATE POLICY admin_policy ON admin_auth.users
  FOR ALL TO gce_app
  USING (email = current_setting('app.current_user_email', true));
```

### Database Roles
```sql
-- Create role-specific database users
CREATE ROLE student_role;
CREATE ROLE teacher_role;
CREATE ROLE examiner_role;
CREATE ROLE admin_role;

-- Grant schema access to specific roles
GRANT USAGE ON SCHEMA student_auth TO student_role;
GRANT USAGE ON SCHEMA teacher_auth TO teacher_role;
GRANT USAGE ON SCHEMA examiner_auth TO examiner_role;
GRANT USAGE ON SCHEMA admin_auth TO admin_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA student_auth TO student_role;
GRANT ALL ON ALL TABLES IN SCHEMA teacher_auth TO teacher_role;
GRANT ALL ON ALL TABLES IN SCHEMA examiner_auth TO examiner_role;
GRANT ALL ON ALL TABLES IN SCHEMA admin_auth TO admin_role;
```

## 📊 Database Migration

### Create Migration
```bash
# Generate migration from schema
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Seed Data
```bash
# Create seed file
npx prisma db seed
```

## 🔧 Connection Pooling

### Using PgBouncer (Recommended for Production)
```bash
# Install PgBouncer
sudo apt install pgbouncer

# Configure connection pooling
# /etc/pgbouncer/pgbouncer.ini
```

### Using Prisma Connection Pooling
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install pg @types/pg prisma @prisma/client bcryptjs @types/bcryptjs

# 2. Initialize Prisma
npx prisma init

# 3. Set up database (run the SQL commands above)

# 4. Create and apply migration
npx prisma migrate dev --name init

# 5. Generate client
npx prisma generate

# 6. Start development
npm run dev
```

## 📈 Performance Optimization

### Indexes
```sql
-- Create indexes for better performance
CREATE INDEX idx_student_email ON student_auth.users(email);
CREATE INDEX idx_teacher_email ON teacher_auth.users(email);
CREATE INDEX idx_examiner_email ON examiner_auth.users(email);
CREATE INDEX idx_admin_email ON admin_auth.users(email);

CREATE INDEX idx_student_status ON student_auth.users(registrationStatus);
CREATE INDEX idx_student_created ON student_auth.users(createdAt);
```

### Connection Settings
```sql
-- Optimize PostgreSQL settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
SELECT pg_reload_conf();
```

## 🔍 Monitoring

### Useful Queries
```sql
-- Check schema sizes
SELECT schemaname, 
       pg_size_pretty(sum(pg_total_relation_size(schemaname||'.'||tablename))::bigint) as size
FROM pg_tables 
WHERE schemaname IN ('student_auth', 'teacher_auth', 'examiner_auth', 'admin_auth')
GROUP BY schemaname;

-- Check user counts per schema
SELECT 'student_auth' as schema, count(*) from student_auth.users
UNION ALL
SELECT 'teacher_auth' as schema, count(*) from teacher_auth.users
UNION ALL
SELECT 'examiner_auth' as schema, count(*) from examiner_auth.users
UNION ALL
SELECT 'admin_auth' as schema, count(*) from admin_auth.users;
```

## 🎯 Next Steps

1. **Set up PostgreSQL** (follow installation steps above)
2. **Configure environment variables**
3. **Run database migrations**
4. **Update userStorage.ts** to use PostgreSQL
5. **Test with separate schemas**

Your GCE system will now have enterprise-grade database separation! 🚀
