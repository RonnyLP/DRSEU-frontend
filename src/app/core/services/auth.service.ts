import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: number;
  username: string;
  rol: string;
}

interface LoginResponse {
  token: string;
  username: string;
  rol: string;
}

const API = `${environment.apiUrl}/auth`;
const TOKEN_KEY = 'drseu_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<UserProfile | null>(null);
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  isAuthenticated = () => this.token() !== null;

  init(): void {
    if (this.token()) {
      this.http.get<UserProfile>(`${API}/me`).subscribe({
        next: (user) => this.currentUser.set(user),
        error: () => this.clearSession(),
      });
    }
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${API}/login`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        this.token.set(res.token);
        this.currentUser.set({ id: 0, username: res.username, rol: res.rol });
      }),
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  recoverPassword(email: string) {
    return this.http.post<void>(`${API}/recover-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<void>(`${API}/reset-password`, { token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<void>(`${API}/change-password`, {
      passwordActual: currentPassword,
      passwordNueva: newPassword,
    });
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }
}
