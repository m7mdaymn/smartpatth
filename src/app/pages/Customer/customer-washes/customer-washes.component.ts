import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WashService {
  id: number;
  name: string;
  price: number;
  duration: number;
  icon: string;
}

interface Merchant {
  id: number;
  name: string;
  location: string;
  rating: number;
  distance: number;
  availableServices: WashService[];
}

@Component({
  selector: 'app-customer-washes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-washes.component.html',
  styleUrls: ['./customer-washes.component.css']
})
export class CustomerWashesComponent implements OnInit {
  merchants: Merchant[] = [];
  selectedMerchant: Merchant | null = null;
  selectedService: WashService | null = null;
  bookingDate = '';
  bookingTime = '';
  isLoading = false;
  showBookingModal = false;
  successMessage = '';

  washServices: WashService[] = [
    { id: 1, name: 'غسلة خارجية', price: 30, duration: 15, icon: '💨' },
    { id: 2, name: 'غسلة كاملة', price: 50, duration: 30, icon: '🚗' },
    { id: 3, name: 'تلميع', price: 120, duration: 45, icon: '✨' },
    { id: 4, name: 'معالجة السيراميك', price: 180, duration: 60, icon: '🔷' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadMerchants();
  }

  loadMerchants(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.merchants = [
        {
          id: 1,
          name: 'مغسلة النور',
          location: 'الرياض - حي الملز',
          rating: 4.8,
          distance: 2.5,
          availableServices: this.washServices
        },
        {
          id: 2,
          name: 'مغسلة الهدى',
          location: 'الرياض - حي النرجس',
          rating: 4.6,
          distance: 3.8,
          availableServices: this.washServices
        },
        {
          id: 3,
          name: 'مغسلة المستقبل',
          location: 'الرياض - حي الربيع',
          rating: 4.7,
          distance: 1.2,
          availableServices: this.washServices
        },
        {
          id: 4,
          name: 'مغسلة الفيصل',
          location: 'الرياض - حي الفيصلية',
          rating: 4.5,
          distance: 4.1,
          availableServices: this.washServices
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  selectMerchant(merchant: Merchant | null): void {
    this.selectedMerchant = merchant;
    this.selectedService = null;
  }

  selectService(service: WashService): void {
    this.selectedService = service;
    this.showBookingModal = true;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.bookingDate = '';
    this.bookingTime = '';
  }

  confirmBooking(): void {
    if (!this.bookingDate || !this.bookingTime || !this.selectedMerchant || !this.selectedService) {
      alert('يرجى ملء جميع البيانات');
      return;
    }

    this.isLoading = true;
    setTimeout(() => {
      this.successMessage = `تم حجز ${this.selectedService?.name} في ${this.selectedMerchant?.name} بنجاح!`;
      this.closeBookingModal();
      this.isLoading = false;
      setTimeout(() => this.successMessage = '', 4000);
    }, 1500);
  }
}
