import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceDashboardComponent } from './attendance-dashboard.component';
import { AttendanceService } from '../../../services/attendance.service';
import { NotificationService } from '../../../services/notification.service';

describe('AttendanceDashboardComponent', () => {
  let component: AttendanceDashboardComponent;
  let fixture: ComponentFixture<AttendanceDashboardComponent>;
  let mockAttendanceService: jasmine.SpyObj<AttendanceService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockAttendanceService = jasmine.createSpyObj('AttendanceService', ['getDailyReport', 'getSummary']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      imports: [AttendanceDashboardComponent],
      providers: [
        { provide: AttendanceService, useValue: mockAttendanceService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttendanceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render attendance dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Attendance');
  });
});
