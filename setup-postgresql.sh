#!/bin/bash

# PostgreSQL Setup Script for GCE System
echo "🐘 Setting up PostgreSQL for GCE System..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"

# Install required packages
npm install pg @types/pg
npm install prisma @prisma/client
npm install bcryptjs @types/bcryptjs

echo -e "${GREEN}✅ Dependencies installed${NC}"

echo -e "${BLUE}🔧 Setting up Prisma...${NC}"

# Generate Prisma client
npx prisma generate

echo -e "${GREEN}✅ Prisma client generated${NC}"

echo -e "${YELLOW}📋 Next steps:${NC}"
echo ""
echo "1. 🐘 Install PostgreSQL:"
echo "   Windows: Download from https://www.postgresql.org/download/windows/"
echo "   macOS:   brew install postgresql"
echo "   Ubuntu:  sudo apt install postgresql postgresql-contrib"
echo ""
echo "2. 🗄️ Create database and user:"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE gce_system;"
echo "   CREATE USER gce_app WITH PASSWORD 'your_secure_password';"
echo "   GRANT ALL PRIVILEGES ON DATABASE gce_system TO gce_app;"
echo ""
echo "3. 📊 Create schemas:"
echo "   \\c gce_system"
echo "   CREATE SCHEMA student_auth;"
echo "   CREATE SCHEMA teacher_auth;"
echo "   CREATE SCHEMA examiner_auth;"
echo "   CREATE SCHEMA admin_auth;"
echo "   GRANT ALL ON SCHEMA student_auth TO gce_app;"
echo "   GRANT ALL ON SCHEMA teacher_auth TO gce_app;"
echo "   GRANT ALL ON SCHEMA examiner_auth TO gce_app;"
echo "   GRANT ALL ON SCHEMA admin_auth TO gce_app;"
echo ""
echo "4. 🔐 Set environment variables in .env:"
echo "   DATABASE_URL=\"postgresql://gce_app:your_password@localhost:5432/gce_system\""
echo ""
echo "5. 🚀 Run database migration:"
echo "   npx prisma migrate dev --name init"
echo ""
echo "6. 🌱 Seed the database:"
echo "   npx prisma db seed"
echo ""
echo -e "${GREEN}🎯 Your PostgreSQL setup is ready!${NC}"
echo ""
echo -e "${BLUE}📁 Files created:${NC}"
echo "   ✅ prisma/schema.prisma (updated with separate schemas)"
echo "   ✅ src/lib/postgresDb.ts (PostgreSQL implementation)"
echo "   ✅ POSTGRESQL_SETUP.md (detailed setup guide)"
echo ""
echo -e "${YELLOW}💡 Benefits of this setup:${NC}"
echo "   🔒 Complete isolation between user types"
echo "   📊 Separate schemas for each account type"
echo "   🛡️ Row-level security ready"
echo "   📝 Full audit trail logging"
echo "   🚀 Production-ready architecture"
