# 🧪 Comprehensive Testing Plan

## Testing Overview

| Phase | Type | Coverage |
|-------|------|----------|
| 1 | Authentication | Login, Register, Password Reset |
| 2 | RBAC | All 4 roles access verification |
| 3 | CRUD Operations | All entities |
| 4 | UI/UX | Navigation, Forms, Validation |
| 5 | Integration | API + Frontend flow |

---

## Phase 1: Authentication Testing

### 1.1 Login Tests
| # | Test Case | Steps | Expected | Role |
|---|-----------|-------|----------|------|
| 1 | Valid login | Enter valid email/password → Submit | Redirect to dashboard | All |
| 2 | Invalid password | Enter wrong password → Submit | Error: "Invalid credentials" | All |
| 3 | Non-existent email | Enter unregistered email | Error: "User not found" | All |
| 4 | Empty fields | Submit empty form | Validation errors shown | All |
| 5 | Token persistence | Login → Refresh page | Stay logged in | All |

### 1.2 Registration Tests
| # | Test Case | Steps | Expected | Role |
|---|-----------|-------|----------|------|
| 1 | Valid admin | Fill admin details → Submit | Success, redirected | Admin |
| 2 | Valid student | Fill student details (roll#, batch, degree) | Success with student profile | Student |
| 3 | Duplicate email | Register existing email | Error: "Email already exists" | All |
| 4 | Weak password | Password < 6 chars | Validation error | All |
| 5 | Missing student fields | Student without roll# | Error: "Roll number required" | Student |

### 1.3 Password Reset Tests
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | Request reset | Enter email → Submit | "Reset link sent" message |
| 2 | Invalid email | Enter unregistered email | Error message |
| 3 | Reset password | Click link → Enter new password | Password updated, can login |

---

## Phase 2: RBAC Testing

### 2.1 Admin Access Tests
| # | Route | Action | Expected |
|---|-------|--------|----------|
| 1 | `/users` | View | ✅ See all users |
| 2 | `/users/create` | Create user | ✅ User created |
| 3 | `/analytics` | View | ✅ Full dashboard |
| 4 | `/companies/create` | Create | ✅ Company created |
| 5 | `/jobs/create` | Create | ✅ Job created |

### 2.2 Student Access Tests
| # | Route | Action | Expected |
|---|-------|--------|----------|
| 1 | `/users` | Navigate | ❌ Redirect to dashboard |
| 2 | `/students` | Navigate | ❌ Redirect to dashboard |
| 3 | `/companies` | Navigate | ❌ Redirect to dashboard |
| 4 | `/jobs` | View | ✅ See eligible jobs |
| 5 | `/my-applications` | View | ✅ See own applications |
| 6 | `/profile` | Edit | ✅ Update own profile |

### 2.3 Officer/Coordinator Tests
| # | Route | Role | Expected |
|---|-------|------|----------|
| 1 | `/users` | Officer | ❌ No access |
| 2 | `/students` | Officer | ✅ Department only |
| 3 | `/analytics` | Coordinator | ❌ No access |

---

## Phase 3: CRUD Operations Testing

### 3.1 Company Management
| # | Operation | Test | Verification |
|---|-----------|------|--------------|
| 1 | Create | Add new company with all fields | Appears in list |
| 2 | Read | View company details | All data displayed |
| 3 | Update | Edit company info | Changes saved |
| 4 | Delete | Remove company | Removed from list |
| 5 | Contacts | Add/remove contacts | Contacts managed |

### 3.2 Job Management
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | Create job | Fill 4-step form | Job created |
| 2 | Set eligibility | CGPA, backlogs, departments | Saved correctly |
| 3 | Approve job | Admin approves | Status → Active |
| 4 | Close job | Mark as closed | No new applications |
| 5 | View applicants | Open job → See list | All applicants shown |

### 3.3 Application Flow
| # | Test Case | Actor | Expected |
|---|-----------|-------|----------|
| 1 | Apply to job | Student | Application submitted |
| 2 | Duplicate apply | Student | Error: "Already applied" |
| 3 | Shortlist | Admin | Status updated |
| 4 | Reject | Admin | Status → Rejected |
| 5 | Withdraw | Student | Application withdrawn |

### 3.4 Interview Management
| # | Test Case | Actor | Expected |
|---|-----------|-------|----------|
| 1 | Schedule | Admin | Interview created |
| 2 | View calendar | All | See scheduled interviews |
| 3 | Reschedule | Admin | Date/time updated |
| 4 | Add feedback | Admin | Feedback saved |
| 5 | Cancel | Admin | Status → Cancelled |

---

## Phase 4: UI/UX Testing

### 4.1 Navigation Tests
| # | Test | Expected |
|---|------|----------|
| 1 | Sidebar links | Navigate to correct pages |
| 2 | Breadcrumbs | Show current location |
| 3 | Back navigation | Browser back works |
| 4 | Global search (Cmd+K) | Opens search modal |

### 4.2 Form Validation Tests
| # | Form | Test | Expected |
|---|------|------|----------|
| 1 | Login | Empty email | "Email required" |
| 2 | Register | Invalid email format | "Invalid email" |
| 3 | Create Job | Missing title | "Title required" |
| 4 | Profile | Phone format | Validation error |

### 4.3 Responsive Design
| # | Viewport | Test |
|---|----------|------|
| 1 | Desktop (1920px) | Full sidebar visible |
| 2 | Tablet (768px) | Collapsible sidebar |
| 3 | Mobile (375px) | Hamburger menu |

---

## Phase 5: API Integration Tests

### 5.1 API Response Verification
```bash
# Test each endpoint returns correct structure
GET /api/v1/users     → { success: true, data: [...], pagination: {...} }
GET /api/v1/jobs      → { success: true, data: [...], pagination: {...} }
POST /api/v1/auth/login → { success: true, data: { token, user } }
```

### 5.2 Error Handling Tests
| # | Scenario | Expected Response |
|---|----------|-------------------|
| 1 | Invalid token | 401 Unauthorized |
| 2 | Missing auth | 401 Unauthorized |
| 3 | Forbidden route | 403 Forbidden |
| 4 | Not found | 404 Not Found |
| 5 | Server error | 500 + error message |

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Database seeded with test data
- [ ] Test accounts created for all roles

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | `testadmin@test.com` | `Test@123` |
| Officer | `officer@test.com` | `Test@123` |
| Coordinator | `coord@test.com` | `Test@123` |
| Student | `teststudent@test.com` | `Test@123` |

### Execution Order
1. ✅ Phase 1: Authentication
2. ✅ Phase 2: RBAC
3. ⬜ Phase 3: CRUD Operations
4. ⬜ Phase 4: UI/UX
5. ⬜ Phase 5: Integration

---

## Bug Report Template

```markdown
**Bug ID:** BUG-XXX
**Severity:** Critical/High/Medium/Low
**Page/Feature:** 
**Steps to Reproduce:**
1. 
2. 
3. 
**Expected Result:** 
**Actual Result:** 
**Screenshot:** 
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Auth tests passing | 100% |
| RBAC tests passing | 100% |
| CRUD operations | 100% |
| UI responsiveness | All viewports |
| API response time | < 500ms |
