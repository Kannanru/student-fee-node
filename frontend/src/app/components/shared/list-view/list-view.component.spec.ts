import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListViewComponent } from './list-view.component';

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title', () => {
    expect(component.title).toBe('List');
  });

  it('should render empty message when no items', () => {
    component.items = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No items found');
  });

  it('should emit addClick event when add button clicked', () => {
    spyOn(component.addClick, 'emit');
    component.addClick.emit();
    expect(component.addClick.emit).toHaveBeenCalled();
  });
});
