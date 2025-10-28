import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeDashboardComponent } from './fee-dashboard.component';
import { FeeService } from '../../../services/fee.service';
import { NotificationService } from '../../../services/notification.service';

describe('FeeDashboardComponent', () => {
  let component: FeeDashboardComponent;
  let fixture: ComponentFixture<FeeDashboardComponent>;
  let mockFeeService: jasmine.SpyObj<FeeService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockFeeService = jasmine.createSpyObj('FeeService', ['getFeeStats', 'getRecentPayments', 'getDefaulters']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      imports: [FeeDashboardComponent],
      providers: [
        { provide: FeeService, useValue: mockFeeService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render fee dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Fee');
  });
});
