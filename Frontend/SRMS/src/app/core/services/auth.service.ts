import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  exp: number;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly tokenKey = 'srms_auth_token';

  // Signals to hold state
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  forbiddenError = signal<string | null>(null);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Safe check for browser environment to support SSR.
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Retrieves the token from local storage if running in browser.
   */
  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  /**
   * Login method calling ASP.NET Core backend.
   */
  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          this.setSession(res.token);
        }
      })
    );
  }

  /**
   * Logout user, clear storage and state, redirect to login.
   */
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Check if active token is expired.
   */
  isTokenExpired(user: User | null = this.currentUser()): boolean {
    if (!user) return true;
    const now = Math.floor(Date.now() / 1000);
    return user.exp < now;
  }

  /**
   * Initialize state from existing token in localStorage.
   */
  private initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      const user = this.decodeToken(token);
      if (user && !this.isTokenExpired(user)) {
        this.currentUser.set(user);
      } else {
        // Expired or corrupt token, clear it
        this.logout();
      }
    }
  }

  /**
   * Persists the token and sets state.
   */
  private setSession(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
    }
    const user = this.decodeToken(token);
    this.currentUser.set(user);
  }

  /**
   * Custom lightweight JWT decoder that doesn't need external libraries.
   * Maps both standard JWT payload claims and typical ASP.NET Core ClaimTypes.
   */
  private decodeToken(token: string): User | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Base64Url decode payload
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload);

      // ASP.NET Core ClaimTypes mapping fallback to standard OAuth/JWT claims
      const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['nameid'] || decoded['sub'] || '';
      const name = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded['unique_name'] || decoded['name'] || 'User';
      const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded['email'] || '';
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'] || 'Student';
      const exp = decoded['exp'] || 0;

      return {
        id,
        name,
        email,
        role: role as 'Admin' | 'Teacher' | 'Student',
        exp
      };
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  }
}
