import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { StudentService } from '../../services/student.service';
import { FeeService } from '../../services/fee.service';
import { AttendanceService } from '../../services/attendance.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockStudentService: jasmine.SpyObj<StudentService>;
  let mockFeeService: jasmine.SpyObj<FeeService>;
  let mockAttendanceService: jasmine.SpyObj<AttendanceService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    mockStudentService = jasmine.createSpyObj('StudentService', ['getStudents']);
    mockFeeService = jasmine.createSpyObj('FeeService', ['getFees']);
    mockAttendanceService = jasmine.createSpyObj('AttendanceService', ['getAttendance']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: StudentService, useValue: mockStudentService },
        { provide: FeeService, useValue: mockFeeService },
        { provide: AttendanceService, useValue: mockAttendanceService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard');
  });
});
