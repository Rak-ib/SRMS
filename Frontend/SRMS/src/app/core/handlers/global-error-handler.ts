import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { ToastService } from '../../shared/services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: any): void {
    // Log the raw error to console for developers
    console.error('Global Error caught:', error);

    // Resolve ToastService lazily to bypass Angular's early bootstrap cyclic dependencies
    try {
      const toastService = this.injector.get(ToastService);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' ? error : 'An unexpected application crash was intercepted.';
        
      toastService.error(`Critical Error: ${errorMessage}`, 6000);
    } catch (e) {
      // Fallback if toast resolution itself fails during startup
      console.error('Failed to notify error via ToastService:', e);
    }
  }
}
