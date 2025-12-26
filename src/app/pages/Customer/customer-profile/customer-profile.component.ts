import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar: string;
  carModel: string;
  carColor: string;
  licensePlate: string;
}

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  profile: UserProfile = {
    name: 'محمد أحمد',
    email: 'customer@example.com',
    phone: '0551234567',
    city: 'الرياض',
    avatar: 'https://ui-avatars.com/api/?name=محمد+أحمد&background=3B82F6&color=fff&size=128',
    carModel: 'تويوتا كامري',
    carColor: 'أسود',
    licensePlate: 'ر ج ج 1234'
  };

  editMode = false;
  isLoading = false;
  successMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.authService.user();
    if (user) {
      this.profile = { ...this.profile, ...user };
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  saveProfile(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.successMessage = 'تم تحديث الملف الشخصي بنجاح';
      this.editMode = false;
      this.isLoading = false;
      setTimeout(() => this.successMessage = '', 3000);
    }, 1000);
  }

  changeAvatar(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.profile.avatar = event.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
}
