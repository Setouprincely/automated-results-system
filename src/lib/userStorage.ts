// User storage system for GCE - Now using PostgreSQL with separate schemas
// Provides complete isolation between user types for security

import crypto from 'crypto';
import { postgresDb } from './postgresDb';
import { SeparateStudentDatabase } from './separateStudentDb';

// User interface
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  userType: 'student' | 'teacher' | 'examiner' | 'admin';
  registrationStatus: 'pending' | 'confirmed' | 'suspended';
  emailVerified: boolean;
  school?: string;
  candidateNumber?: string;
  dateOfBirth?: string;
  examLevel?: string;
  examCenter?: string;
  centerCode?: string;
  subjects?: Array<{
    code: string;
    name: string;
    status: 'confirmed' | 'pending';
  }>;
  createdAt: string;
  lastLogin?: string;
}

// Hash password function (legacy - use bcrypt for new users)
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Bcrypt hash function for new users
export const hashPasswordBcrypt = async (password: string): Promise<string> => {
  const bcrypt = require('bcryptjs');
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Separate in-memory storage for each user type (in production, these would be separate databases)
const studentUsers: Map<string, User> = new Map();
const teacherUsers: Map<string, User> = new Map();
const examinerUsers: Map<string, User> = new Map();
const adminUsers: Map<string, User> = new Map();

// Helper function to get the appropriate storage for a user type
const getUserStorage = (userType: User['userType']): Map<string, User> => {
  switch (userType) {
    case 'student':
      return studentUsers;
    case 'teacher':
      return teacherUsers;
    case 'examiner':
      return examinerUsers;
    case 'admin':
      return adminUsers;
    default:
      throw new Error(`Invalid user type: ${userType}`);
  }
};

// Initialize with default users
const initializeDefaultUsers = () => {
  const defaultUsers: User[] = [
    {
      id: 'admin',
      fullName: 'System Administrator',
      email: 'admin@gce.cm',
      passwordHash: hashPassword('admin123'),
      userType: 'admin',
      registrationStatus: 'confirmed',
      emailVerified: true,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'GCE2025-ST-003421',
      fullName: 'Jean-Michel Fopa',
      email: 'jean.fopa@student.cm',
      passwordHash: hashPassword('student123'),
      userType: 'student',
      registrationStatus: 'confirmed',
      emailVerified: true,
      examLevel: 'Advanced Level (A Level)',
      examCenter: 'GBHS Limbe',
      centerCode: 'GBHS-001',
      candidateNumber: 'CM2025-12345',
      dateOfBirth: '2005-03-15',
      subjects: [
        { code: 'ALG', name: 'English Literature', status: 'confirmed' },
        { code: 'AFR', name: 'French', status: 'confirmed' },
        { code: 'AMH', name: 'Mathematics', status: 'confirmed' },
        { code: 'APY', name: 'Physics', status: 'confirmed' },
        { code: 'ACY', name: 'Chemistry', status: 'confirmed' }
      ],
      createdAt: '2025-01-15T00:00:00Z'
    },
    {
      id: 'GCE2025-TC-001',
      fullName: 'Dr. Sarah Mbeki',
      email: 'sarah.mbeki@school.cm',
      passwordHash: hashPassword('teacher123'),
      userType: 'teacher',
      registrationStatus: 'confirmed',
      emailVerified: true,
      school: 'Government High School Yaoundé',
      createdAt: '2025-01-10T00:00:00Z'
    }
  ];

  // Add default users to their respective storages
  defaultUsers.forEach(user => {
    const storage = getUserStorage(user.userType);
    storage.set(user.email.toLowerCase(), user);
  });

  // Add a demo student for testing purposes
  const demoStudent: User = {
    id: 'demo-student',
    fullName: 'Demo Student',
    email: 'demo.student@gce.cm',
    passwordHash: hashPassword('demo123'),
    userType: 'student',
    registrationStatus: 'confirmed',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    examLevel: 'Advanced Level (A Level)',
    examCenter: 'Demo Examination Center',
    centerCode: 'DEMO-001',
    dateOfBirth: '2000-01-01',
    candidateNumber: 'DEMO123456',
    subjects: [
      { code: 'ALG', name: 'English Literature', status: 'confirmed' },
      { code: 'MAT', name: 'Mathematics', status: 'confirmed' },
      { code: 'PHY', name: 'Physics', status: 'confirmed' },
      { code: 'CHE', name: 'Chemistry', status: 'confirmed' }
    ]
  };

  studentUsers.set(demoStudent.email.toLowerCase(), demoStudent);
};

// Initialize default users
initializeDefaultUsers();

// User storage operations - Now using PostgreSQL
export const userStorage = {
  // Create a new user (async)
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): Promise<User> => {
    return await postgresDb.createUser(userData);
  },

  // Legacy sync version for backward compatibility (will be deprecated)
  createUserSync: (userData: Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): User => {
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

    // Store user in the appropriate storage by email (lowercase for case-insensitive lookup)
    const storage = getUserStorage(user.userType);
    storage.set(user.email.toLowerCase(), user);

    return user;
  },

  // Find user by email (async - searches all schemas including separate student databases)
  findByEmail: async (email: string): Promise<User | null> => {
    // First check student databases
    const studentResult = await SeparateStudentDatabase.findStudentByEmail(email);
    if (studentResult) {
      const { student, examLevel } = studentResult;
      // Convert to User interface format
      return {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        userType: 'student',
        passwordHash: student.passwordHash,
        registrationStatus: student.registrationStatus,
        emailVerified: student.emailVerified,
        examLevel: examLevel,
        examCenter: student.examCenter,
        centerCode: student.centerCode,
        candidateNumber: student.candidateNumber,
        dateOfBirth: student.dateOfBirth,
        subjects: student.oLevelSubjects || student.aLevelSubjects || [],
        createdAt: student.createdAt,
        lastLogin: student.lastLogin,
        // Additional student fields for profile display
        gender: student.gender,
        phoneNumber: student.phoneNumber,
        region: student.region,
        schoolCenterNumber: student.schoolCenterNumber,
        parentGuardianName: student.parentGuardianName,
        parentGuardianPhone: student.parentGuardianPhone,
        emergencyContactName: student.emergencyContactName,
        emergencyContactPhone: student.emergencyContactPhone,
        previousSchool: student.previousSchool,
        profilePicturePath: student.profilePicturePath
      };
    }

    // Then check other user types
    return await postgresDb.findByEmail(email);
  },

  // Find user by email and user type (async - secure method)
  findByEmailAndType: async (email: string, userType: User['userType']): Promise<User | null> => {
    return await postgresDb.findByEmailAndType(email, userType);
  },

  // Find user by ID (async)
  findById: async (id: string): Promise<User | null> => {
    return await postgresDb.findById(id);
  },

  // Legacy sync versions for backward compatibility (will be deprecated)
  findByEmailSync: (email: string): User | null => {
    const emailLower = email.toLowerCase();
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const storage = getUserStorage(userType);
      const user = storage.get(emailLower);
      if (user) return user;
    }
    return null;
  },

  findByEmailAndTypeSync: (email: string, userType: User['userType']): User | null => {
    const storage = getUserStorage(userType);
    return storage.get(email.toLowerCase()) || null;
  },

  findByIdSync: (id: string): User | null => {
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const storage = getUserStorage(userType);
      for (const user of storage.values()) {
        if (user.id === id) return user;
      }
    }
    return null;
  },

  // Get all users (async)
  getAllUsers: async (): Promise<User[]> => {
    return await postgresDb.getAllUsers();
  },

  // Get users by type (async - secure method)
  getUsersByType: async (userType: User['userType']): Promise<User[]> => {
    if (userType === 'student') {
      // For students, get from both O Level and A Level databases
      const [oLevelStudents, aLevelStudents] = await Promise.all([
        SeparateStudentDatabase.getAllOLevelStudents(),
        SeparateStudentDatabase.getAllALevelStudents()
      ]);

      // Convert to User interface format
      const convertStudent = (student: any, examLevel: 'O Level' | 'A Level'): User => ({
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        userType: 'student',
        passwordHash: student.passwordHash,
        registrationStatus: student.registrationStatus,
        emailVerified: student.emailVerified,
        examLevel: examLevel,
        examCenter: student.examCenter,
        centerCode: student.centerCode,
        candidateNumber: student.candidateNumber,
        dateOfBirth: student.dateOfBirth,
        subjects: student.oLevelSubjects || student.aLevelSubjects || [],
        createdAt: student.createdAt,
        lastLogin: student.lastLogin
      });

      return [
        ...oLevelStudents.map(s => convertStudent(s, 'O Level')),
        ...aLevelStudents.map(s => convertStudent(s, 'A Level'))
      ];
    } else {
      return await postgresDb.getUsersByType(userType);
    }
  },

  // Create user (async - uses PostgreSQL with separate student databases)
  createUser: async (userData: Partial<User>): Promise<User> => {
    // If it's a student, use the separate student database system
    if (userData.userType === 'student') {
      const studentData = {
        fullName: userData.fullName || '',
        email: userData.email || '',
        password: userData.password || '',
        examLevel: userData.examLevel as 'O Level' | 'A Level',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        phoneNumber: userData.phoneNumber || '',
        region: userData.region || '',
        schoolCenterNumber: userData.schoolCenterNumber || '',
        candidateNumber: userData.candidateNumber || '',
        parentGuardianName: userData.parentGuardianName || '',
        parentGuardianPhone: userData.parentGuardianPhone || '',
        emergencyContactName: userData.emergencyContactName || '',
        emergencyContactPhone: userData.emergencyContactPhone || '',
        previousSchool: userData.previousSchool || '',
        securityQuestion: userData.securityQuestion || '',
        securityAnswer: userData.securityAnswer || '',
        // Optional fields
        nationalIdNumber: userData.nationalIdNumber,
        placeOfBirth: userData.placeOfBirth,
        division: userData.division,
        currentAddress: userData.currentAddress,
        parentGuardianRelation: userData.parentGuardianRelation,
        emergencyContactRelation: userData.emergencyContactRelation,
        previousSchoolRegion: userData.previousSchoolRegion,
        yearOfCompletion: userData.yearOfCompletion,
        profilePicturePath: userData.profilePicturePath,
        // A Level specific
        oLevelResults: userData.oLevelResults,
        universityChoices: userData.universityChoices,
        careerPath: userData.careerPath
      };

      const newStudent = await SeparateStudentDatabase.createStudent(studentData);

      // Convert to User interface format
      return {
        id: newStudent.id,
        fullName: newStudent.fullName,
        email: newStudent.email,
        userType: 'student',
        passwordHash: newStudent.passwordHash,
        registrationStatus: newStudent.registrationStatus,
        emailVerified: newStudent.emailVerified,
        examLevel: userData.examLevel,
        examCenter: userData.examCenter,
        centerCode: newStudent.centerCode,
        candidateNumber: newStudent.candidateNumber,
        dateOfBirth: newStudent.dateOfBirth,
        subjects: newStudent.oLevelSubjects || newStudent.aLevelSubjects || [],
        createdAt: newStudent.createdAt,
        lastLogin: newStudent.lastLogin
      };
    } else {
      // For teachers and examiners, use the original PostgreSQL system
      return await postgresDb.createUser(userData);
    }
  },

  // Legacy sync versions
  getAllUsersSync: (): User[] => {
    const allUsers: User[] = [];
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const storage = getUserStorage(userType);
      allUsers.push(...Array.from(storage.values()));
    }
    return allUsers;
  },

  getUsersByTypeSync: (userType: User['userType']): User[] => {
    const storage = getUserStorage(userType);
    return Array.from(storage.values());
  },

  // Update user
  updateUser: (email: string, updates: Partial<User>): User | null => {
    const emailLower = email.toLowerCase();

    // Find user in appropriate storage
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const storage = getUserStorage(userType);
      const user = storage.get(emailLower);
      if (user) {
        const updatedUser = { ...user, ...updates };
        storage.set(emailLower, updatedUser);
        return updatedUser;
      }
    }
    return null;
  },

  // Delete user
  deleteUser: (email: string): boolean => {
    const emailLower = email.toLowerCase();

    // Find and delete user from appropriate storage
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const storage = getUserStorage(userType);
      if (storage.has(emailLower)) {
        return storage.delete(emailLower);
      }
    }
    return false;
  },

  // Verify password (async - searches all schemas including separate student databases)
  verifyPassword: async (email: string, password: string): Promise<boolean> => {
    // First check student databases
    const studentResult = await SeparateStudentDatabase.verifyStudentPassword(email, password);
    if (studentResult.valid) {
      return true;
    }

    // Then check other user types
    const user = await postgresDb.findByEmail(email);
    if (!user) return false;

    // Use bcrypt to verify password (consistent with PostgreSQL implementation)
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, user.passwordHash);
  },

  // Verify password by user type (async - secure method)
  verifyPasswordByType: async (email: string, password: string, userType: User['userType']): Promise<boolean> => {
    return await postgresDb.verifyPasswordByType(email, password, userType);
  },

  // Legacy sync versions (Note: These should be avoided, use async versions)
  verifyPasswordSync: (email: string, password: string): boolean => {
    const user = userStorage.findByEmailSync(email);
    if (!user) return false;

    // For legacy users that might still use SHA256, try both methods
    const bcrypt = require('bcryptjs');
    try {
      // Try bcrypt first (new method)
      return bcrypt.compareSync(password, user.passwordHash);
    } catch {
      // Fallback to SHA256 for legacy users
      const hashedInput = hashPassword(password);
      return hashedInput === user.passwordHash;
    }
  },

  verifyPasswordByTypeSync: (email: string, password: string, userType: User['userType']): boolean => {
    const storage = getUserStorage(userType);
    const user = storage.get(email.toLowerCase());
    if (!user) return false;

    // For legacy users that might still use SHA256, try both methods
    const bcrypt = require('bcryptjs');
    try {
      // Try bcrypt first (new method)
      return bcrypt.compareSync(password, user.passwordHash);
    } catch {
      // Fallback to SHA256 for legacy users
      const hashedInput = hashPassword(password);
      return hashedInput === user.passwordHash;
    }
  },

  // Update last login
  updateLastLogin: (email: string): void => {
    const emailLower = email.toLowerCase();

    // Find user in appropriate storage and update
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const storage = getUserStorage(userType);
      const user = storage.get(emailLower);
      if (user) {
        user.lastLogin = new Date().toISOString();
        storage.set(emailLower, user);
        return;
      }
    }
  },

  // Check if email exists (async - searches all schemas)
  emailExists: async (email: string): Promise<boolean> => {
    return await postgresDb.emailExists(email);
  },

  // Check if email exists in specific user type (async - secure method)
  emailExistsInType: async (email: string, userType: User['userType']): Promise<boolean> => {
    return await postgresDb.emailExistsInType(email, userType);
  },

  // Legacy sync versions
  emailExistsSync: (email: string): boolean => {
    const emailLower = email.toLowerCase();
    for (const userType of ['student', 'teacher', 'examiner', 'admin'] as const) {
      const storage = getUserStorage(userType);
      if (storage.has(emailLower)) return true;
    }
    return false;
  },

  emailExistsInTypeSync: (email: string, userType: User['userType']): boolean => {
    const storage = getUserStorage(userType);
    return storage.has(email.toLowerCase());
  },

  // Get user count by type (async)
  getUserCountByType: async (userType: User['userType']): Promise<number> => {
    const users = await postgresDb.getUsersByType(userType);
    return users.length;
  },

  // Get users by status (async)
  getUsersByStatus: async (status: User['registrationStatus']): Promise<User[]> => {
    const allUsers = await postgresDb.getAllUsers();
    return allUsers.filter(user => user.registrationStatus === status);
  },

  // Legacy sync versions
  getUserCountByTypeSync: (userType: User['userType']): number => {
    const storage = getUserStorage(userType);
    return storage.size;
  },

  getUsersByStatusSync: (status: User['registrationStatus']): User[] => {
    const allUsers = userStorage.getAllUsersSync();
    return allUsers.filter(user => user.registrationStatus === status);
  }
};

// Export for debugging (remove in production)
export const debugStorage = () => {
  console.log('=== USER STORAGE DEBUG ===');
  console.log('Students:', Array.from(studentUsers.entries()));
  console.log('Teachers:', Array.from(teacherUsers.entries()));
  console.log('Examiners:', Array.from(examinerUsers.entries()));
  console.log('Admins:', Array.from(adminUsers.entries()));
  console.log('========================');
};
