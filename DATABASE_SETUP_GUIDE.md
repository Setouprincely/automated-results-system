# 🗄️ Database Setup Guide for GCE System

## 🎯 Current State: In-Memory Storage

**Location**: `src/lib/userStorage.ts`
**Type**: JavaScript Maps (in-memory)
**Persistence**: ❌ None (data lost on restart)

## 🚀 Database Options for Production

### 1. 🐘 PostgreSQL (Recommended)

#### Installation
```bash
# Install PostgreSQL locally
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Ubuntu: sudo apt install postgresql postgresql-contrib

# Install Node.js dependencies
npm install pg @types/pg
npm install prisma @prisma/client  # ORM (optional but recommended)
```

#### Setup
```bash
# Initialize Prisma (ORM)
npx prisma init

# Create database
createdb gce_system
```

#### Schema Example (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Separate tables for each user type (your requirement)
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
  subjects          Json?    // Store as JSON
  createdAt         DateTime @default(now())
  lastLogin         DateTime?

  @@map("student_users")
}

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

  @@map("teacher_users")
}

model ExaminerUser {
  id                 String   @id @default(cuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  registrationStatus String  @default("pending")
  emailVerified     Boolean  @default(false)
  createdAt         DateTime @default(now())
  lastLogin         DateTime?

  @@map("examiner_users")
}

model AdminUser {
  id                 String   @id @default(cuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  registrationStatus String  @default("pending")
  emailVerified     Boolean  @default(false)
  createdAt         DateTime @default(now())
  lastLogin         DateTime?

  @@map("admin_users")
}
```

#### Environment Variables (`.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gce_system"
```

### 2. 🟢 MongoDB (NoSQL Alternative)

#### Installation
```bash
# Install MongoDB dependencies
npm install mongodb mongoose
npm install @types/mongodb

# Or use MongoDB Atlas (cloud)
```

#### Setup
```javascript
// src/lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gce_system';
const client = new MongoClient(uri);

export const db = client.db('gce_system');

// Separate collections for each user type
export const collections = {
  students: db.collection('student_users'),
  teachers: db.collection('teacher_users'),
  examiners: db.collection('examiner_users'),
  admins: db.collection('admin_users')
};
```

### 3. 🗃️ SQLite (Simple Local Database)

#### Installation
```bash
npm install sqlite3 @types/sqlite3
# Or use better-sqlite3
npm install better-sqlite3 @types/better-sqlite3
```

#### Setup
```javascript
// src/lib/sqlite.ts
import Database from 'better-sqlite3';

const db = new Database('gce_system.db');

// Create separate tables for each user type
db.exec(`
  CREATE TABLE IF NOT EXISTS student_users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    registrationStatus TEXT DEFAULT 'pending',
    emailVerified BOOLEAN DEFAULT 0,
    examLevel TEXT,
    examCenter TEXT,
    centerCode TEXT,
    candidateNumber TEXT,
    dateOfBirth TEXT,
    subjects TEXT, -- JSON string
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    lastLogin TEXT
  );

  CREATE TABLE IF NOT EXISTS teacher_users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    registrationStatus TEXT DEFAULT 'pending',
    emailVerified BOOLEAN DEFAULT 0,
    school TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    lastLogin TEXT
  );

  CREATE TABLE IF NOT EXISTS examiner_users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    registrationStatus TEXT DEFAULT 'pending',
    emailVerified BOOLEAN DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    lastLogin TEXT
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    registrationStatus TEXT DEFAULT 'pending',
    emailVerified BOOLEAN DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    lastLogin TEXT
  );
`);

export default db;
```

## 🔄 Migration Strategy

### Step 1: Create Database Layer
```typescript
// src/lib/database.ts
interface DatabaseAdapter {
  createUser(userData: any, userType: string): Promise<User>;
  findByEmailAndType(email: string, userType: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateUser(email: string, updates: any): Promise<User | null>;
  deleteUser(email: string): Promise<boolean>;
  getUsersByType(userType: string): Promise<User[]>;
}

// Implement for your chosen database
export class PostgreSQLAdapter implements DatabaseAdapter {
  // Implementation here
}

export class SQLiteAdapter implements DatabaseAdapter {
  // Implementation here
}
```

### Step 2: Update userStorage.ts
```typescript
// Replace in-memory Maps with database calls
import { DatabaseAdapter } from './database';

const db = new PostgreSQLAdapter(); // or SQLiteAdapter

export const userStorage = {
  createUser: async (userData: any) => {
    return await db.createUser(userData, userData.userType);
  },
  
  findByEmailAndType: async (email: string, userType: string) => {
    return await db.findByEmailAndType(email, userType);
  },
  
  // ... other methods
};
```

### Step 3: Update API Routes
```typescript
// Make all API routes async
export async function POST(request: NextRequest) {
  // Change from:
  const user = userStorage.findByEmailAndType(email, userType);
  
  // To:
  const user = await userStorage.findByEmailAndType(email, userType);
}
```

## 🎯 Quick Start: SQLite Implementation

For immediate setup, I recommend starting with SQLite:

1. **Install SQLite**:
   ```bash
   npm install better-sqlite3 @types/better-sqlite3
   ```

2. **Create database file**: `src/lib/sqliteDb.ts`

3. **Update userStorage**: Make it async and use SQLite

4. **Update API routes**: Add async/await

5. **Test**: Your separate databases will now persist!

## 🔒 Security Considerations

### Database Security
- **Separate schemas/tables** for each user type ✅
- **Row-level security** (RLS) in PostgreSQL
- **Encrypted connections** (SSL/TLS)
- **Regular backups**
- **Access control** (limited database users)

### Application Security
- **Password hashing** (already implemented) ✅
- **SQL injection prevention** (use parameterized queries)
- **Input validation**
- **Rate limiting**
- **Audit logging**

## 📊 Comparison

| Database | Pros | Cons | Best For |
|----------|------|------|----------|
| **PostgreSQL** | Production-ready, ACID, scalable | Complex setup | Production |
| **MongoDB** | Flexible schema, easy scaling | NoSQL learning curve | Rapid development |
| **SQLite** | Simple, file-based, no server | Single-user, limited concurrency | Development/small apps |

## 🎯 Recommendation

For your GCE system:

1. **Development**: Start with SQLite
2. **Production**: Migrate to PostgreSQL
3. **Keep separate tables** for each user type (your requirement)
4. **Use Prisma ORM** for easier database management

Would you like me to implement the SQLite solution first?
