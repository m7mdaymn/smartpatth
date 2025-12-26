import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Customer {
  id: number;
  name: string;
  phone: string;
  totalWashes: number;
  loyaltyPoints: number;
  lastWash: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-merchant-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-customers.component.html',
  styleUrls: ['./merchant-customers.component.css']
})
export class MerchantCustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm = '';
  isLoading = false;

  constructor() {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.customers = [
        {
          id: 1,
          name: 'أحمد محمد',
          phone: '0551234567',
          totalWashes: 25,
          loyaltyPoints: 850,
          lastWash: '2024-01-15',
          status: 'active'
        },
        {
          id: 2,
          name: 'سعيد خالد',
          phone: '0552345678',
          totalWashes: 18,
          loyaltyPoints: 520,
          lastWash: '2024-01-14',
          status: 'active'
        },
        {
          id: 3,
          name: 'فهد علي',
          phone: '0553456789',
          totalWashes: 42,
          loyaltyPoints: 1200,
          lastWash: '2024-01-13',
          status: 'active'
        },
        {
          id: 4,
          name: 'محمود سالم',
          phone: '0554567890',
          totalWashes: 8,
          loyaltyPoints: 180,
          lastWash: '2023-12-20',
          status: 'inactive'
        }
      ];
      this.filteredCustomers = this.customers;
      this.isLoading = false;
    }, 1000);
  }

  searchCustomers(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredCustomers = this.customers;
    } else {
      this.filteredCustomers = this.customers.filter(c =>
        c.name.includes(this.searchTerm) || c.phone.includes(this.searchTerm)
      );
    }
  }

  getStatusBadge(status: string): string {
    return status === 'active' ? 'نشط' : 'غير نشط';
  }
}
