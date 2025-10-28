import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../../services/student.service';
import { FeeService } from '../../../services/fee.service';
import { NotificationService } from '../../../services/notification.service';

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let mockStudentService: jasmine.SpyObj<StudentService>;
  let mockFeeService: jasmine.SpyObj<FeeService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockStudentService = jasmine.createSpyObj('StudentService', ['getStudent']);
    mockFeeService = jasmine.createSpyObj('FeeService', ['getStudentFees']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        { provide: StudentService, useValue: mockStudentService },
        { provide: FeeService, useValue: mockFeeService },
        { provide: NotificationService, useValue: mockNotificationService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
