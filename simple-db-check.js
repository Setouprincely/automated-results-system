#!/usr/bin/env node

/**
 * 🗄️ Simple Database Checker for GCE System
 * Shows basic database information without requiring Prisma generation
 */

const { Client } = require('pg');
require('dotenv').config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

async function checkDatabase() {
  console.log(`${colors.bold}${colors.blue}🗄️ GCE SYSTEM DATABASE CHECK${colors.reset}\n`);

  // Parse DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log(`${colors.red}❌ DATABASE_URL not found in .env file${colors.reset}`);
    return;
  }

  console.log(`${colors.cyan}🔗 Database URL: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}${colors.reset}\n`);

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    // Connect to database
    console.log(`${colors.yellow}🔌 Connecting to PostgreSQL...${colors.reset}`);
    await client.connect();
    console.log(`${colors.green}✅ Connected successfully!${colors.reset}\n`);

    // Check if schemas exist
    console.log(`${colors.bold}${colors.cyan}📋 CHECKING SCHEMAS${colors.reset}`);
    const schemaQuery = `
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('o_level_students', 'a_level_students', 'teacher_auth', 'examiner_auth', 'public')
      ORDER BY schema_name;
    `;
    
    const schemaResult = await client.query(schemaQuery);
    console.log(`${colors.green}✅ Found ${schemaResult.rows.length} schemas:${colors.reset}`);
    schemaResult.rows.forEach(row => {
      console.log(`   📁 ${row.schema_name}`);
    });
    console.log('');

    // Check tables in each schema
    const tableQuery = `
      SELECT table_schema, table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = t.table_schema AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema IN ('o_level_students', 'a_level_students', 'teacher_auth', 'examiner_auth', 'public')
      AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name;
    `;
    
    const tableResult = await client.query(tableQuery);
    console.log(`${colors.bold}${colors.cyan}📊 TABLES OVERVIEW${colors.reset}`);
    console.log(`${colors.green}✅ Found ${tableResult.rows.length} tables:${colors.reset}\n`);
    
    let currentSchema = '';
    for (const row of tableResult.rows) {
      if (row.table_schema !== currentSchema) {
        currentSchema = row.table_schema;
        console.log(`${colors.bold}📁 Schema: ${currentSchema}${colors.reset}`);
      }
      console.log(`   📋 ${row.table_name} (${row.column_count} columns)`);
    }
    console.log('');

    // Check data counts
    console.log(`${colors.bold}${colors.cyan}📈 DATA COUNTS${colors.reset}`);
    
    const dataCounts = [];
    
    // Check each table for data
    for (const row of tableResult.rows) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM "${row.table_schema}"."${row.table_name}";`;
        const countResult = await client.query(countQuery);
        const count = parseInt(countResult.rows[0].count);
        dataCounts.push({
          schema: row.table_schema,
          table: row.table_name,
          count: count
        });
      } catch (error) {
        console.log(`${colors.red}❌ Error counting ${row.table_schema}.${row.table_name}: ${error.message}${colors.reset}`);
      }
    }

    // Display data counts
    let totalRecords = 0;
    dataCounts.forEach(item => {
      const status = item.count > 0 ? colors.green : colors.dim;
      console.log(`${status}📊 ${item.schema}.${item.table}: ${item.count} records${colors.reset}`);
      totalRecords += item.count;
    });
    
    console.log(`\n${colors.bold}${colors.magenta}📈 TOTAL RECORDS: ${totalRecords}${colors.reset}\n`);

    // Show sample data from student tables if they exist
    const studentTables = dataCounts.filter(item => 
      (item.table === 'users' && (item.schema === 'o_level_students' || item.schema === 'a_level_students')) ||
      item.table === 'schools'
    );

    if (studentTables.length > 0) {
      console.log(`${colors.bold}${colors.cyan}👥 SAMPLE DATA${colors.reset}`);
      
      for (const table of studentTables) {
        if (table.count > 0) {
          try {
            let sampleQuery = '';
            if (table.table === 'users') {
              sampleQuery = `
                SELECT id, "fullName", email, "candidateNumber", "schoolCenterNumber", region, "registrationStatus", "createdAt"
                FROM "${table.schema}"."${table.table}"
                ORDER BY "createdAt" DESC
                LIMIT 5;
              `;
            } else if (table.table === 'schools') {
              sampleQuery = `
                SELECT "centerNumber", name, region, "totalStudents", "oLevelStudents", "aLevelStudents"
                FROM "${table.schema}"."${table.table}"
                ORDER BY "centerNumber"
                LIMIT 10;
              `;
            }
            
            if (sampleQuery) {
              const sampleResult = await client.query(sampleQuery);
              console.log(`\n${colors.yellow}📋 ${table.schema}.${table.table} (showing ${sampleResult.rows.length} of ${table.count}):${colors.reset}`);
              
              sampleResult.rows.forEach((row, index) => {
                console.log(`${colors.dim}${index + 1}.${colors.reset} ${JSON.stringify(row, null, 2)}`);
              });
            }
          } catch (error) {
            console.log(`${colors.red}❌ Error getting sample data from ${table.schema}.${table.table}: ${error.message}${colors.reset}`);
          }
        }
      }
    }

    // Database health check
    console.log(`\n${colors.bold}${colors.cyan}🏥 DATABASE HEALTH${colors.reset}`);
    
    try {
      const healthQuery = `
        SELECT 
          current_database() as database_name,
          current_user as current_user,
          version() as postgres_version,
          pg_size_pretty(pg_database_size(current_database())) as database_size;
      `;
      
      const healthResult = await client.query(healthQuery);
      const health = healthResult.rows[0];
      
      console.log(`${colors.green}✅ Database: ${health.database_name}${colors.reset}`);
      console.log(`${colors.green}✅ User: ${health.current_user}${colors.reset}`);
      console.log(`${colors.green}✅ PostgreSQL Version: ${health.postgres_version.split(' ')[0]} ${health.postgres_version.split(' ')[1]}${colors.reset}`);
      console.log(`${colors.green}✅ Database Size: ${health.database_size}${colors.reset}`);
      
    } catch (error) {
      console.log(`${colors.red}❌ Error getting database health: ${error.message}${colors.reset}`);
    }

    console.log(`\n${colors.bold}${colors.green}🎉 Database check complete!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Database connection error:${colors.reset}`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`\n${colors.yellow}💡 Troubleshooting tips:${colors.reset}`);
      console.log(`   1. Make sure PostgreSQL is running`);
      console.log(`   2. Check if the database 'gce_system' exists`);
      console.log(`   3. Verify the connection details in .env file`);
      console.log(`   4. Check if the user 'gce_app' has proper permissions`);
    }
  } finally {
    await client.end();
  }
}

// Run the database checker
if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase };
