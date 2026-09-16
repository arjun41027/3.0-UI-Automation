#!/usr/bin/env node
/**
 * Pre-test setup: Reset database and clear browser artifacts
 * This ensures tests start with a clean slate
 * 
 * Reads database credentials from cypress.env.json
 * 
 * Usage: node scripts/pre-test-setup.js
 * Or: npm run setup:test
 */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from cypress.env.json
let envConfig = {};
try {
  const envPath = path.join(__dirname, '..', 'cypress.env.json');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envConfig = JSON.parse(envContent);
    console.log('📋 [CONFIG] Loaded credentials from cypress.env.json\n');
  }
} catch (err) {
  console.warn('⚠️  [CONFIG] Could not read cypress.env.json:', err.message);
}

// Database configuration
const dbServer = process.env.DB_SERVER || envConfig.DB_SERVER || '172.16.4.52';
const dbName = process.env.DB_NAME || envConfig.DB_NAME || 'puffinmt_CXP2';
const dbUser = process.env.DB_USER || envConfig.DB_USER || 'sa';
const dbPassword = process.env.DB_PASSWORD || envConfig.DB_PASSWORD || 'Mobility@bdd123';
const testUsername = envConfig.USERNAME || 'SurveyChecker1001';

const config = {
  server: dbServer,
  database: dbName,
  authentication: {
    type: 'default',
    options: {
      userName: dbUser,
      password: dbPassword
    }
  },
  options: {
    trustServerCertificate: true,
    connectionTimeout: 15000,
    requestTimeout: 15000
  }
};

async function resetDatabaseSession(username = testUsername) {
  try {
    console.log(`📦 [DB] Connecting to ${dbServer}\\${dbName}...`);
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ [DB] Connected!\n');

    console.log(`🧹 [DB] Clearing login session for ${username}...`);
    const result = await pool.request().query(
      `UPDATE loginusermaster SET isloggedin=0 WHERE UserName='${username}'`
    );
    console.log(`✅ [DB] Database cleared: ${result.rowsAffected[0]} row(s) updated\n`);

    await pool.close();
    return true;
  } catch (err) {
    console.error(`❌ [DB] Database error: ${err.message}`);
    console.log('⚠️  [DB] Continuing anyway - tests may encounter 401 errors\n');
    return false;
  }
}

function clearCypressArtifacts() {
  console.log('🗑️  [CLEANUP] Clearing Cypress artifacts...');
  
  const artifactDirs = [
    'cypress/screenshots',
    'cypress/videos',
    'cypress/reports/.jsons',
    'allure-results'
  ];

  artifactDirs.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`   ✅ Cleared ${dir}`);
      }
    } catch (err) {
      console.warn(`   ⚠️  Could not clear ${dir}: ${err.message}`);
    }
  });

  console.log();
}

function killStaleProcesses() {
  console.log('💀 [CLEANUP] Killing stale browser/Node processes...');
  
  try {
    // PowerShell command to kill old Chrome/Edge/Electron processes
    const killCommand = `
      Get-Process | Where-Object { 
        $_.ProcessName -match 'chrome|msedge|Electron|node|Cypress' -and 
        $_.StartTime -lt (Get-Date).AddMinutes(-5) 
      } | Stop-Process -Force -ErrorAction SilentlyContinue
    `;

    execSync(`powershell -Command "${killCommand}"`, { 
      stdio: 'pipe',
      timeout: 10000
    });
    
    console.log('✅ [CLEANUP] Stale processes killed\n');
  } catch (err) {
    // It's OK if this fails - not critical
    console.log(`⚠️  [CLEANUP] Could not kill processes (non-critical)\n`);
  }
}

async function setup() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  🔧 PRE-TEST SETUP: Database Reset & Artifact Cleanup');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log(`📋 Configuration:`);
  console.log(`   Server: ${dbServer}`);
  console.log(`   Database: ${dbName}`);
  console.log(`   Username: ${dbUser}`);
  console.log(`   Test User: ${testUsername}\n`);

  // Step 1: Kill stale processes
  killStaleProcesses();

  // Step 2: Reset database
  const dbSuccess = await resetDatabaseSession(testUsername);

  // Step 3: Clear artifacts
  clearCypressArtifacts();

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  ✅ PRE-TEST SETUP COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  if (!dbSuccess) {
    console.log('⚠️  WARNING: Database reset failed. You may encounter 401 errors.');
    console.log('   Ensure DB credentials in cypress.env.json are correct.\n');
  }

  process.exit(dbSuccess ? 0 : 1);
}

setup().catch(err => {
  console.error('\n❌ SETUP FAILED:', err.message);
  process.exit(1);
});
