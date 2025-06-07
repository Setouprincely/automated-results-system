/**
 * 🗄️ Separate Student Database Handler
 * Manages O Level and A Level students in completely separate databases
 */

import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface StudentData {
  id?: string;
  fullName: string;
  email: string;
  password?: string;
  passwordHash?: string;
  examLevel: 'O Level' | 'A Level';
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  region: string;
  schoolCenterNumber: string;
  candidateNumber: string;
  parentGuardianName: string;
  parentGuardianPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  previousSchool: string;
  securityQuestion: string;
  securityAnswer: string;
  // Optional fields
  nationalIdNumber?: string;
  placeOfBirth?: string;
  division?: string;
  currentAddress?: string;
  parentGuardianRelation?: string;
  emergencyContactRelation?: string;
  previousSchoolRegion?: string;
  yearOfCompletion?: string;
  profilePicturePath?: string;
  // A Level specific
  oLevelResults?: any;
  universityChoices?: any;
  careerPath?: string;
}

export class SeparateStudentDatabase {

  /**
   * Create a new student in the appropriate database (O Level or A Level)
   */
  static async createStudent(studentData: StudentData): Promise<any> {
    const { examLevel, password, securityAnswer, ...otherData } = studentData;

    // Hash password and security answer
    const passwordHash = password ? await bcrypt.hash(password, 12) : '';
    const securityAnswerHash = await bcrypt.hash(securityAnswer, 12);

    const userData = {
      ...otherData,
      passwordHash,
      securityAnswerHash,
      registrationStatus: 'confirmed',
      emailVerified: true, // Set to true for immediate login access
      documentsVerified: false,
      parentalConsentGiven: false,
      identityVerified: false,
      // Required fields for both O Level and A Level
      examCenter: `Center-${otherData.schoolCenterNumber}`,
      centerCode: otherData.schoolCenterNumber,
      // Provide default values for fields not on the form
      parentGuardianName: otherData.parentGuardianName || 'Not Provided',
      parentGuardianPhone: otherData.parentGuardianPhone || 'Not Provided',
      emergencyContactName: otherData.emergencyContactName || 'Not Provided',
      emergencyContactPhone: otherData.emergencyContactPhone || 'Not Provided',
      previousSchool: otherData.previousSchool || 'Not Provided',
      securityQuestion: otherData.securityQuestion || 'What is your favorite color?'
    };

    if (examLevel === 'O Level') {
      // Create in O Level database
      return await prisma.oLevelStudent.create({
        data: {
          ...userData,
          oLevelSubjects: studentData.oLevelResults || null,
          previousOLevelAttempts: 0,
          isRepeatingCandidate: false
        }
      });
    } else if (examLevel === 'A Level') {
      // Create in A Level database
      return await prisma.aLevelStudent.create({
        data: {
          ...userData,
          aLevelSubjects: null,
          oLevelResults: studentData.oLevelResults || null,
          universityChoices: studentData.universityChoices || null,
          careerPath: studentData.careerPath || null
        }
      });
    } else {
      throw new Error('Invalid exam level. Must be "O Level" or "A Level"');
    }
  }

  /**
   * Find student by email across both databases
   */
  static async findStudentByEmail(email: string): Promise<{ student: any; examLevel: 'O Level' | 'A Level' } | null> {
    // Check O Level database first
    const oLevelStudent = await prisma.oLevelStudent.findUnique({
      where: { email }
    });

    if (oLevelStudent) {
      return { student: oLevelStudent, examLevel: 'O Level' };
    }

    // Check A Level database
    const aLevelStudent = await prisma.aLevelStudent.findUnique({
      where: { email }
    });

    if (aLevelStudent) {
      return { student: aLevelStudent, examLevel: 'A Level' };
    }

    return null;
  }

  /**
   * Find student by ID with exam level
   */
  static async findStudentById(id: string, examLevel: 'O Level' | 'A Level'): Promise<any | null> {
    if (examLevel === 'O Level') {
      return await prisma.oLevelStudent.findUnique({
        where: { id }
      });
    } else {
      return await prisma.aLevelStudent.findUnique({
        where: { id }
      });
    }
  }

  /**
   * Verify password for student
   */
  static async verifyStudentPassword(email: string, password: string): Promise<{ valid: boolean; student?: any; examLevel?: 'O Level' | 'A Level' }> {
    const result = await this.findStudentByEmail(email);

    if (!result) {
      return { valid: false };
    }

    const { student, examLevel } = result;
    const isValid = await bcrypt.compare(password, student.passwordHash);

    if (isValid) {
      return { valid: true, student, examLevel };
    }

    return { valid: false };
  }

  /**
   * Get all O Level students
   */
  static async getAllOLevelStudents(): Promise<any[]> {
    return await prisma.oLevelStudent.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        candidateNumber: true,
        schoolCenterNumber: true,
        region: true,
        registrationStatus: true,
        createdAt: true
        // Don't include sensitive data
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get all A Level students
   */
  static async getAllALevelStudents(): Promise<any[]> {
    return await prisma.aLevelStudent.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        candidateNumber: true,
        schoolCenterNumber: true,
        region: true,
        registrationStatus: true,
        createdAt: true
        // Don't include sensitive data
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get students by school center number
   */
  static async getStudentsBySchool(centerNumber: string): Promise<{ oLevel: any[]; aLevel: any[]; total: number }> {
    const [oLevelStudents, aLevelStudents] = await Promise.all([
      prisma.oLevelStudent.findMany({
        where: { schoolCenterNumber: centerNumber },
        select: {
          id: true,
          fullName: true,
          email: true,
          candidateNumber: true,
          region: true,
          registrationStatus: true,
          createdAt: true
        }
      }),
      prisma.aLevelStudent.findMany({
        where: { schoolCenterNumber: centerNumber },
        select: {
          id: true,
          fullName: true,
          email: true,
          candidateNumber: true,
          region: true,
          registrationStatus: true,
          createdAt: true
        }
      })
    ]);

    return {
      oLevel: oLevelStudents,
      aLevel: aLevelStudents,
      total: oLevelStudents.length + aLevelStudents.length
    };
  }

  /**
   * Update student record
   */
  static async updateStudent(studentId: string, examLevel: 'O Level' | 'A Level', updateData: any) {
    try {
      console.log(`🔄 Updating ${examLevel} student: ${studentId}`);
      console.log(`📝 Update data:`, updateData);

      if (examLevel === 'O Level') {
        const updatedStudent = await prisma.oLevelStudent.update({
          where: { id: studentId },
          data: updateData
        });
        console.log(`✅ Updated O Level student: ${updatedStudent.fullName}`);
        return updatedStudent;
      } else {
        const updatedStudent = await prisma.aLevelStudent.update({
          where: { id: studentId },
          data: updateData
        });
        console.log(`✅ Updated A Level student: ${updatedStudent.fullName}`);
        return updatedStudent;
      }
    } catch (error) {
      console.error(`Error updating ${examLevel} student:`, error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  static async getStatistics(): Promise<{
    oLevelCount: number;
    aLevelCount: number;
    totalStudents: number;
    byRegion: any;
    bySchool: any;
  }> {
    const [oLevelCount, aLevelCount] = await Promise.all([
      prisma.oLevelStudent.count(),
      prisma.aLevelStudent.count()
    ]);

    // Get regional distribution
    const [oLevelByRegion, aLevelByRegion] = await Promise.all([
      prisma.oLevelStudent.groupBy({
        by: ['region'],
        _count: { id: true }
      }),
      prisma.aLevelStudent.groupBy({
        by: ['region'],
        _count: { id: true }
      })
    ]);

    // Get school distribution
    const [oLevelBySchool, aLevelBySchool] = await Promise.all([
      prisma.oLevelStudent.groupBy({
        by: ['schoolCenterNumber'],
        _count: { id: true }
      }),
      prisma.aLevelStudent.groupBy({
        by: ['schoolCenterNumber'],
        _count: { id: true }
      })
    ]);

    return {
      oLevelCount,
      aLevelCount,
      totalStudents: oLevelCount + aLevelCount,
      byRegion: {
        oLevel: oLevelByRegion,
        aLevel: aLevelByRegion
      },
      bySchool: {
        oLevel: oLevelBySchool,
        aLevel: aLevelBySchool
      }
    };
  }

  /**
   * Check if email exists in either database
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await this.findStudentByEmail(email);
    return result !== null;
  }

  /**
   * Transfer student between O Level and A Level (rare case)
   */
  static async transferStudent(studentId: string, fromLevel: 'O Level' | 'A Level', toLevel: 'O Level' | 'A Level'): Promise<any> {
    if (fromLevel === toLevel) {
      throw new Error('Cannot transfer to the same level');
    }

    // Get student data from source database
    const sourceStudent = await this.findStudentById(studentId, fromLevel);
    if (!sourceStudent) {
      throw new Error('Student not found in source database');
    }

    // Create in destination database
    const transferData: StudentData = {
      ...sourceStudent,
      examLevel: toLevel
    };

    const newStudent = await this.createStudent(transferData);

    // Delete from source database
    if (fromLevel === 'O Level') {
      await prisma.oLevelStudent.delete({ where: { id: studentId } });
    } else {
      await prisma.aLevelStudent.delete({ where: { id: studentId } });
    }

    return newStudent;
  }
}

export default SeparateStudentDatabase;
