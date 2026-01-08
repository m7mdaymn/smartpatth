// scan-qr.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MerchantService } from '../../../core/services/merchant.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface ScanResult {
  status: 'success' | 'error' | 'invalid' | 'already_scanned' | 'not-linked';
  title: string;
  customerId: string;
  customerQRCode: string; // Original QR code for re-use
  customerName: string;
  customerPhone: string;
  customerPhoto?: string;
  carPlateNumber?: string;
  currentWashes: number;
  washesRequired: number;
  progress: number;
  daysLeft: number;
  rewardEarned: boolean;
  canAddWash: boolean;
  lastWashDate?: string;
}

interface WashDetails {
  serviceName: string; // General service description
  amount: number;
  carPlateNumber: string;
  notes: string;
}

interface WashType {
  value: string;
  label: string;
  defaultPrice: number;
}

interface RewardScanResult {
  status: 'success' | 'error' | 'claimed' | 'expired';
  title: string;
  message: string;
  customerName: string;
  customerPhone: string;
  rewardTitle: string;
  rewardType: string;
  rewardValue: number;
  rewardExpiresAt?: Date;
  isAlreadyClaimed: boolean;
  isExpired: boolean;
}

@Component({
  selector: 'app-scan-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scan-qr.component.html',
  styleUrls: ['./scan-qr.component.css']
})
export class ScanQrComponent implements OnInit {
  merchantId: string = '';
  showManualInput = false;
  manualQRCode = '';
  
  // Scan result
  scanResult: ScanResult | null = null;
  
  // Reward scan result
  rewardScanResult: RewardScanResult | null = null;
  isRedeemingReward = false;
  
  // Wash details form
  showWashForm = false;
  isSubmittingWash = false;
  washDetails: WashDetails = {
    serviceName: '',
    amount: 0,
    carPlateNumber: '',
    notes: ''
  };

  isLoading = false;

  constructor(
    private router: Router,
    private merchantService: MerchantService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMerchantId();
  }

  loadMerchantId(): void {
    const user = this.authService.user();
    if (user?.id) {
      this.merchantService.getMerchantIdByUserId(user.id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.merchantId = response.data;
          } else {
            this.toast.showError('فشل في تحميل بيانات المغسلة');
            this.goBack();
          }
        },
        error: (error) => {
          this.toast.showError('فشل في تحميل بيانات المغسلة');
          this.goBack();
        }
      });
    } else {
      this.toast.showError('يجب تسجيل الدخول أولاً');
      this.router.navigate(['/auth/signin']);
    }
  }

  openCamera(): void {
    // In a real app, this would open the camera
    // For now, we'll simulate with manual input
    this.openManualInput();
  }

  openManualInput(): void {
    this.showManualInput = true;
  }

  closeManualInput(): void {
    this.showManualInput = false;
    this.manualQRCode = '';
  }

  submitManualQR(): void {
    if (!this.manualQRCode.trim()) {
      this.toast.showError('الرجاء إدخال رمز QR');
      return;
    }

    if (!this.merchantId) {
      this.toast.showError('معرف المغسلة غير متوفر');
      return;
    }

    this.processQRCode(this.manualQRCode);
    this.closeManualInput();
  }

  processQRCode(qrCode: string): void {
    // Reset previous results
    this.scanResult = null;
    this.rewardScanResult = null;
    this.showWashForm = false;
    
    // Validate QR code format
    if (!this.validateQRCodeFormat(qrCode)) {
      this.scanResult = {
        status: 'invalid',
        title: 'رمز غير صالح',
        customerId: '',
        customerQRCode: qrCode,
        customerName: 'غير معروف',
        customerPhone: '-',
        currentWashes: 0,
        washesRequired: 10,
        progress: 0,
        daysLeft: 0,
        rewardEarned: false,
        canAddWash: false
      };
      this.toast.showError('صيغة رمز QR غير صحيحة');
      return;
    }

    // Check if this is a reward QR code
    if (qrCode.startsWith('REWARD-')) {
      this.processRewardQRCode(qrCode);
      return;
    }

    // Process regular customer QR code
    this.isLoading = true;
    this.merchantService.scanQRCode(this.merchantId, qrCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          const data = response.data;
          // Assuming the API response has different property names
          // Adjust based on actual API response structure
          const customerInfo = data as any;
          const washesRequired = customerInfo.washesRequired || customerInfo.requiredStamps || 10;
          const currentWashes = customerInfo.currentWashes || customerInfo.completedStamps || 0;
          const progress = Math.min(100, (currentWashes / washesRequired) * 100);
          const lastWashDate = customerInfo.lastWashDate || customerInfo.lastWash;
          
          this.scanResult = {
            status: 'success',
            title: 'تم التعرف على العميل',
            customerId: customerInfo.customerId || customerInfo.id || '',
            customerQRCode: qrCode, // Store the original QR code
            customerName: customerInfo.customerName || customerInfo.name || 'عميل',
            customerPhone: customerInfo.customerPhone || customerInfo.phone || '-',
            customerPhoto: customerInfo.customerPhoto || customerInfo.photo,
            carPlateNumber: customerInfo.carPlateNumber || customerInfo.plateNumber || '',
            currentWashes: currentWashes,
            washesRequired: washesRequired,
            progress: progress,
            daysLeft: customerInfo.daysLeft || customerInfo.daysRemaining || 30,
            rewardEarned: currentWashes >= washesRequired,
            canAddWash: this.canAddWashToday(lastWashDate),
            lastWashDate: lastWashDate
          };

          // Pre-fill car plate number if available
          if (customerInfo.carPlateNumber || customerInfo.plateNumber) {
            this.washDetails.carPlateNumber = customerInfo.carPlateNumber || customerInfo.plateNumber || '';
          }
          
          // Show wash form if allowed
          if (this.scanResult.canAddWash) {
            this.showWashForm = true;
          } else {
            this.toast.showWarning('لا يمكن إضافة غسلة اليوم. تم تسجيل غسلة اليوم بالفعل.');
          }

          if (this.scanResult.rewardEarned) {
            this.toast.showSuccess('العميل استحق مكافأة!');
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'فشل في معالجة رمز QR';
        const errorData = error.error?.data;
        
        // Check if we have customer data from the error response (customer exists but not linked)
        if (errorData && (errorData.customerName || errorData.CustomerName)) {
          // Customer exists but is not linked to this merchant
          this.scanResult = {
            status: 'not-linked',
            title: 'العميل غير مسجل لديك',
            customerId: '',
            customerQRCode: qrCode,
            customerName: errorData.customerName || errorData.CustomerName || 'عميل',
            customerPhone: errorData.customerPhone || errorData.CustomerPhone || '-',
            carPlateNumber: errorData.carPlateNumber || errorData.CarPlateNumber || '',
            currentWashes: 0,
            washesRequired: 10,
            progress: 0,
            daysLeft: 0,
            rewardEarned: false,
            canAddWash: false
          };
          this.toast.showWarning('هذا العميل غير مسجل في مغسلتك. يمكنك إضافته من قائمة العملاء.');
        } else {
          this.scanResult = {
            status: 'error',
            title: 'خطأ في المسح',
            customerId: '',
            customerQRCode: qrCode,
            customerName: 'غير معروف',
            customerPhone: '-',
            currentWashes: 0,
            washesRequired: 10,
            progress: 0,
            daysLeft: 0,
            rewardEarned: false,
            canAddWash: false
          };
          this.toast.showError(errorMessage);
        }
      }
    });
  }

  validateQRCodeFormat(qrCode: string): boolean {
    // Basic validation - QR codes should be alphanumeric and not empty
    if (!qrCode || qrCode.trim().length === 0) {
      return false;
    }
    
    // Check for common QR code patterns
    const patterns = [
      /^DP-CUST-/i,
      /^CUST-/i,
      /^REWARD-/i,
      /^[A-Z0-9]{8,}$/i
    ];
    
    return patterns.some(pattern => pattern.test(qrCode));
  }

  canAddWashToday(lastWashDate?: string): boolean {
    if (!lastWashDate) return true;
    
    try {
      const lastWash = new Date(lastWashDate);
      const today = new Date();
      
      // Reset time parts for accurate day comparison
      lastWash.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      // Return true if last wash was before today
      return lastWash.getTime() < today.getTime();
    } catch (error) {
      console.error('Error parsing date:', error);
      return true; // If date parsing fails, allow wash
    }
  }

  processRewardQRCode(qrCode: string): void {
    // Reward QR code processing
    this.isLoading = true;
    this.merchantService.validateRewardQR(this.merchantId, qrCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          const rewardData = response.data as any;
          this.rewardScanResult = {
            status: rewardData.success ? 'success' : 
                   (rewardData.isAlreadyClaimed ? 'claimed' : 
                   (rewardData.isExpired ? 'expired' : 'error')),
            title: rewardData.title || (rewardData.success ? 'مكافأة صالحة' : 'مكافأة غير صالحة'),
            message: rewardData.message || '',
            customerName: rewardData.customerName || 'غير معروف',
            customerPhone: rewardData.customerPhone || '-',
            rewardTitle: rewardData.rewardTitle || 'مكافأة',
            rewardType: rewardData.rewardType || 'free_wash',
            rewardValue: rewardData.rewardValue || 0,
            rewardExpiresAt: rewardData.rewardExpiresAt,
            isAlreadyClaimed: rewardData.isAlreadyClaimed || false,
            isExpired: rewardData.isExpired || false
          };
          
          if (rewardData.success) {
            this.toast.showSuccess('مكافأة صالحة للاستخدام!');
          } else if (rewardData.isAlreadyClaimed) {
            this.toast.showWarning('تم استخدام هذه المكافأة مسبقاً');
          } else if (rewardData.isExpired) {
            this.toast.showWarning('انتهت صلاحية المكافأة');
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toast.showError(error.error?.message || 'فشل في التحقق من المكافأة');
      }
    });
  }

  redeemReward(): void {
    if (!this.merchantId || !this.rewardScanResult || !this.manualQRCode) {
      return;
    }
    
    this.isRedeemingReward = true;
    
    this.merchantService.redeemReward(this.merchantId, this.manualQRCode).subscribe({
      next: (response) => {
        this.isRedeemingReward = false;
        if (response.success) {
          this.toast.showSuccess('تم استخدام المكافأة بنجاح!');
          if (this.rewardScanResult) {
            this.rewardScanResult.status = 'claimed';
            this.rewardScanResult.title = '✓ تم استخدام المكافأة';
            this.rewardScanResult.isAlreadyClaimed = true;
          }
        }
      },
      error: (error) => {
        this.isRedeemingReward = false;
        this.toast.showError(error.error?.message || 'فشل في استخدام المكافأة');
      }
    });
  }

  recordWash(): void {
    if (!this.scanResult || !this.merchantId) {
      this.toast.showError('لا توجد بيانات صالحة');
      return;
    }

    if (!this.washDetails.serviceName.trim()) {
      this.toast.showError('يرجى إدخال نوع الخدمة');
      return;
    }

    this.isSubmittingWash = true;

    const washData = {
      customerId: this.scanResult.customerId,
      customerQRCode: this.scanResult.customerQRCode, // Use the original QR code
      merchantId: this.merchantId,
      washType: this.washDetails.serviceName,
      price: this.washDetails.amount,
      carPlateNumber: this.washDetails.carPlateNumber || this.scanResult.carPlateNumber,
      notes: this.washDetails.notes
    };

    console.log('📤 [RECORD-WASH] Sending wash data:', washData);
    
    this.merchantService.recordWash(washData).subscribe({
      next: (response) => {
        this.isSubmittingWash = false;
        console.log('✅ [RECORD-WASH] Success response:', response);
        if (response.success) {
          this.toast.showSuccess('تم تسجيل الغسلة بنجاح!');
          
          // Update scan result
          if (this.scanResult) {
            this.scanResult.currentWashes += 1;
            this.scanResult.progress = Math.min(100, (this.scanResult.currentWashes / this.scanResult.washesRequired) * 100);
            
            if (this.scanResult.currentWashes >= this.scanResult.washesRequired) {
              this.scanResult.rewardEarned = true;
              this.toast.showSuccess('العميل استحق مكافأة!');
            }
            
            this.scanResult.canAddWash = false; // Can't add another wash today
          }
          
          this.showWashForm = false;
          this.resetWashDetails();
        }
      },
      error: (error) => {
        this.isSubmittingWash = false;
        console.error('❌ [RECORD-WASH] Error response:', error);
        console.error('❌ [RECORD-WASH] Error message:', error.error?.message);
        console.error('❌ [RECORD-WASH] Error details:', error.error);
        this.toast.showError(error.error?.message || 'فشل تسجيل الغسلة');
      }
    });
  }

  cancelWashForm(): void {
    this.showWashForm = false;
    this.resetWashDetails();
  }

  resetWashDetails(): void {
    this.washDetails = {
      serviceName: '',
      amount: 0,
      carPlateNumber: '',
      notes: ''
    };
  }

  goBack(): void {
    this.router.navigate(['/merchant/dashboard']);
  }

  resetScan(): void {
    this.scanResult = null;
    this.rewardScanResult = null;
    this.showWashForm = false;
    this.manualQRCode = '';
    this.resetWashDetails();
    this.isRedeemingReward = false;
  }

  scanAgain(): void {
    this.resetScan();
    this.openCamera();
  }
}