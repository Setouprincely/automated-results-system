// Seed script for GCE System PostgreSQL database
// This populates the database with initial data for testing

import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Password hashing utility
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

async function main() {
  console.log('🌱 Seeding GCE System database...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.studentUser.deleteMany();
  await prisma.teacherUser.deleteMany();
  await prisma.examinerUser.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.examCenter.deleteMany();
  await prisma.examSession.deleteMany();

  // Create subjects
  console.log('📚 Creating subjects...');
  const subjects = await Promise.all([
    // O Level subjects
    prisma.subject.create({
      data: {
        code: 'OLG',
        name: 'English Language',
        level: 'O Level',
        description: 'General Certificate of Education Ordinary Level English Language'
      }
    }),
    prisma.subject.create({
      data: {
        code: 'OFR',
        name: 'French',
        level: 'O Level',
        description: 'General Certificate of Education Ordinary Level French'
      }
    }),
    prisma.subject.create({
      data: {
        code: 'OMH',
        name: 'Mathematics',
        level: 'O Level',
        description: 'General Certificate of Education Ordinary Level Mathematics'
      }
    }),
    // A Level subjects
    prisma.subject.create({
      data: {
        code: 'ALG',
        name: 'English Literature',
        level: 'A Level',
        description: 'General Certificate of Education Advanced Level English Literature'
      }
    }),
    prisma.subject.create({
      data: {
        code: 'AMH',
        name: 'Mathematics',
        level: 'A Level',
        description: 'General Certificate of Education Advanced Level Mathematics'
      }
    }),
    prisma.subject.create({
      data: {
        code: 'APY',
        name: 'Physics',
        level: 'A Level',
        description: 'General Certificate of Education Advanced Level Physics'
      }
    }),
    prisma.subject.create({
      data: {
        code: 'ACY',
        name: 'Chemistry',
        level: 'A Level',
        description: 'General Certificate of Education Advanced Level Chemistry'
      }
    }),
    prisma.subject.create({
      data: {
        code: 'ABY',
        name: 'Biology',
        level: 'A Level',
        description: 'General Certificate of Education Advanced Level Biology'
      }
    })
  ]);

  // Create exam centers
  console.log('🏫 Creating exam centers...');
  const examCenters = await Promise.all([
    prisma.examCenter.create({
      data: {
        code: 'GBHS-001',
        name: 'Government High School Limbe',
        location: 'Limbe, South West Region',
        address: 'Mile 1, Limbe',
        capacity: 500,
        facilities: ['Computer Lab', 'Science Lab', 'Library']
      }
    }),
    prisma.examCenter.create({
      data: {
        code: 'GBHS-002',
        name: 'Government High School Yaoundé',
        location: 'Yaoundé, Centre Region',
        address: 'Bastos, Yaoundé',
        capacity: 800,
        facilities: ['Computer Lab', 'Science Lab', 'Library', 'Audio Visual Room']
      }
    }),
    prisma.examCenter.create({
      data: {
        code: 'DEMO-001',
        name: 'Demo Examination Center',
        location: 'Demo City',
        address: 'Demo Address',
        capacity: 300,
        facilities: ['Computer Lab', 'Science Lab']
      }
    })
  ]);

  // Create exam session
  console.log('📅 Creating exam session...');
  const examSession = await prisma.examSession.create({
    data: {
      name: 'June 2025 GCE',
      level: 'A Level',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      registrationStart: new Date('2025-01-01'),
      registrationEnd: new Date('2025-03-31'),
      isActive: true
    }
  });

  // Create admin user
  console.log('👨‍💻 Creating admin user...');
  const adminUser = await prisma.adminUser.create({
    data: {
      id: 'admin',
      fullName: 'System Administrator',
      email: 'admin@gce.cm',
      passwordHash: await hashPassword('admin123'),
      registrationStatus: 'confirmed',
      emailVerified: true,
      role: 'super_admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      region: 'National'
    }
  });

  // Create demo student
  console.log('👨‍🎓 Creating demo student...');
  const demoStudent = await prisma.studentUser.create({
    data: {
      id: 'demo-student',
      fullName: 'Demo Student',
      email: 'demo.student@gce.cm',
      passwordHash: await hashPassword('demo123'),
      registrationStatus: 'confirmed',
      emailVerified: true,
      examLevel: 'A Level',
      examCenter: 'Demo Examination Center',
      centerCode: 'DEMO-001',
      candidateNumber: 'DEMO123456',
      dateOfBirth: '2000-01-01',
      subjects: [
        { code: 'ALG', name: 'English Literature', status: 'confirmed' },
        { code: 'AMH', name: 'Mathematics', status: 'confirmed' },
        { code: 'APY', name: 'Physics', status: 'confirmed' },
        { code: 'ACY', name: 'Chemistry', status: 'confirmed' }
      ]
    }
  });

  // Create sample student
  console.log('👨‍🎓 Creating sample student...');
  const sampleStudent = await prisma.studentUser.create({
    data: {
      id: 'GCE2025-ST-003421',
      fullName: 'Jean-Michel Fopa',
      email: 'jean.fopa@student.cm',
      passwordHash: await hashPassword('student123'),
      registrationStatus: 'confirmed',
      emailVerified: true,
      examLevel: 'A Level',
      examCenter: 'Government High School Limbe',
      centerCode: 'GBHS-001',
      candidateNumber: 'CM2025-12345',
      dateOfBirth: '2005-03-15',
      subjects: [
        { code: 'ALG', name: 'English Literature', status: 'confirmed' },
        { code: 'AFR', name: 'French', status: 'confirmed' },
        { code: 'AMH', name: 'Mathematics', status: 'confirmed' },
        { code: 'APY', name: 'Physics', status: 'confirmed' },
        { code: 'ACY', name: 'Chemistry', status: 'confirmed' }
      ]
    }
  });

  // Create teacher user
  console.log('👨‍🏫 Creating teacher user...');
  const teacherUser = await prisma.teacherUser.create({
    data: {
      id: 'GCE2025-TC-001',
      fullName: 'Dr. Sarah Mbeki',
      email: 'sarah.mbeki@school.cm',
      passwordHash: await hashPassword('teacher123'),
      registrationStatus: 'confirmed',
      emailVerified: true,
      school: 'Government High School Yaoundé',
      teachingSubjects: [
        { code: 'AMH', name: 'Mathematics', level: 'A Level' },
        { code: 'APY', name: 'Physics', level: 'A Level' }
      ],
      qualifications: [
        { degree: 'PhD Mathematics', institution: 'University of Yaoundé I', year: 2015 },
        { degree: 'Teaching Certificate', institution: 'ENS Yaoundé', year: 2010 }
      ]
    }
  });

  // Create examiner user
  console.log('👨‍💼 Creating examiner user...');
  const examinerUser = await prisma.examinerUser.create({
    data: {
      id: 'GCE2025-EX-001',
      fullName: 'Prof. Emmanuel Ndongo',
      email: 'emmanuel.ndongo@examiner.cm',
      passwordHash: await hashPassword('examiner123'),
      registrationStatus: 'confirmed',
      emailVerified: true,
      specialization: 'Mathematics and Physics',
      examiningLevel: 'A Level',
      certifications: [
        { type: 'Senior Examiner', subject: 'Mathematics', year: 2020 },
        { type: 'Chief Examiner', subject: 'Physics', year: 2022 }
      ]
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🔐 Demo Credentials:');
  console.log('Admin:    admin@gce.cm / admin123');
  console.log('Student:  demo.student@gce.cm / demo123');
  console.log('Student:  jean.fopa@student.cm / student123');
  console.log('Teacher:  sarah.mbeki@school.cm / teacher123');
  console.log('Examiner: emmanuel.ndongo@examiner.cm / examiner123');
  console.log('');
  console.log('📊 Data created:');
  console.log(`Subjects: ${subjects.length}`);
  console.log(`Exam Centers: ${examCenters.length}`);
  console.log(`Exam Sessions: 1`);
  console.log(`Students: 2`);
  console.log(`Teachers: 1`);
  console.log(`Examiners: 1`);
  console.log(`Admins: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
