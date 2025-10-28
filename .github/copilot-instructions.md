# MGDC Medical College - Attendance & Fee Management System

## Project Overview
Full-stack application for a medical college managing student attendance and fee payment system with:
- **Backend**: Node.js/Express/MongoDB (REST API)
- **Frontend**: Angular 20+ (Standalone Components, Material Design)
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT-based authentication with role-based access (admin, student, employee)

## Architecture

### Backend Structure (`/backend`)
- **Models** (`/models`): Mongoose schemas (Student, Employee, Attendance, Fee, Payment, Invoice, etc.)
- **Controllers** (`/controllers`): Request handlers with business logic (needs refactoring to services)
- **Routes** (`/routes`): Express route definitions mounted in `server.js`
- **Middleware** (`/middleware`): `auth.js` (JWT verification), `errorHandler.js`
- **Scripts** (`/scripts`): Seeding (`seed_dev.js`, `seed_bulk.js`), testing (`run_api_tests.js`)

**Route mounting pattern in `server.js`:**
```javascript
// Payment providers BEFORE generic payments
app.use('/api/payments/razorpay', razorpayRoutes);
app.use('/api/payments/hdfc', hdfcRoutes);
app.use('/api/payments', paymentRoutes); // Generic must come last
```

### Frontend Structure (`/frontend`)
- **Standalone Components**: Angular 20+ (no NgModules), lazy-loaded routes
- **Material Design**: Angular Material with custom theme (`custom-theme.scss`)
- **Services** (`/services`): API communication, mock data, shared utilities
- **Guards** (`/guards`): `AuthGuard`, `GuestGuard` for route protection
- **Models** (`/models`): TypeScript interfaces matching backend schemas

### Data Flow
1. **Login**: `AuthService` → `/api/auth/login` → Returns JWT + full user profile
2. **Attendance**: Real-time SSE stream at `/api/attendance/stream` for live updates
3. **Fees**: Complex flow: FeeHead → FeePlan → InstallmentSchedule → Invoice → Payment
4. **Payments**: Dual gateway support (Razorpay, HDFC) with checksum validation

## Development Workflows

### Backend
```powershell
# Install & Start
npm install
npm run start          # Production mode
npm run dev            # Dev with nodemon

# Seed database (requires MongoDB running)
npm run seed           # Basic demo data
npm run seed:bulk      # Large dataset
npm run seed:timetable # Timetable data

# Test API
npm run test:api       # Runs automated tests
```

**MongoDB**: Default connection `mongodb://localhost:27017/mgdc_fees` (override with `MONGO_URI` in `.env`)

### Frontend
```powershell
npm install
ng serve              # http://localhost:4200
ng build              # Production build
ng test               # Unit tests (Karma/Jasmine)
```

**Backend URL**: Configured to `http://localhost:5000` in services

## Critical Patterns & Conventions

### Backend: Service Layer Architecture (TO BE IMPLEMENTED)
**Current State**: Business logic in controllers
**Required Refactor**:
```javascript
// backend/services/user.service.js (TO CREATE)
class UserService {
  constructor(UserModel) {
    this.User = UserModel;
  }
  
  async find(filters, pagination, sorting) {
    // All query logic, projections, pagination here
  }
  
  async create(userData) {
    // Validation, hashing, creation logic
  }
}
```
**Pattern**: Create `/services` folder, move ALL business logic from controllers to services. Controllers should only handle req/res.

### Frontend: Micro Frontend Architecture (TO BE IMPLEMENTED)
**Current State**: Monolithic standalone components
**Required**: Implement using **mf1 library** (Module Federation):
- Each domain module (fees, attendance, students) as separate microfrontend
- Shared shell application with navigation
- Independent deployment capability

### Component Structure Requirements
**CRITICAL ISSUES TO FIX**:

1. **Inline Templates**: Components with `template:` instead of `templateUrl:`
   - `fee-structure.component.ts`, `employee-list.component.ts`, `reports-hub.component.ts`, `attendance-reports.component.ts`, `fees-reports.component.ts`, `student-fees.component.ts`, `payment-history.component.ts`, `fee-reports.component.ts`, `unauthorized.component.ts`, `not-found.component.ts`
   - **Action**: Extract to separate `.html` and `.css` files

2. **Missing `.spec.ts` Files**: Only 2 spec files exist (app.spec.ts, fees.guard.spec.ts)
   - **Action**: Generate `.spec.ts` for ALL 21 components

3. **Multiple Services**: Separate service per domain
   - **Action**: Consolidate into single `shared.service.ts` (partially done, needs completion)

### Design System
**Theme**: Single blue palette (`mat.$azure-palette` primary, `mat.$blue-palette` tertiary)
- Defined in `custom-theme.scss`
- **Rule**: NO multi-color schemes, maintain consistent blue theme throughout

### SPA Navigation
- Uses Angular Router with lazy loading (`loadComponent`, `loadChildren`)
- **Rule**: All navigation via router, NO full-page reloads
- Guards prevent unauthorized access

### Authentication Flow
```typescript
// Login returns full user profile embedded in response
{
  token: "jwt_token",
  user: {
    id, name, email, role,
    // Student-specific fields
    studentId, class, section, rollNumber,
    guardian: {...}, address: {...}
  }
}
```
**Storage**: JWT in localStorage, attached via interceptor

## Payment Gateway Integration
- **Razorpay**: Standard integration with webhook verification
- **HDFC**: Custom checksum validation (`scripts/compute_hdfc_checksum.js`)
- **Critical**: Payment routes MUST be mounted before generic `/api/payments`

## Testing & Documentation
- **API Docs**: `backend/docs/API_Documentation.md` (comprehensive, beginner-friendly)
- **Postman**: Collections in `/docs` folder
- **REST Client**: `requests.http` for VS Code extension
- **Test Reports**: Auto-generated in `/docs`

## Known Technical Debt
1. ❌ No service layer in backend (all logic in controllers)
2. ❌ Micro frontend architecture not implemented
3. ❌ Missing 90%+ of component unit tests
4. ❌ Inline templates in 10+ components
5. ❌ Multiple service files instead of unified approach
6. ⚠️ No end-to-end tests
7. ⚠️ Environment configuration hardcoded (no proper .env handling in frontend)

## Immediate Action Items
### Backend Priority
1. Create `/backend/services` directory
2. Implement `UserService` with find, findOne, create, update, remove
3. Refactor `authController.js` to use UserService
4. Repeat pattern for all controllers

### Frontend Priority
1. Extract inline templates to separate HTML/CSS files
2. Generate `.spec.ts` files for all components
3. Install and configure **mf1 library** for micro frontends
4. Consolidate services into unified `shared.service.ts`
5. Audit color usage, enforce single blue theme

## Domain Models
- **User**: Base model with role (admin/student/employee)
- **Student**: Extended user with academic info, guardian details
- **Employee**: Faculty/staff with department, designation
- **Attendance**: Daily records with timestamp, status, location
- **Fee**: Hierarchical (FeeHead → FeePlan → InstallmentSchedule → Invoice → Payment)
- **Timetable**: Class schedules for attendance tracking

## Key Files Reference
- `backend/server.js` - Main entry, route mounting
- `frontend/src/app/app.routes.ts` - Route configuration
- `frontend/src/custom-theme.scss` - Material theme
- `frontend/src/app/services/shared.service.ts` - Shared utilities
- `backend/middleware/auth.js` - JWT verification
- `backend/API_Documentation.md` - Complete API reference
