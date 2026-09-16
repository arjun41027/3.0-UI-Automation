#!/usr/bin/env node

/**
 * reset-db.js - Clear the login session from the database
 * This ensures tests can run without "already logged in" errors
 */

const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || '192.168.0.110',
  database: process.env.DB_NAME || 'PuffinDB',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'P@ssw0rd123'
    }
  },
  options: {
    trustServerCertificate: true,
    connectionTimeout: 15000,
    requestTimeout: 15000
  }
};

async function resetDatabase() {
  try {
    console.log('Connecting to database...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✓ Connected to database');

    console.log('Clearing login session for SurveyChecker1001...');
    const query = `UPDATE loginusermaster SET isloggedin=0 WHERE UserName='SurveyChecker1001'`;
    const result = await pool.request().query(query);
    console.log(`✓ Database cleared: ${result.rowsAffected[0]} row(s) updated`);

    await pool.close();
  } catch (err) {
    console.error('✗ Database error:', err.message);
    process.exit(1);
  }
}

resetDatabase();
