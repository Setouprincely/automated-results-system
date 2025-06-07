// PostgreSQL Database Implementation for GCE System
// Uses Prisma ORM with separate schemas for each user type

import { PrismaClient } from '../generated/prisma';
import { User } from '@/types/user';
import bcrypt from 'bcryptjs';

// Create Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Password hashing utility
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Generate unique ID for each user type
const generateUserId = (userType: User['userType']): string => {
  const timestamp = Date.now().toString().slice(-6);

  switch (userType) {
    case 'student':
      return `GCE2025-ST-${timestamp}`;
    case 'teacher':
      return `GCE2025-TC-${timestamp}`;
    case 'examiner':
      return `GCE2025-EX-${timestamp}`;
    case 'admin':
      return `GCE2025-AD-${timestamp}`;
    default:
      return `GCE2025-US-${timestamp}`;
  }
};

// Convert Prisma model to User interface
const prismaToUser = (prismaUser: any, userType: User['userType']): User => {
  return {
    id: prismaUser.id,
    fullName: prismaUser.fullName,
    email: prismaUser.email,
    passwordHash: prismaUser.passwordHash,
    userType: userType,
    registrationStatus: prismaUser.registrationStatus as User['registrationStatus'],
    emailVerified: prismaUser.emailVerified,
    examLevel: prismaUser.examLevel,
    examCenter: prismaUser.examCenter,
    centerCode: prismaUser.centerCode,
    candidateNumber: prismaUser.candidateNumber,
    dateOfBirth: prismaUser.dateOfBirth,
    school: prismaUser.school,
    subjects: prismaUser.subjects,
    createdAt: prismaUser.createdAt.toISOString(),
    lastLogin: prismaUser.lastLogin?.toISOString()
  };
};

// PostgreSQL database operations with separate schemas
export const postgresDb = {
  // Create a new user in the appropriate schema
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): Promise<User> => {
    const { password, userType, ...userInfo } = userData;

    const userId = generateUserId(userType);
    const passwordHash = await hashPassword(password);

    const commonData = {
      id: userId,
      fullName: userInfo.fullName,
      email: userInfo.email.toLowerCase(),
      passwordHash,
      registrationStatus: userInfo.registrationStatus || 'pending',
      emailVerified: userInfo.emailVerified || false
    };

    let createdUser: any;

    try {
      switch (userType) {
        case 'student':
          createdUser = await prisma.studentUser.create({
            data: {
              ...commonData,
              examLevel: userInfo.examLevel,
              examCenter: userInfo.examCenter,
              centerCode: userInfo.centerCode,
              candidateNumber: userInfo.candidateNumber,
              dateOfBirth: userInfo.dateOfBirth,
              subjects: userInfo.subjects || []
            }
          });
          break;

        case 'teacher':
          createdUser = await prisma.teacherUser.create({
            data: {
              ...commonData,
              school: userInfo.school,
              teachingSubjects: userInfo.subjects || [],
              qualifications: []
            }
          });
          break;

        case 'examiner':
          createdUser = await prisma.examinerUser.create({
            data: {
              ...commonData,
              specialization: userInfo.examLevel,
              examiningLevel: userInfo.examLevel,
              certifications: []
            }
          });
          break;

        case 'admin':
          createdUser = await prisma.adminUser.create({
            data: {
              ...commonData,
              role: 'admin',
              permissions: ['read', 'write'],
              region: 'National'
            }
          });
          break;

        default:
          throw new Error(`Invalid user type: ${userType}`);
      }

      // Log the creation in audit log
      await postgresDb.logAudit({
        tableName: `${userType}_auth.users`,
        recordId: userId,
        action: 'INSERT',
        newValues: { ...commonData, userType },
        userType,
        userId,
        userEmail: userInfo.email
      });

      return prismaToUser(createdUser, userType);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create ${userType} user: ${error.message}`);
    }
  },

  // Find user by email and user type (secure method)
  findByEmailAndType: async (email: string, userType: User['userType']): Promise<User | null> => {
    try {
      let user: any = null;

      switch (userType) {
        case 'student':
          // For students, we need to check both O Level and A Level databases
          // This is handled by SeparateStudentDatabase, so we'll skip this case
          return null;
        case 'teacher':
          user = await prisma.teacherUser.findUnique({
            where: { email: email.toLowerCase() }
          });
          break;
        case 'examiner':
          user = await prisma.examinerUser.findUnique({
            where: { email: email.toLowerCase() }
          });
          break;
        case 'admin':
          user = await prisma.adminUser.findUnique({
            where: { email: email.toLowerCase() }
          });
          break;
      }

      return user ? prismaToUser(user, userType) : null;
    } catch (error) {
      console.error('Error finding user by email and type:', error);
      return null;
    }
  },

  // Find user by ID (searches all schemas)
  findById: async (id: string): Promise<User | null> => {
    try {
      // Try each schema
      const searches = [
        { model: prisma.studentUser, type: 'student' as const },
        { model: prisma.teacherUser, type: 'teacher' as const },
        { model: prisma.examinerUser, type: 'examiner' as const },
        { model: prisma.adminUser, type: 'admin' as const }
      ];

      for (const { model, type } of searches) {
        const user = await model.findUnique({ where: { id } });
        if (user) {
          return prismaToUser(user, type);
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  },

  // Get all users from all schemas
  getAllUsers: async (): Promise<User[]> => {
    try {
      const [students, teachers, examiners, admins] = await Promise.all([
        prisma.studentUser.findMany(),
        prisma.teacherUser.findMany(),
        prisma.examinerUser.findMany(),
        prisma.adminUser.findMany()
      ]);

      return [
        ...students.map(user => prismaToUser(user, 'student')),
        ...teachers.map(user => prismaToUser(user, 'teacher')),
        ...examiners.map(user => prismaToUser(user, 'examiner')),
        ...admins.map(user => prismaToUser(user, 'admin'))
      ];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  // Get users by type (from specific schema)
  getUsersByType: async (userType: User['userType']): Promise<User[]> => {
    try {
      let users: any[] = [];

      switch (userType) {
        case 'student':
          users = await prisma.studentUser.findMany();
          break;
        case 'teacher':
          users = await prisma.teacherUser.findMany();
          break;
        case 'examiner':
          users = await prisma.examinerUser.findMany();
          break;
        case 'admin':
          users = await prisma.adminUser.findMany();
          break;
      }

      return users.map(user => prismaToUser(user, userType));
    } catch (error) {
      console.error('Error getting users by type:', error);
      return [];
    }
  },

  // Verify password by user type (secure method)
  verifyPasswordByType: async (email: string, password: string, userType: User['userType']): Promise<boolean> => {
    try {
      const user = await postgresDb.findByEmailAndType(email, userType);
      if (!user) return false;

      return await verifyPassword(password, user.passwordHash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },

  // Check if email exists in specific user type
  emailExistsInType: async (email: string, userType: User['userType']): Promise<boolean> => {
    try {
      const user = await postgresDb.findByEmailAndType(email, userType);
      return !!user;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  },

  // Check if email exists (searches all schemas)
  emailExists: async (email: string): Promise<boolean> => {
    try {
      for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
        if (await postgresDb.emailExistsInType(email, userType)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  },

  // Find user by email (searches all schemas)
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
        const user = await postgresDb.findByEmailAndType(email, userType);
        if (user) return user;
      }
      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },

  // Log audit trail
  logAudit: async (auditData: {
    tableName: string;
    recordId: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    userType: string;
    userId: string;
    userEmail: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> => {
    try {
      await prisma.auditLog.create({
        data: {
          ...auditData,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  },

  // Close database connection
  disconnect: async (): Promise<void> => {
    await prisma.$disconnect();
  }
};

export default postgresDb;
