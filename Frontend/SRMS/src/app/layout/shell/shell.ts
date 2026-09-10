import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { SidebarComponent } from '../sidebar/sidebar';
import { AuthService } from '@core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, ToastComponent],
  templateUrl: './shell.html'
})
export class ShellComponent implements OnInit {
  private authService = inject(AuthService);

  // Compute the current active role for sidebar display filtering
  activeRole = computed(() => this.authService.currentUser()?.role || 'Student');

  ngOnInit() {
    console.log('hello from shell component', this.authService.currentUser(),this.activeRole());
  }

  // Expose the global forbidden error signal to the template
  forbiddenError = this.authService.forbiddenError;
}
