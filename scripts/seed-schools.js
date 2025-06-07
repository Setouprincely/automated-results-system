#!/usr/bin/env node

/**
 * 🏫 Seed Schools Database
 * Populates the schools table with Cameroon schools and their center numbers
 */

const { PrismaClient } = require('../src/generated/prisma');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const cameroonSchools = [
  // Littoral Region
  {
    centerNumber: '001',
    name: 'Government High School Limbe',
    fullName: 'Government High School Limbe',
    region: 'Southwest',
    division: 'Fako',
    address: 'Limbe, Southwest Region',
    phoneNumber: '+237 233 332 234',
    email: 'ghs.limbe@education.cm',
    principalName: 'Dr. Mary Ngole',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 1200
  },
  {
    centerNumber: '002',
    name: 'Government High School Douala',
    fullName: 'Government High School Douala',
    region: 'Littoral',
    division: 'Wouri',
    address: 'Douala, Littoral Region',
    phoneNumber: '+237 233 342 567',
    email: 'ghs.douala@education.cm',
    principalName: 'Prof. Jean Baptiste Ekindi',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 1500
  },
  {
    centerNumber: '003',
    name: 'Government High School Yaoundé',
    fullName: 'Government High School Yaoundé',
    region: 'Centre',
    division: 'Mfoundi',
    address: 'Yaoundé, Centre Region',
    phoneNumber: '+237 222 234 567',
    email: 'ghs.yaounde@education.cm',
    principalName: 'Dr. Catherine Mballa',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 1800
  },
  {
    centerNumber: '004',
    name: 'Government High School Bamenda',
    fullName: 'Government High School Bamenda',
    region: 'Northwest',
    division: 'Mezam',
    address: 'Bamenda, Northwest Region',
    phoneNumber: '+237 233 362 234',
    email: 'ghs.bamenda@education.cm',
    principalName: 'Mr. Peter Nkwenti',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 1400
  },
  {
    centerNumber: '005',
    name: 'Government High School Bafoussam',
    fullName: 'Government High School Bafoussam',
    region: 'West',
    division: 'Mifi',
    address: 'Bafoussam, West Region',
    phoneNumber: '+237 233 442 567',
    email: 'ghs.bafoussam@education.cm',
    principalName: 'Mrs. Françoise Kamga',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 1100
  },
  {
    centerNumber: '006',
    name: 'Government High School Garoua',
    fullName: 'Government High School Garoua',
    region: 'North',
    division: 'Bénoué',
    address: 'Garoua, North Region',
    phoneNumber: '+237 222 272 234',
    email: 'ghs.garoua@education.cm',
    principalName: 'Alhaji Ahmadou Bello',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 1000
  },
  {
    centerNumber: '007',
    name: 'Government High School Maroua',
    fullName: 'Government High School Maroua',
    region: 'Far North',
    division: 'Diamaré',
    address: 'Maroua, Far North Region',
    phoneNumber: '+237 222 292 567',
    email: 'ghs.maroua@education.cm',
    principalName: 'Dr. Aisha Moussa',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 900
  },
  {
    centerNumber: '008',
    name: 'Government High School Bertoua',
    fullName: 'Government High School Bertoua',
    region: 'East',
    division: 'Lom-et-Djérem',
    address: 'Bertoua, East Region',
    phoneNumber: '+237 222 242 234',
    email: 'ghs.bertoua@education.cm',
    principalName: 'Mr. Paul Ondoa',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 800
  },
  {
    centerNumber: '009',
    name: 'Government High School Ebolowa',
    fullName: 'Government High School Ebolowa',
    region: 'South',
    division: 'Mvila',
    address: 'Ebolowa, South Region',
    phoneNumber: '+237 222 282 567',
    email: 'ghs.ebolowa@education.cm',
    principalName: 'Mrs. Marie Atangana',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 700
  },
  {
    centerNumber: '010',
    name: 'Government High School Ngaoundéré',
    fullName: 'Government High School Ngaoundéré',
    region: 'Adamawa',
    division: 'Vina',
    address: 'Ngaoundéré, Adamawa Region',
    phoneNumber: '+237 222 252 234',
    email: 'ghs.ngaoundere@education.cm',
    principalName: 'Dr. Hamidou Yaya',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 950
  },
  // Private Schools
  {
    centerNumber: '011',
    name: 'Sacred Heart College Mankon',
    fullName: 'Sacred Heart College Mankon',
    region: 'Northwest',
    division: 'Mezam',
    address: 'Mankon, Bamenda',
    phoneNumber: '+237 233 362 890',
    email: 'shc.mankon@catholic.cm',
    principalName: 'Rev. Fr. Michael Tanyi',
    schoolType: 'Mission',
    level: 'High School',
    studentCapacity: 800
  },
  {
    centerNumber: '012',
    name: 'Presbyterian Secondary School Bali',
    fullName: 'Presbyterian Secondary School Bali',
    region: 'Northwest',
    division: 'Mezam',
    address: 'Bali, Northwest Region',
    phoneNumber: '+237 233 362 445',
    email: 'pss.bali@pcc.cm',
    principalName: 'Rev. John Fru',
    schoolType: 'Mission',
    level: 'High School',
    studentCapacity: 600
  },
  {
    centerNumber: '013',
    name: 'Collège Libermann Douala',
    fullName: 'Collège Libermann Douala',
    region: 'Littoral',
    division: 'Wouri',
    address: 'Bonanjo, Douala',
    phoneNumber: '+237 233 342 789',
    email: 'libermann.douala@spiritains.cm',
    principalName: 'Rev. Fr. Pierre Mbarga',
    schoolType: 'Mission',
    level: 'High School',
    studentCapacity: 1000
  },
  {
    centerNumber: '014',
    name: 'Collège Vogt Yaoundé',
    fullName: 'Collège Vogt Yaoundé',
    region: 'Centre',
    division: 'Mfoundi',
    address: 'Centre-ville, Yaoundé',
    phoneNumber: '+237 222 234 890',
    email: 'vogt.yaounde@education.cm',
    principalName: 'Dr. Emmanuel Nkou',
    schoolType: 'Private',
    level: 'High School',
    studentCapacity: 900
  },
  {
    centerNumber: '015',
    name: 'Bilingual Grammar School Molyko',
    fullName: 'Bilingual Grammar School Molyko',
    region: 'Southwest',
    division: 'Fako',
    address: 'Molyko, Buea',
    phoneNumber: '+237 233 332 567',
    email: 'bgs.molyko@education.cm',
    principalName: 'Mrs. Grace Epie',
    schoolType: 'Government',
    level: 'High School',
    studentCapacity: 750
  }
];

async function seedSchools() {
  const prisma = new PrismaClient();
  
  try {
    console.log(`${colors.bold}${colors.blue}🏫 Seeding Schools Database${colors.reset}\n`);

    // Clear existing schools
    console.log(`${colors.yellow}Clearing existing schools...${colors.reset}`);
    await prisma.school.deleteMany();
    console.log(`${colors.green}✅ Existing schools cleared${colors.reset}`);

    // Insert schools
    console.log(`\n${colors.yellow}Inserting ${cameroonSchools.length} schools...${colors.reset}`);
    
    for (const school of cameroonSchools) {
      const createdSchool = await prisma.school.create({
        data: school
      });
      
      console.log(`${colors.green}✅ ${school.centerNumber}${colors.reset} - ${school.name} (${school.region})`);
    }

    // Display summary
    console.log(`\n${colors.bold}${colors.blue}📊 Schools Database Summary${colors.reset}`);
    
    const schoolsByRegion = await prisma.school.groupBy({
      by: ['region'],
      _count: {
        id: true
      }
    });

    const schoolsByType = await prisma.school.groupBy({
      by: ['schoolType'],
      _count: {
        id: true
      }
    });

    console.log(`\n${colors.cyan}Schools by Region:${colors.reset}`);
    schoolsByRegion.forEach(group => {
      console.log(`   ${group.region}: ${group._count.id} schools`);
    });

    console.log(`\n${colors.cyan}Schools by Type:${colors.reset}`);
    schoolsByType.forEach(group => {
      console.log(`   ${group.schoolType}: ${group._count.id} schools`);
    });

    const totalCapacity = await prisma.school.aggregate({
      _sum: {
        studentCapacity: true
      }
    });

    console.log(`\n${colors.cyan}Total Student Capacity:${colors.reset} ${totalCapacity._sum.studentCapacity?.toLocaleString()} students`);

    console.log(`\n${colors.bold}${colors.green}🎉 Schools database seeded successfully!${colors.reset}`);
    console.log(`\n${colors.cyan}Center Numbers Available:${colors.reset}`);
    console.log(`   001-010: Government High Schools`);
    console.log(`   011-015: Private/Mission Schools`);
    
    console.log(`\n${colors.yellow}Students can now use these center numbers during registration!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Error seeding schools:${colors.reset}`, error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedSchools();
}

module.exports = { seedSchools };
