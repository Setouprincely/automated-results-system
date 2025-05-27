# 🔧 Dependency Conflict Resolution Guide

## 🚨 Problem
You're experiencing dependency conflicts due to:
1. **date-fns version mismatch**: v4.1.0 vs required v2.28.0-v3.x.x
2. **React version compatibility**: React v19 vs expected v16-18
3. **react-day-picker compatibility issues**

## ✅ Solution Options

### Option 1: Quick Fix (Recommended)
Use the `--legacy-peer-deps` flag to bypass peer dependency checks:

```bash
# Clean installation
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Option 2: Update package.json (Already Done)
I've already updated your package.json with compatible versions:
- `date-fns`: `^3.6.0` (downgraded from 4.1.0)
- `react-day-picker`: `^9.1.3` (upgraded for React 19 compatibility)
- Added API dependencies: `@prisma/client`, `bcryptjs`, `jsonwebtoken`

### Option 3: Alternative Calendar Component
If react-day-picker continues to cause issues, replace it with a more compatible alternative:

```bash
npm uninstall react-day-picker
npm install react-calendar --legacy-peer-deps
```

## 🛠️ Manual Installation Steps

If the automated script fails, install dependencies manually:

### Step 1: Core API Dependencies
```bash
npm install @prisma/client --legacy-peer-deps
npm install bcryptjs --legacy-peer-deps
npm install jsonwebtoken --legacy-peer-deps
```

### Step 2: Type Definitions
```bash
npm install --save-dev @types/bcryptjs --legacy-peer-deps
npm install --save-dev @types/jsonwebtoken --legacy-peer-deps
npm install --save-dev prisma --legacy-peer-deps
```

### Step 3: Verify Installation
```bash
npm list @prisma/client
npm list bcryptjs
npm list jsonwebtoken
```

## 🔄 Alternative: Use Yarn
If npm continues to have issues, try using Yarn:

```bash
# Install Yarn if not already installed
npm install -g yarn

# Remove npm files
rm -rf node_modules package-lock.json

# Install with Yarn
yarn install
```

## 📦 Minimal API Setup (No Calendar)
If you want to proceed without the calendar component for now:

1. **Remove react-day-picker temporarily:**
```bash
npm uninstall react-day-picker
```

2. **Install only API dependencies:**
```bash
npm install @prisma/client bcryptjs jsonwebtoken --legacy-peer-deps
npm install --save-dev @types/bcryptjs @types/jsonwebtoken prisma --legacy-peer-deps
```

3. **Comment out calendar imports** in your components temporarily

## 🚀 Proceed with API Migration

Once dependencies are installed, you can start the API migration:

### 1. Initialize Prisma
```bash
npx prisma init
```

### 2. Create .env file
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gce_system"
JWT_SECRET="your-super-secret-jwt-key-here"
NEXT_PUBLIC_API_URL="/api"
```

### 3. Start with Authentication
Begin migrating the authentication pages first:
- `/auth/Login/page.tsx`
- `/auth/Register/page.tsx`

### 4. Test API Routes
Test the API routes I created:
- `http://localhost:3000/api/students`
- `http://localhost:3000/api/auth/login`
- `http://localhost:3000/api/examinations/centers`

## 🔍 Troubleshooting

### If you still get ERESOLVE errors:
1. **Use --force flag** (not recommended but works):
   ```bash
   npm install --force
   ```

2. **Create .npmrc file** in your project root:
   ```
   legacy-peer-deps=true
   ```

3. **Use specific versions**:
   ```bash
   npm install react-day-picker@8.10.1 --legacy-peer-deps
   ```

### If Prisma fails to initialize:
```bash
# Manual Prisma setup
mkdir prisma
echo 'generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}' > prisma/schema.prisma
```

## ✅ Success Indicators

You'll know the setup is successful when:
- [ ] `npm run dev` starts without errors
- [ ] No dependency warnings in console
- [ ] API routes are accessible
- [ ] Prisma generates client successfully

## 🆘 If All Else Fails

**Fallback Option**: Start API migration without new dependencies
1. Use the existing project as-is
2. Create API routes using only built-in Next.js features
3. Add authentication later
4. Use simple fetch() calls instead of custom hooks initially

This approach lets you begin the migration immediately while resolving dependency issues separately.

## 📞 Next Steps

Once dependencies are resolved:
1. Follow the `API_MIGRATION_GUIDE.md`
2. Use the `IMPLEMENTATION_CHECKLIST.md`
3. Start with the `EXAMPLE_ADMIN_DASHBOARD_MIGRATION.tsx`

The API infrastructure I created will work regardless of the dependency resolution method you choose!
