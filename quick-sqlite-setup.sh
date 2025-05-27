#!/bin/bash

# Quick SQLite Setup for GCE System
echo "🗄️ Setting up SQLite database for GCE System..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installing SQLite dependencies...${NC}"

# Install SQLite dependencies
npm install better-sqlite3 @types/better-sqlite3

echo -e "${GREEN}✅ SQLite dependencies installed${NC}"

echo -e "${BLUE}🔧 Setting up database...${NC}"

# Create the database file (will be created automatically when first used)
echo "Database will be created at: ./gce_system.db"

echo -e "${GREEN}✅ SQLite setup complete!${NC}"

echo -e "${YELLOW}📋 Next steps:${NC}"
echo ""
echo "1. 🔄 Update userStorage.ts to use SQLite:"
echo "   - Import sqliteDb from './sqliteDb'"
echo "   - Replace in-memory operations with SQLite calls"
echo ""
echo "2. 🚀 Start your development server:"
echo "   npm run dev"
echo ""
echo "3. 🧪 Test with demo credentials:"
echo "   Email: demo.student@gce.cm"
echo "   Password: demo123"
echo "   User Type: student"
echo ""
echo -e "${GREEN}🎯 Benefits of SQLite:${NC}"
echo "   ✅ No installation required"
echo "   ✅ File-based database (./gce_system.db)"
echo "   ✅ Separate tables for each user type"
echo "   ✅ Data persists between server restarts"
echo "   ✅ Easy to backup (just copy the .db file)"
echo "   ✅ Can migrate to PostgreSQL later"
echo ""
echo -e "${BLUE}📁 Database location: ./gce_system.db${NC}"
echo -e "${BLUE}📊 View database: Use DB Browser for SQLite or VS Code SQLite extension${NC}"
