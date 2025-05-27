#!/bin/bash

# Install SQLite for the GCE System
echo "🗄️ Installing SQLite database for GCE System..."

# Install better-sqlite3 (faster and more reliable than sqlite3)
npm install better-sqlite3 @types/better-sqlite3

echo "✅ SQLite installed successfully!"
echo ""
echo "📁 Database will be created at: ./gce_system.db"
echo "🔧 Database implementation: src/lib/sqliteDb.ts"
echo ""
echo "🚀 Next steps:"
echo "1. Update userStorage.ts to use SQLite"
echo "2. Make API routes async"
echo "3. Test with persistent data"
echo ""
echo "💡 Your data will now persist between server restarts!"
