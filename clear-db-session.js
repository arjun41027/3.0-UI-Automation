#!/usr/bin/env node
/**
 * Clear login session from database
 * Clears the isloggedin flag for test user
 */

const sql = require('mssql');

const config = {
  server: '192.168.0.110',
  database: 'PuffinDB',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'P@ssw0rd123'
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: true,
    connectionTimeout: 15000,
    requestTimeout: 15000
  }
};

async function clearLoginSession() {
  const pool = new sql.ConnectionPool(config);
  
  try {
    console.log('🔌 Connecting to database...');
    await pool.connect();
    console.log('✅ Connected!');
    
    console.log('🧹 Clearing login session for SurveyChecker1001...');
    const request = pool.request();
    const result = await request.query(
      `UPDATE loginusermaster SET isloggedin=0 WHERE UserName='SurveyChecker1001'`
    );
    
    console.log(`✅ Database cleared! Rows affected: ${result.rowsAffected[0]}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  } finally {
    await pool.close();
  }
}

clearLoginSession();
