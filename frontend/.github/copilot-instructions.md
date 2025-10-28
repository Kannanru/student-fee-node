<!-- MGDC Angular Admin Frontend Project Instructions -->
# MGDC Admin Frontend - Angular Application

This project is an Angular-based admin frontend for the MGDC Fee Management System built with:
- Angular Standalone Components (no NgModules)
- Angular Material for UI components  
- Micro frontend architecture
- TypeScript for type safety
- Responsive design with CSS
- Service-based architecture for API integration

## Architecture
- **Components**: Standalone components in src/app/components/
- **Services**: API services in src/app/services/
- **Models**: TypeScript interfaces in src/app/models/
- **Guards**: Route guards for authentication
- **Interceptors**: HTTP interceptors for token management

## Backend Integration
- Node.js backend running on http://localhost:5000
- JWT-based authentication
- RESTful API endpoints for fee management, attendance, students, etc.

## Development Guidelines
- Use standalone components only
- Implement proper error handling
- Follow responsive design principles
- Use Angular Material consistently
- Maintain clean separation of concerns

## Progress Tracking
- [x] Project structure created
- [ ] Core services implemented
- [ ] Authentication system
- [ ] Dashboard components
- [ ] Integration testing