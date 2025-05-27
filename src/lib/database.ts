// Database configuration and connection utilities
// This file provides easy integration with PostgreSQL, MongoDB, or other databases

import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';

// PostgreSQL Configuration
interface PostgreSQLConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

// MongoDB Configuration
interface MongoDBConfig {
  uri: string;
  database: string;
}

// Database connection instances
let pgPool: Pool | null = null;
let mongoClient: MongoClient | null = null;
let mongoDB: Db | null = null;

// PostgreSQL Connection
export const connectPostgreSQL = async (config: PostgreSQLConfig): Promise<Pool> => {
  if (pgPool) {
    return pgPool;
  }

  try {
    pgPool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pgPool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();

    return pgPool;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
};

// MongoDB Connection
export const connectMongoDB = async (config: MongoDBConfig): Promise<Db> => {
  if (mongoDB) {
    return mongoDB;
  }

  try {
    mongoClient = new MongoClient(config.uri);
    await mongoClient.connect();
    mongoDB = mongoClient.db(config.database);
    
    console.log('✅ MongoDB connected successfully');
    return mongoDB;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Database Models and Schemas

// User Schema (for both PostgreSQL and MongoDB)
export interface UserSchema {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  userType: 'student' | 'teacher' | 'examiner' | 'admin';
  registrationStatus: 'pending' | 'confirmed' | 'suspended';
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  school?: string;
  candidateNumber?: string;
  dateOfBirth?: Date;
  examLevel?: string;
  examCenter?: string;
  centerCode?: string;
  subjects?: Array<{
    code: string;
    name: string;
    status: 'confirmed' | 'pending';
  }>;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// PostgreSQL Table Creation Scripts
export const createPostgreSQLTables = async (pool: Pool): Promise<void> => {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'examiner', 'admin')),
        registration_status VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'confirmed', 'suspended')),
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        school VARCHAR(255),
        candidate_number VARCHAR(50),
        date_of_birth DATE,
        exam_level VARCHAR(50),
        exam_center VARCHAR(255),
        center_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    // User subjects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_subjects (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        subject_code VARCHAR(10) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Examination centers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS examination_centers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        region VARCHAR(100) NOT NULL,
        division VARCHAR(100) NOT NULL,
        capacity INTEGER NOT NULL,
        address TEXT NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
        exam_types TEXT[], -- Array of exam types
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        exam_session VARCHAR(50) NOT NULL,
        exam_level VARCHAR(20) NOT NULL,
        subject_code VARCHAR(10) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        grade VARCHAR(5),
        score INTEGER,
        ucas_points INTEGER,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'verified')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Bulk operations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bulk_operations (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        total_records INTEGER NOT NULL,
        processed_records INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        errors TEXT[],
        created_by VARCHAR(50) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(registration_status);
      CREATE INDEX IF NOT EXISTS idx_user_subjects_user_id ON user_subjects(user_id);
      CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
      CREATE INDEX IF NOT EXISTS idx_results_session ON results(exam_session);
    `);

    console.log('✅ PostgreSQL tables created successfully');
  } catch (error) {
    console.error('❌ Error creating PostgreSQL tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// MongoDB Collections Setup
export const createMongoDBCollections = async (db: Db): Promise<void> => {
  try {
    // Create collections with validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['id', 'fullName', 'email', 'passwordHash', 'userType'],
          properties: {
            id: { bsonType: 'string' },
            fullName: { bsonType: 'string' },
            email: { bsonType: 'string' },
            passwordHash: { bsonType: 'string' },
            userType: { enum: ['student', 'teacher', 'examiner', 'admin'] },
            registrationStatus: { enum: ['pending', 'confirmed', 'suspended'] },
            emailVerified: { bsonType: 'bool' }
          }
        }
      }
    });

    await db.createCollection('examinationCenters');
    await db.createCollection('results');
    await db.createCollection('bulkOperations');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ userType: 1 });
    await db.collection('users').createIndex({ registrationStatus: 1 });

    console.log('✅ MongoDB collections created successfully');
  } catch (error) {
    console.error('❌ Error creating MongoDB collections:', error);
    throw error;
  }
};

// Environment-based database configuration
export const getDatabaseConfig = () => {
  const dbType = process.env.DATABASE_TYPE || 'mock'; // 'postgresql', 'mongodb', or 'mock'
  
  if (dbType === 'postgresql') {
    return {
      type: 'postgresql' as const,
      config: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'gce_system',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        ssl: process.env.POSTGRES_SSL === 'true'
      }
    };
  }
  
  if (dbType === 'mongodb') {
    return {
      type: 'mongodb' as const,
      config: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        database: process.env.MONGODB_DB || 'gce_system'
      }
    };
  }
  
  return {
    type: 'mock' as const,
    config: {}
  };
};

// Initialize database connection
export const initializeDatabase = async () => {
  const dbConfig = getDatabaseConfig();
  
  try {
    if (dbConfig.type === 'postgresql') {
      const pool = await connectPostgreSQL(dbConfig.config);
      await createPostgreSQLTables(pool);
      return { type: 'postgresql', connection: pool };
    }
    
    if (dbConfig.type === 'mongodb') {
      const db = await connectMongoDB(dbConfig.config);
      await createMongoDBCollections(db);
      return { type: 'mongodb', connection: db };
    }
    
    console.log('📝 Using mock database (no real database configured)');
    return { type: 'mock', connection: null };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};
