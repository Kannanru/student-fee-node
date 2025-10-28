import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../services/student.service';
import { NotificationService } from '../../../services/notification.service';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let mockStudentService: jasmine.SpyObj<StudentService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockStudentService = jasmine.createSpyObj('StudentService', ['getStudents', 'searchStudents']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        { provide: StudentService, useValue: mockStudentService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render student list title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Student');
  });
});
