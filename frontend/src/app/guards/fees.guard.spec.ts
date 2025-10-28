import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FeesGuard } from './fees.guard';
import { AuthService } from '../services/auth.service';

class MockAuthService {
  private user: any = null;
  setUser(u: any) { this.user = u; }
  getCurrentUser() { return this.user; }
}

class MockRouter {
  public navigatedTo: any[] | null = null;
  navigate(commands: any[]) { this.navigatedTo = commands; }
}

describe('FeesGuard', () => {
  let auth: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService }
      ]
    });

    auth = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('should allow admin role', () => {
    auth.setUser({ role: 'admin' });
    const result = TestBed.runInInjectionContext(() => FeesGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('should block non-allowed role and navigate to unauthorized', () => {
    auth.setUser({ role: 'student' });
    const result = TestBed.runInInjectionContext(() => FeesGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(router.navigatedTo).toEqual(['/unauthorized']);
  });
});
