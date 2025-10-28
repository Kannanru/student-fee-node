import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceReportsComponent } from './attendance-reports.component';

describe('AttendanceReportsComponent', () => {
  let component: AttendanceReportsComponent;
  let fixture: ComponentFixture<AttendanceReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttendanceReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Attendance Reports');
  });
});
