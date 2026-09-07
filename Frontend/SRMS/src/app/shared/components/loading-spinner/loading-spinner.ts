import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.html'
})
export class LoadingSpinnerComponent {
  overlay = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg'>('md');
  message = input<string>('');
}
