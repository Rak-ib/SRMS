import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-input.html'
})
export class FormInputComponent {
  control = input.required<FormControl>();
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  id = input<string>('');
  
  // Custom error overrides mapping validation key to friendly message
  errorMessages = input<Record<string, string>>({});

  // Default error messages fallback
  private defaultErrors: Record<string, string> = {
    required: 'This field is required.',
    email: 'Please enter a valid email address.',
    minlength: 'Minimum length requirements not met.',
    maxlength: 'Maximum length exceeded.'
  };

  get isInvalid(): boolean {
    const ctrl = this.control();
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  get errorMessage(): string {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    const firstKey = Object.keys(ctrl.errors)[0];
    
    // Render inline server validation messages directly if passed
    if (firstKey === 'serverError') {
      return ctrl.errors['serverError'];
    }

    const overrides = this.errorMessages();

    if (overrides && overrides[firstKey]) {
      return overrides[firstKey];
    }

    if (this.defaultErrors[firstKey]) {
      return this.defaultErrors[firstKey];
    }

    return `Invalid field state (${firstKey}).`;
  }
}
