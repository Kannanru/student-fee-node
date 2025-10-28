# MGDC Project - Detailed Fix Action Plan

## Overview
This document provides step-by-step instructions for fixing all critical issues identified in the MGDC project before implementing new features.

---

## Part 1: Backend Service Layer Implementation

### Step 1.1: Create Services Directory Structure
```powershell
# From backend directory
mkdir services
```

### Step 1.2: Create Base Service Class
**File**: `backend/services/base.service.js`

```javascript
/**
 * Base Service Class
 * All services should extend this class for common functionality
 */
class BaseService {
  constructor(Model) {
    this.Model = Model;
  }

  /**
   * Find documents with filters, pagination, and sorting
   * @param {Object} filters - MongoDB query filters
   * @param {Object} options - { page, limit, sort, select, populate }
   * @returns {Promise<Object>} - { data, total, page, pages }
   */
  async find(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = '',
      populate = []
    } = options;

    const skip = (page - 1) * limit;
    
    let query = this.Model.find(filters);
    
    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach(pop => {
        query = query.populate(pop);
      });
    }
    
    query = query.sort(sort).skip(skip).limit(limit);
    
    const data = await query.exec();
    const total = await this.Model.countDocuments(filters);
    
    return {
      data,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Find single document by ID
   * @param {String} id - Document ID
   * @param {Object} options - { select, populate }
   * @returns {Promise<Object>} - Document
   */
  async findOne(id, options = {}) {
    const { select = '', populate = [] } = options;
    
    let query = this.Model.findById(id);
    
    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach(pop => {
        query = query.populate(pop);
      });
    }
    
    return await query.exec();
  }

  /**
   * Create new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>} - Created document
   */
  async create(data) {
    const doc = new this.Model(data);
    return await doc.save();
  }

  /**
   * Update document by ID
   * @param {String} id - Document ID
   * @param {Object} updates - Update data
   * @param {Object} options - Mongoose options
   * @returns {Promise<Object>} - Updated document
   */
  async update(id, updates, options = { new: true, runValidators: true }) {
    return await this.Model.findByIdAndUpdate(id, updates, options);
  }

  /**
   * Delete document by ID
   * @param {String} id - Document ID
   * @returns {Promise<Object>} - Deleted document
   */
  async remove(id) {
    return await this.Model.findByIdAndDelete(id);
  }

  /**
   * Count documents matching filters
   * @param {Object} filters - MongoDB query filters
   * @returns {Promise<Number>} - Count
   */
  async count(filters = {}) {
    return await this.Model.countDocuments(filters);
  }
}

module.exports = BaseService;
```

### Step 1.3: Create User Service
**File**: `backend/services/user.service.js`

```javascript
const BaseService = require('./base.service');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   * @param {String} email
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    return await this.Model.findOne({ email });
  }

  /**
   * Create new user with password hashing
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    const { password, ...rest } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    return await this.create({
      ...rest,
      password: hashedPassword
    });
  }

  /**
   * Verify user password
   * @param {Object} user - User document
   * @param {String} password - Plain text password
   * @returns {Promise<Boolean>}
   */
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  /**
   * Get user profile (exclude sensitive data)
   * @param {String} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    return await this.findOne(userId, {
      select: '-password'
    });
  }

  /**
   * Update user profile
   * @param {String} userId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updates) {
    // Remove password from updates if present
    const { password, ...safeUpdates } = updates;
    
    return await this.update(userId, safeUpdates, {
      new: true,
      runValidators: true,
      select: '-password'
    });
  }

  /**
   * Change user password
   * @param {String} userId
   * @param {String} oldPassword
   * @param {String} newPassword
   * @returns {Promise<Boolean>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.Model.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Verify old password
    const isValid = await this.verifyPassword(user, oldPassword);
    if (!isValid) throw new Error('Invalid password');
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    return true;
  }
}

module.exports = new UserService();
```

### Step 1.4: Refactor Auth Controller
**File**: `backend/controllers/authController.js`

```javascript
const jwt = require('jsonwebtoken');
const UserService = require('../services/user.service');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existing = await UserService.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create user
    await UserService.createUser({ name, email, password, role });
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await UserService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await UserService.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Get user profile (without password)
    const profile = await UserService.getProfile(user._id);
    
    res.json({
      success: true,
      token,
      user: profile
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await UserService.getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await UserService.updateProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};
```

### Step 1.5: Create Services for Other Entities

**Create these service files following the same pattern**:

1. `backend/services/student.service.js` - Extend BaseService(Student)
2. `backend/services/employee.service.js` - Extend BaseService(Employee)
3. `backend/services/attendance.service.js` - Extend BaseService(Attendance)
4. `backend/services/fee.service.js` - Extend BaseService(Fee)
5. `backend/services/payment.service.js` - Extend BaseService(Payment)
6. And so on for all models...

### Step 1.6: Testing
```powershell
# Test the refactored endpoints
npm run test:api
```

---

## Part 2: Frontend - Extract Inline Templates

### Step 2.1: Fee Structure Component

**Create**: `frontend/src/app/components/fees/fee-structure/fee-structure.component.html`
```html
<div class="fee-structure-container">
  <h2>Fee Structure Management</h2>
  <p>This component will manage BDS Medical College fee structures by semester and year.</p>
</div>
```

**Create**: `frontend/src/app/components/fees/fee-structure/fee-structure.component.css`
```css
.fee-structure-container {
  padding: 24px;
  text-align: center;
}
```

**Update**: `frontend/src/app/components/fees/fee-structure/fee-structure.component.ts`
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fee-structure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fee-structure.component.html',
  styleUrls: ['./fee-structure.component.css']
})
export class FeeStructureComponent {

}
```

**Repeat this process for all 10 components with inline templates.**

---

## Part 3: Frontend - Generate Spec Files

### Step 3.1: Generate Spec Files
```powershell
# From frontend directory
ng generate component components/fees/fee-structure --skip-import --dry-run
```

**Or manually create spec file**:

**File**: `frontend/src/app/components/fees/fee-structure/fee-structure.component.spec.ts`
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeStructureComponent } from './fee-structure.component';

describe('FeeStructureComponent', () => {
  let component: FeeStructureComponent;
  let fixture: ComponentFixture<FeeStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeStructureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeeStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Fee Structure Management');
  });
});
```

**Repeat for all 21 components.**

### Step 3.2: Run Tests
```powershell
ng test
```

---

## Part 4: Frontend - Consolidate Services

### Step 4.1: Analysis
**Current services that need consolidation**:
- api.service.ts (keep - base HTTP)
- auth.service.ts (keep - authentication specific)
- shared.service.ts (keep - will be enhanced)
- attendance.service.ts → Move to shared
- fee.service.ts → Move to shared
- student.service.ts → Move to shared
- notification.service.ts → Move to shared
- mock-employee.service.ts → Keep for testing
- mock-student.service.ts → Keep for testing

### Step 4.2: Enhanced Shared Service
**Update**: `frontend/src/app/services/shared.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  
  constructor(private http: HttpClient) { }

  // ========== Student Methods ==========
  getStudents(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.set(key, filters[key]);
      });
    }
    return this.http.get(`${API_URL}/students`, { params });
  }

  getStudent(id: string): Observable<any> {
    return this.http.get(`${API_URL}/students/${id}`);
  }

  createStudent(data: any): Observable<any> {
    return this.http.post(`${API_URL}/students`, data);
  }

  updateStudent(id: string, data: any): Observable<any> {
    return this.http.put(`${API_URL}/students/${id}`, data);
  }

  // ========== Employee Methods ==========
  getEmployees(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.set(key, filters[key]);
      });
    }
    return this.http.get(`${API_URL}/employees`, { params });
  }

  // ========== Attendance Methods ==========
  getAttendanceStream(): Observable<any> {
    // SSE implementation
    return new Observable(observer => {
      const eventSource = new EventSource(`${API_URL}/attendance/stream`);
      eventSource.onmessage = event => {
        observer.next(JSON.parse(event.data));
      };
      eventSource.onerror = error => {
        observer.error(error);
      };
      return () => eventSource.close();
    });
  }

  recordAttendance(data: any): Observable<any> {
    return this.http.post(`${API_URL}/attendance`, data);
  }

  // ========== Fee Methods ==========
  getStudentFees(studentId: string): Observable<any> {
    return this.http.get(`${API_URL}/fees/student/${studentId}`);
  }

  processPayment(data: any): Observable<any> {
    return this.http.post(`${API_URL}/payments`, data);
  }

  getPaymentHistory(studentId: string): Observable<any> {
    return this.http.get(`${API_URL}/fees/student/${studentId}/payments`);
  }

  // ========== Notification Methods ==========
  sendNotification(data: any): Observable<any> {
    return this.http.post(`${API_URL}/notifications`, data);
  }

  // ========== Utility Methods ==========
  generateAvatarInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
```

### Step 4.3: Update Component Imports
**Update all components to use SharedService instead of individual services**

Example:
```typescript
// Before
import { StudentService } from '../../services/student.service';

// After
import { SharedService } from '../../services/shared.service';
```

---

## Part 5: Frontend - Micro Frontend Setup

### Step 5.1: Install Module Federation
```powershell
npm install @angular-architects/module-federation --save-dev
ng add @angular-architects/module-federation
```

### Step 5.2: Create Shell Application Structure
```
frontend/
  apps/
    shell/          # Main container app
    fees/           # Fees microfrontend
    students/       # Students microfrontend
    attendance/     # Attendance microfrontend
    employees/      # Employees microfrontend
    reports/        # Reports microfrontend
  libs/
    shared/         # Shared libraries
```

### Step 5.3: Configure Module Federation
**This is complex and requires detailed setup - will need separate guide**

---

## Part 6: Theme Consistency

### Step 6.1: Audit Custom Colors
```powershell
# Search for color definitions
grep -r "color:" frontend/src/app/components --include="*.css"
grep -r "background:" frontend/src/app/components --include="*.css"
```

### Step 6.2: Update Theme Variables
**Update**: `frontend/src/custom-theme.scss`

```scss
@use '@angular/material' as mat;

// Define single blue palette
$primary-blue: mat.$azure-palette;
$accent-blue: mat.$blue-palette;

html {
  @include mat.theme((
    color: (
      primary: $primary-blue,
      tertiary: $accent-blue,
    ),
    typography: Roboto,
    density: 0,
  ));
}

// Custom CSS variables for consistent usage
:root {
  --primary-blue: #007bff;
  --primary-blue-light: #66b0ff;
  --primary-blue-dark: #0056b3;
  --accent-blue: #17a2b8;
  --background: #f5f5f5;
  --text-primary: #212529;
  --text-secondary: #6c757d;
}
```

### Step 6.3: Replace Custom Colors
**Update component CSS to use theme variables**:
```css
/* Before */
.stat-card {
  background: #ff5722; /* Remove */
}

/* After */
.stat-card {
  background: var(--primary-blue);
}
```

---

## Execution Timeline

### Week 1: Backend Services
- **Day 1-2**: Create base service and user service
- **Day 3**: Refactor auth controller
- **Day 4**: Create student and employee services
- **Day 5**: Test all refactored endpoints

### Week 2: Frontend Template Extraction
- **Day 1-2**: Extract 5 component templates
- **Day 3-4**: Extract remaining 5 component templates
- **Day 5**: Test all components

### Week 3: Frontend Testing & Consolidation
- **Day 1-3**: Generate all spec files
- **Day 4**: Consolidate services
- **Day 5**: Theme consistency fixes

### Week 4-6: Micro Frontend Implementation
- **Detailed plan required based on mf1 library documentation**

---

## Testing Checklist

### Backend
- [ ] All services created and tested
- [ ] All controllers refactored
- [ ] API tests passing
- [ ] No business logic in controllers
- [ ] Documentation updated

### Frontend
- [ ] No inline templates remaining
- [ ] All spec files created
- [ ] All tests passing
- [ ] Services consolidated
- [ ] Single blue theme enforced
- [ ] No full page reloads (SPA verified)

---

## Commands Reference

```powershell
# Backend
cd backend
npm install
npm run dev
npm run test:api

# Frontend
cd frontend
npm install
ng serve
ng test
ng build

# Generate component spec
ng generate component path/to/component --skip-import

# Run linter
ng lint
```

---

## Notes
- Make incremental changes
- Test after each major change
- Commit frequently with descriptive messages
- Keep documentation updated
- Request code review before proceeding to next phase
