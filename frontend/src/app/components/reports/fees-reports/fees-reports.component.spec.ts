import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeesReportsComponent } from './fees-reports.component';

describe('FeesReportsComponent', () => {
  let component: FeesReportsComponent;
  let fixture: ComponentFixture<FeesReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeesReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeesReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Fees Reports');
  });
});
