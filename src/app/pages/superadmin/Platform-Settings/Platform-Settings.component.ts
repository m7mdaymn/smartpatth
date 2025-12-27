import { Component } from '@angular/core';

@Component({
  selector: 'app-platform-settings',
  standalone: true,
  imports: [],
  templateUrl: './platform-settings.component.html',
  styleUrl: './platform-settings.component.css'
})
export class PlatformSettingsComponent {

}
// platform-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PlatformSettings {
  // General Settings
  name: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
  defaultLanguage: string;
  timezone: string;
  
  // Subscription Settings
  basicPlanMonthlyPrice: number;
  basicPlanYearlyPrice: number;
  proPlanMonthlyPrice: number;
  proPlanYearlyPrice: number;
  enableFreeTrial: boolean;
  trialPeriodDays: number;
  enableTax: boolean;
  taxRate: number;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  renewalReminders: boolean;
  renewalReminderDays: number;
  welcomeEmail: boolean;
  newMerchantAlert: boolean;
  
  // Payment Settings
  paymentMethods: {
    creditCard: boolean;
    bankTransfer: boolean;
    cashOnDelivery: boolean;
  };
  paymentGateway: string;
  paymentApiKey: string;
  paymentSecretKey: string;
  autoRenewal: boolean;
  renewalType: string;
  
  // Security Settings
  passwordPolicy: {
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    minLength: number;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
  allowMultipleSessions: boolean;
  twoFactorAuth: boolean;
  twoFactorMethods: {
    sms: boolean;
    email: boolean;
    authenticator: boolean;
  };
  
  // Maintenance Settings
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceStart: string;
  maintenanceEnd: string;
  maintenanceAccess: {
    admins: boolean;
    merchants: boolean;
  };
  autoBackup: boolean;
  backupFrequency: string;
  backupRetentionDays: number;
  logsRetentionDays: number;
  logsLevel: string;
}

@Component({
  selector: 'app-platform-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './platform-settings.component.html',
  styleUrls: ['./platform-settings.component.css']
})
export class PlatformSettingsComponent implements OnInit {
  activeTab: 'general' | 'subscriptions' | 'notifications' | 'payment' | 'security' | 'maintenance' = 'general';
  isSaving = false;
  isLoading = false;
  
  platformSettings: PlatformSettings = {
    // General Settings
    name: 'Digital Pass',
    logoUrl: '',
    supportEmail: 'support@digitalpass.com',
    supportPhone: '0548290509',
    defaultLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    
    // Subscription Settings
    basicPlanMonthlyPrice: 99,
    basicPlanYearlyPrice: 999,
    proPlanMonthlyPrice: 149,
    proPlanYearlyPrice: 1499,
    enableFreeTrial: true,
    trialPeriodDays: 7,
    enableTax: true,
    taxRate: 15,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    renewalReminders: true,
    renewalReminderDays: 3,
    welcomeEmail: true,
    newMerchantAlert: true,
    
    // Payment Settings
    paymentMethods: {
      creditCard: true,
      bankTransfer: true,
      cashOnDelivery: true
    },
    paymentGateway: 'moyasar',
    paymentApiKey: '',
    paymentSecretKey: '',
    autoRenewal: true,
    renewalType: 'current_price',
    
    // Security Settings
    passwordPolicy: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      minLength: 8
    },
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    allowMultipleSessions: true,
    twoFactorAuth: false,
    twoFactorMethods: {
      sms: true,
      email: true,
      authenticator: false
    },
    
    // Maintenance Settings
    maintenanceMode: false,
    maintenanceMessage: 'نظام الصيانة قيد التطوير حالياً، سوف نعود قريباً.',
    maintenanceStart: '',
    maintenanceEnd: '',
    maintenanceAccess: {
      admins: true,
      merchants: false
    },
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetentionDays: 30,
    logsRetentionDays: 90,
    logsLevel: 'info'
  };

  constructor() {}

  ngOnInit(): void {
    this.loadSettings();
  }

  setActiveTab(tab: 'general' | 'subscriptions' | 'notifications' | 'payment' | 'security' | 'maintenance'): void {
    this.activeTab = tab;
  }

  loadSettings(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would fetch from API
      this.isLoading = false;
    }, 500);
  }

  saveSettings(): void {
    this.isSaving = true;
    
    // Validate settings
    if (!this.validateSettings()) {
      this.isSaving = false;
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      console.log('Saving platform settings:', this.platformSettings);
      this.isSaving = false;
      this.showSuccess('تم حفظ الإعدادات بنجاح!');
    }, 1500);
  }

  private validateSettings(): boolean {
    // Basic validation
    if (!this.platformSettings.name.trim()) {
      this.showError('اسم المنصة مطلوب');
      return false;
    }
    
    if (!this.platformSettings.supportEmail.trim()) {
      this.showError('بريد الدعم مطلوب');
      return false;
    }
    
    if (this.platformSettings.basicPlanMonthlyPrice <= 0) {
      this.showError('سعر باقة Basic يجب أن يكون أكبر من صفر');
      return false;
    }
    
    if (this.platformSettings.proPlanMonthlyPrice <= 0) {
      this.showError('سعر باقة Pro يجب أن يكون أكبر من صفر');
      return false;
    }
    
    if (this.platformSettings.enableFreeTrial && 
        (this.platformSettings.trialPeriodDays < 1 || this.platformSettings.trialPeriodDays > 30)) {
      this.showError('مدة التجربة يجب أن تكون بين 1 و 30 يوم');
      return false;
    }
    
    return true;
  }

  uploadLogo(): void {
    // In a real app, this would open a file upload dialog
    console.log('Opening logo upload dialog...');
    // For demo purposes, set a dummy logo
    this.platformSettings.logoUrl = 'https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=DP';
    this.showSuccess('تم رفع الشعار بنجاح');
  }

  removeLogo(): void {
    this.platformSettings.logoUrl = '';
    this.showSuccess('تم إزالة الشعار');
  }

  onMaintenanceToggle(): void {
    if (this.platformSettings.maintenanceMode) {
      const confirm = window.confirm('هل أنت متأكد من تفعيل وضع الصيانة؟ سيتوقف النظام مؤقتاً للمستخدمين.');
      if (!confirm) {
        this.platformSettings.maintenanceMode = false;
      }
    }
  }

  createBackup(): void {
    console.log('Creating system backup...');
    this.showSuccess('جاري إنشاء نسخة احتياطية للنظام...');
    
    // Simulate backup process
    setTimeout(() => {
      this.showSuccess('تم إنشاء النسخة الاحتياطية بنجاح');
    }, 2000);
  }

  restoreBackup(): void {
    console.log('Restoring from backup...');
    this.showSuccess('جاري استعادة النسخة الاحتياطية...');
    
    // Simulate restore process
    setTimeout(() => {
      this.showSuccess('تم استعادة النسخة الاحتياطية بنجاح');
    }, 2000);
  }

  downloadLogs(): void {
    console.log('Downloading system logs...');
    this.showSuccess('جاري تحميل سجلات النظام...');
    
    // Simulate download
    setTimeout(() => {
      this.showSuccess('تم تحميل السجلات بنجاح');
    }, 1500);
  }

  clearLogs(): void {
    const confirm = window.confirm('هل أنت متأكد من مسح السجلات القديمة؟ هذا الإجراء لا يمكن التراجع عنه.');
    if (confirm) {
      console.log('Clearing old logs...');
      this.showSuccess('جاري مسح السجلات القديمة...');
      
      setTimeout(() => {
        this.showSuccess('تم مسح السجلات القديمة بنجاح');
      }, 1500);
    }
  }

  private showSuccess(message: string): void {
    alert(`✅ ${message}`);
  }

  private showError(message: string): void {
    alert(`❌ ${message}`);
  }
}