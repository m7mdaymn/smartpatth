import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MerchantSettings {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessLocation: string;
  businessHours: string;
  currency: string;
  loyaltyPointsRate: number;
  notificationsEnabled: boolean;
}

@Component({
  selector: 'app-merchant-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-setting.component.html',
  styleUrls: ['./merchant-setting.component.css']
})
export class MerchantSettingComponent implements OnInit {
  settings: MerchantSettings = {
    businessName: 'مغسلة النخبة للسيارات',
    businessPhone: '0112223333',
    businessEmail: 'info@alkhubar-wash.com',
    businessLocation: 'الرياض - حي الملز',
    businessHours: '08:00 - 20:00',
    currency: 'ريال سعودي',
    loyaltyPointsRate: 1,
    notificationsEnabled: true
  };

  editMode = false;
  isLoading = false;
  successMessage = '';

  constructor() {}

  ngOnInit(): void {}

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  saveSettings(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.successMessage = 'تم حفظ الإعدادات بنجاح';
      this.editMode = false;
      this.isLoading = false;
      setTimeout(() => this.successMessage = '', 3000);
    }, 1000);
  }

  resetPassword(): void {
    if (confirm('هل تريد تغيير كلمة المرور؟')) {
      alert('تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني');
    }
  }
}
