// SQLite Database Implementation for GCE System
// This provides persistent storage with separate tables for each user type

import Database from 'better-sqlite3';
import { User } from '@/types/user';
import path from 'path';

// Create database file in project root
const dbPath = path.join(process.cwd(), 'gce_system.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Create separate tables for each user type
const initializeTables = () => {
  // Student users table
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
  `);

  // Teacher users table
  db.exec(`
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
  `);

  // Examiner users table
  db.exec(`
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
  `);

  // Admin users table
  db.exec(`
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

  console.log('✅ SQLite database tables initialized');
};

// Helper function to get table name for user type
const getTableName = (userType: User['userType']): string => {
  switch (userType) {
    case 'student':
      return 'student_users';
    case 'teacher':
      return 'teacher_users';
    case 'examiner':
      return 'examiner_users';
    case 'admin':
      return 'admin_users';
    default:
      throw new Error(`Invalid user type: ${userType}`);
  }
};

// Convert database row to User object
const rowToUser = (row: any): User => {
  return {
    ...row,
    emailVerified: Boolean(row.emailVerified),
    subjects: row.subjects ? JSON.parse(row.subjects) : undefined
  };
};

// Convert User object to database row
const userToRow = (user: User): any => {
  return {
    ...user,
    emailVerified: user.emailVerified ? 1 : 0,
    subjects: user.subjects ? JSON.stringify(user.subjects) : null
  };
};

// Database operations
export const sqliteDb = {
  // Create a new user
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): User => {
    const { password, ...userInfo } = userData;
    
    // Generate unique ID
    const timestamp = Date.now().toString().slice(-6);
    let userId: string;

    switch (userData.userType) {
      case 'student':
        userId = `GCE2025-ST-${timestamp}`;
        break;
      case 'teacher':
        userId = `GCE2025-TC-${timestamp}`;
        break;
      case 'examiner':
        userId = `GCE2025-EX-${timestamp}`;
        break;
      case 'admin':
        userId = `GCE2025-AD-${timestamp}`;
        break;
      default:
        userId = `GCE2025-US-${timestamp}`;
    }

    const user: User = {
      ...userInfo,
      id: userId,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    const tableName = getTableName(user.userType);
    const row = userToRow(user);
    
    const stmt = db.prepare(`
      INSERT INTO ${tableName} (
        id, fullName, email, passwordHash, registrationStatus, emailVerified,
        examLevel, examCenter, centerCode, candidateNumber, dateOfBirth, subjects, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      row.id, row.fullName, row.email, row.passwordHash, row.registrationStatus, row.emailVerified,
      row.examLevel, row.examCenter, row.centerCode, row.candidateNumber, row.dateOfBirth, row.subjects, row.createdAt
    );

    return user;
  },

  // Find user by email and user type (secure method)
  findByEmailAndType: (email: string, userType: User['userType']): User | null => {
    const tableName = getTableName(userType);
    const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE email = ?`);
    const row = stmt.get(email.toLowerCase());
    
    return row ? rowToUser(row) : null;
  },

  // Find user by ID
  findById: (id: string): User | null => {
    // Search in all tables
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const tableName = getTableName(userType);
      const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
      const row = stmt.get(id);
      
      if (row) {
        return rowToUser(row);
      }
    }
    
    return null;
  },

  // Get all users
  getAllUsers: (): User[] => {
    const allUsers: User[] = [];
    
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const tableName = getTableName(userType);
      const stmt = db.prepare(`SELECT * FROM ${tableName}`);
      const rows = stmt.all();
      
      allUsers.push(...rows.map(rowToUser));
    }
    
    return allUsers;
  },

  // Get users by type
  getUsersByType: (userType: User['userType']): User[] => {
    const tableName = getTableName(userType);
    const stmt = db.prepare(`SELECT * FROM ${tableName}`);
    const rows = stmt.all();
    
    return rows.map(rowToUser);
  },

  // Update user
  updateUser: (email: string, updates: Partial<User>): User | null => {
    // Find user first
    const user = sqliteDb.findByEmail(email);
    if (!user) return null;

    const tableName = getTableName(user.userType);
    const updatedUser = { ...user, ...updates };
    const row = userToRow(updatedUser);

    const stmt = db.prepare(`
      UPDATE ${tableName} SET 
        fullName = ?, registrationStatus = ?, emailVerified = ?,
        examLevel = ?, examCenter = ?, centerCode = ?, candidateNumber = ?, 
        dateOfBirth = ?, subjects = ?, lastLogin = ?
      WHERE email = ?
    `);

    stmt.run(
      row.fullName, row.registrationStatus, row.emailVerified,
      row.examLevel, row.examCenter, row.centerCode, row.candidateNumber,
      row.dateOfBirth, row.subjects, row.lastLogin, email.toLowerCase()
    );

    return updatedUser;
  },

  // Delete user
  deleteUser: (email: string): boolean => {
    // Find user first to get the table
    const user = sqliteDb.findByEmail(email);
    if (!user) return false;

    const tableName = getTableName(user.userType);
    const stmt = db.prepare(`DELETE FROM ${tableName} WHERE email = ?`);
    const result = stmt.run(email.toLowerCase());

    return result.changes > 0;
  },

  // Check if email exists in specific user type
  emailExistsInType: (email: string, userType: User['userType']): boolean => {
    const tableName = getTableName(userType);
    const stmt = db.prepare(`SELECT 1 FROM ${tableName} WHERE email = ?`);
    const result = stmt.get(email.toLowerCase());
    
    return !!result;
  },

  // Check if email exists (searches all tables)
  emailExists: (email: string): boolean => {
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      if (sqliteDb.emailExistsInType(email, userType)) {
        return true;
      }
    }
    return false;
  },

  // Find user by email (searches all tables)
  findByEmail: (email: string): User | null => {
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const user = sqliteDb.findByEmailAndType(email, userType);
      if (user) return user;
    }
    return null;
  },

  // Get user count by type
  getUserCountByType: (userType: User['userType']): number => {
    const tableName = getTableName(userType);
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
    const result = stmt.get() as { count: number };
    
    return result.count;
  },

  // Close database connection
  close: () => {
    db.close();
  }
};

// Simple password hashing (use bcrypt in production)
const hashPassword = (password: string): string => {
  // This is a simple hash - use bcrypt or similar in production
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password + 'gce-salt').digest('hex');
};

// Initialize tables on import
initializeTables();

export default sqliteDb;
