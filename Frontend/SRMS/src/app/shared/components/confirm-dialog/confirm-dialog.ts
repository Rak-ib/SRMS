import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html'
})
export class ConfirmDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Confirm Deletion');
  message = input<string>('Are you sure you want to proceed? This action cannot be undone.');
  itemName = input<string>('');
  isDeleting = input<boolean>(false);

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    if (!this.isDeleting()) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.isDeleting()) {
      this.cancel.emit();
    }
  }
}
