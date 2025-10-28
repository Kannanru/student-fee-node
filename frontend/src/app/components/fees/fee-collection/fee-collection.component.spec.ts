import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FeeCollectionComponent } from './fee-collection.component';
import { FeeService } from '../../../services/fee.service';
import { StudentService } from '../../../services/student.service';

describe('FeeCollectionComponent', () => {
  let component: FeeCollectionComponent;
  let fixture: ComponentFixture<FeeCollectionComponent>;
  let mockFeeService: jasmine.SpyObj<FeeService>;
  let mockStudentService: jasmine.SpyObj<StudentService>;

  beforeEach(async () => {
    mockFeeService = jasmine.createSpyObj('FeeService', ['collectFee', 'getStudentFees']);
    mockStudentService = jasmine.createSpyObj('StudentService', ['searchStudents']);

    await TestBed.configureTestingModule({
      imports: [FeeCollectionComponent, ReactiveFormsModule],
      providers: [
        { provide: FeeService, useValue: mockFeeService },
        { provide: StudentService, useValue: mockStudentService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeeCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize payment form', () => {
    expect(component.paymentForm).toBeDefined();
  });
});
