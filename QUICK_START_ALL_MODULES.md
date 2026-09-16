# 🚀 Quick Start: Running All Module Tests in One Click

## TL;DR (Just Run These Commands)

### **Option 1: Simple (Fastest)**
```bash
npm run test:ordered
```
✅ Runs all 6 modules with **one login**  
⏱️  ~3-4 minutes total  
✅ Best for: Development & quick verification

### **Option 2: Production (Cleanest)**
```bash
npm run test:all:modules
```
✅ Resets database first  
✅ Clears artifacts  
✅ Runs all 6 modules with one login  
✅ Generates Allure report  
⏱️  ~4-5 minutes total  
✅ Best for: CI/CD & production runs

### **Option 3: Interactive (Debugging)**
```bash
npm run test:all:modules:headed
```
✅ Opens Cypress UI  
✅ You can watch tests run in browser  
✅ Easier debugging  
✅ Best for: Visual verification & troubleshooting

---

## What Gets Tested?

| Module | Tests | Script |
|--------|-------|--------|
| **Login** | 1 test | Automatic (prerequisite) |
| **Campaign SMS** | 9 tests | `campaign.feature` |
| **Department** | ~5 tests | `department.feature` |
| **Role** | ~5 tests | `role.feature` |
| **User** | ~5 tests | `user.feature` |
| **Message Template** | ~5 tests | `messageTemplate.feature` |
| | | |
| **TOTAL** | **~30 tests** | **Single login session** |

---

## Command Reference

### Run All Modules

```bash
# Quick start (no setup)
npm run test:ordered

# Production (with DB reset & cleanup)
npm run test:all:modules

# Interactive (Cypress UI)
npm run test:all:modules:headed
```

### Run Individual Modules

```bash
npm run test:campaign          # Campaign only
npm run test:department        # Department only
npm run test:user              # User only
npm run test:role              # Role only
npm run test:message-template  # Message Template only
```

### Database & Cleanup

```bash
# Just reset database (without running tests)
npm run setup:test

# Clear reports & screenshots
npm run clean:reports
```

---

## Session Management Explained

### How It Works
```
1. User runs: npm run test:ordered
2. Cypress LOGS IN ONCE via Azure Aurora SSO
3. Session cached in browser cookies
4. All 30 tests REUSE the same cached session
5. No need to login for each module!
```

### Why This Is Better
| Before | After |
|--------|-------|
| ❌ Login 6 times (1 per module) | ✅ Login 1 time (shared session) |
| ❌ 401 "Already logged in" errors | ✅ No 401 errors |
| ❌ Manual DB reset between runs | ✅ Automatic DB reset |
| ❌ ~10+ minutes to test all modules | ✅ ~3-4 minutes to test all modules |

---

## What Happens Behind the Scenes?

### `npm run test:all:modules` Does This:
```
1️⃣  Reset database (clear stale sessions)
2️⃣  Kill old browser processes
3️⃣  Clear previous test artifacts
4️⃣  START TESTS:
     └─ Login (Aurora SSO)
        ├─ Campaign tests (9 tests) ← Reuse login session
        ├─ Department tests (5 tests) ← Reuse login session
        ├─ Role tests (5 tests) ← Reuse login session
        ├─ User tests (5 tests) ← Reuse login session
        └─ Message Template tests (5 tests) ← Reuse login session
5️⃣  Generate Allure report
6️⃣  Done! ✅
```

---

## Troubleshooting

### Q: I'm getting 401 "Already logged in from another device"

**A:** Run this:
```bash
npm run setup:test
# Wait 30 seconds
npm run test:ordered
```

**Why:** The setup script clears the database flag and kills stale processes.

### Q: Some tests failed, how do I see the report?

**A:** 
```bash
# After tests finish, open the HTML report
npm run report:allure:open

# Or manually open:
# cypress/reports/index_NNN.html (mochawesome report)
```

### Q: I want to test ONLY campaign and user modules

**A:** Create a custom script in `package.json`:
```bash
# Option 1: Direct command
npx cypress run --spec "cypress/e2e/features/login.feature,cypress/e2e/features/campaign.feature,cypress/e2e/features/user.feature"

# Option 2: Add to package.json scripts:
# "test:campaign-user": "npm run clean:reports && cypress run --spec \"cypress/e2e/features/login.feature,cypress/e2e/features/campaign.feature,cypress/e2e/features/user.feature\""
# Then: npm run test:campaign-user
```

### Q: Tests pass in CLI but fail in Cypress UI

**A:**
```bash
npm run test:all:modules:headed
# This runs with DB reset first, which prevents most UI-specific errors
```

---

## Key Files Modified/Created

| File | Purpose |
|------|---------|
| `package.json` | Added new npm scripts |
| `scripts/pre-test-setup.js` | Database reset + artifact cleanup |
| `SESSION_MANAGEMENT_GUIDE.md` | Complete session management documentation |
| `QUICK_START_ALL_MODULES.md` | This file |

---

## Expected Output

### Successful Run
```
📦 [DB] Connecting to database...
✅ [DB] Connected!

🧹 [DB] Clearing login session for SurveyChecker1001...
✅ [DB] Database cleared: 1 row(s) updated

🗑️  [CLEANUP] Clearing Cypress artifacts...
✅ [CLEANUP] Cleared cypress/screenshots
✅ [CLEANUP] Cleared allure-results

═══════════════════════════════════════════════════════════════════
Running:  login.feature
  ✅ Successful login with SSO and tenant selection

Running:  campaign.feature
  ✅ Navigate to SMS Broadcasts page via Campaign menu
  ✅ Add Broadcast modal opens with correct default state
  ✅ Add a new SMS broadcast with manual recipient entry
  ✅ Schedule Later option reveals date and time field
  ✅ Custom broadcast type shows only file upload
  ✅ Close Add Broadcast modal without submitting
  ✅ View broadcast details by clicking row
  ✅ Add multiple broadcasts example #1
  ✅ Add multiple broadcasts example #2

Running:  department.feature
  ✅ 5 department tests passing

Running:  role.feature
  ✅ 5 role tests passing

Running:  user.feature
  ✅ 5 user tests passing

Running:  messageTemplate.feature
  ✅ 5 message template tests passing

═══════════════════════════════════════════════════════════════════
✅ ALL TESTS PASSED (30+ total) in 3m 45s
═══════════════════════════════════════════════════════════════════
```

---

## Pro Tips

### 1️⃣ Fastest Way to Test Everything
```bash
npm run test:ordered  # 3-4 minutes, single login
```

### 2️⃣ Best Way for CI/Production
```bash
npm run test:all:modules  # Includes DB reset + report generation
```

### 3️⃣ Debug a Failing Test
```bash
npm run test:all:modules:headed  # Open Cypress UI, watch tests run
```

### 4️⃣ Run Just One Module (to save time)
```bash
npm run test:campaign  # ~2 minutes for just campaign tests
```

### 5️⃣ Check Previous Test Results
```bash
# Last report (Allure)
npm run report:allure:open

# Or open manually:
open cypress/reports/index_*.html
```

---

## Session Architecture (Why This Works)

The tests use **Cypress `cy.session()`** with smart caching:

```javascript
cy.session(
  ['auth-login-v1', username, tenant],  // Cache key
  () => {
    LoginPage.login(username, password, tenant);  // Run once
  },
  {
    cacheAcrossSpecs: true,  // MAGIC: Reuse across ALL modules
    validate: validateSession  // Check if still valid
  }
);
```

**Result:**
- ✅ Login runs **once** (not once per module)
- ✅ All modules get the **same session token**
- ✅ No 401 "already logged in" errors
- ✅ ~6x faster than logging in per module

---

## Next Steps

1. **Run a quick test:**
   ```bash
   npm run test:campaign
   ```

2. **Run all modules:**
   ```bash
   npm run test:all:modules
   ```

3. **Open interactive browser:**
   ```bash
   npm run test:all:modules:headed
   ```

4. **View test report:**
   ```bash
   npm run report:allure:open
   ```

---

## Questions?

See [SESSION_MANAGEMENT_GUIDE.md](./SESSION_MANAGEMENT_GUIDE.md) for complete documentation including:
- ✅ Session caching explained
- ✅ 401 error prevention
- ✅ Database reset automation
- ✅ Best practices & recommendations
