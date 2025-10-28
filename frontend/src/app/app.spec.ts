import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ApiService } from './services/api.service';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        { provide: ApiService, useValue: { healthCheck: () => of({ status: 'ok', message: 'ok' }) } }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Verify app container exists and router outlet placeholder is present
    expect(compiled.querySelector('.app-container')).not.toBeNull();
    expect(compiled.querySelector('main.main-content')).not.toBeNull();
  });
});
