import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentFeesComponent } from './student-fees.component';

describe('StudentFeesComponent', () => {
  let component: StudentFeesComponent;
  let fixture: ComponentFixture<StudentFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFeesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Student Fee Management');
  });
});
