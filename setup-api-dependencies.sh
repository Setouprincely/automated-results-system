#!/bin/bash

# API Migration Dependencies Setup Script
# Run this script to install all necessary dependencies for API integration

echo "🚀 Setting up API Migration Dependencies..."

# Clean npm cache first
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Remove node_modules and package-lock.json to start fresh
echo "🗑️ Removing existing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install all dependencies with legacy peer deps to resolve conflicts
echo "📦 Installing all dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps

# Verify critical packages are installed
echo "✅ Verifying installation..."
if npm list @prisma/client > /dev/null 2>&1; then
    echo "✓ Prisma client installed"
else
    echo "✗ Prisma client not found"
fi

if npm list bcryptjs > /dev/null 2>&1; then
    echo "✓ bcryptjs installed"
else
    echo "✗ bcryptjs not found"
fi

if npm list jsonwebtoken > /dev/null 2>&1; then
    echo "✓ jsonwebtoken installed"
else
    echo "✗ jsonwebtoken not found"
fi

# Initialize Prisma (if using Prisma)
echo "🗄️ Initializing Prisma..."
npx prisma init --datasource-provider postgresql

echo "✅ Dependencies installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your .env file with database credentials"
echo "2. Set up your database schema in prisma/schema.prisma"
echo "3. Run 'npx prisma migrate dev' to create your database"
echo "4. Start migrating your pages using the provided examples"
echo ""
echo "📚 Documentation:"
echo "- API_MIGRATION_GUIDE.md - Complete migration guide"
echo "- IMPLEMENTATION_CHECKLIST.md - Step-by-step checklist"
echo "- EXAMPLE_ADMIN_DASHBOARD_MIGRATION.tsx - Example implementation"
echo ""
echo "🎉 Happy coding!"
