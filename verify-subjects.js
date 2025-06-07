const { Client } = require('pg');
require('dotenv').config();

async function verify() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const result = await client.query('SELECT COUNT(*) FROM "o_level_students"."users" WHERE "oLevelSubjects" IS NOT NULL');
    console.log('O Level students with subjects:', result.rows[0].count);
    
    const result2 = await client.query('SELECT COUNT(*) FROM "a_level_students"."users" WHERE "aLevelSubjects" IS NOT NULL');
    console.log('A Level students with subjects:', result2.rows[0].count);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

verify();
