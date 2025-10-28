import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../../services/student.service';
import { NotificationService } from '../../../services/notification.service';

describe('StudentFormComponent', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;
  let mockStudentService: jasmine.SpyObj<StudentService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockStudentService = jasmine.createSpyObj('StudentService', ['createStudent', 'updateStudent', 'getStudent']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      imports: [StudentFormComponent, ReactiveFormsModule],
      providers: [
        { provide: StudentService, useValue: mockStudentService },
        { provide: NotificationService, useValue: mockNotificationService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({})
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize student form', () => {
    expect(component.studentForm).toBeDefined();
  });
});
