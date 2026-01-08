import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { MerchantPublicInfo } from '../../../core/models/api-response.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-enter-merchant-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './enter-merchant-code.component.html',
  styleUrls: ['./enter-merchant-code.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class EnterMerchantCodeComponent {
  codeForm: FormGroup;
  isLoading = false;
  merchantInfo: MerchantPublicInfo | null = null;
  codeValidated = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^[A-Z0-9]+$/)]]
    });
  }

  formatCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.codeForm.get('code')?.setValue(input.value);
  }

  onSubmit(): void {
    if (this.codeForm.invalid) {
      return;
    }

    this.isLoading = true;
    const code = this.codeForm.value.code;

    this.authService.validateMerchantCode(code).subscribe({
      next: (merchantInfo) => {
        this.isLoading = false;
        this.merchantInfo = merchantInfo;
        this.codeValidated = true;
        
        if (!merchantInfo.isActive) {
          this.toast.showError('هذا التاجر غير نشط حالياً');
          this.codeValidated = false;
          this.merchantInfo = null;
        }
      },
      error: () => {
        this.isLoading = false;
        this.codeValidated = false;
        this.merchantInfo = null;
      }
    });
  }

  proceedToRegistration(): void {
    if (this.merchantInfo) {
      this.router.navigate(['/auth/register', this.merchantInfo.merchantId]);
    }
  }

  resetCode(): void {
    this.codeValidated = false;
    this.merchantInfo = null;
    this.codeForm.reset();
  }
}
