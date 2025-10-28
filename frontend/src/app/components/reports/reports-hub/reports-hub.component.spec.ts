import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHubComponent } from './reports-hub.component';

describe('ReportsHubComponent', () => {
  let component: ReportsHubComponent;
  let fixture: ComponentFixture<ReportsHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsHubComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Reports & Analytics');
  });
});
