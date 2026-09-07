import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  authService = inject(AuthService);

  // Signals derived from AuthService state
  currentUser = computed(() => this.authService.currentUser());
  activeRole = computed(() => this.currentUser()?.role || 'Guest');

  logout(): void {
    this.authService.logout();
  }
}
