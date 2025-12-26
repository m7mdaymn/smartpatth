import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalWashes: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'suspended';
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
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
        { id: 1, name: 'أحمد محمد', email: 'ahmad@example.com', phone: '0551234567', totalWashes: 25, totalSpent: 1250, joinDate: '2023-10-15', status: 'active' },
        { id: 2, name: 'سارة علي', email: 'sarah@example.com', phone: '0552345678', totalWashes: 18, totalSpent: 900, joinDate: '2023-11-20', status: 'active' },
        { id: 3, name: 'محمود سالم', email: 'mahmoud@example.com', phone: '0553456789', totalWashes: 42, totalSpent: 2100, joinDate: '2023-08-10', status: 'active' },
        { id: 4, name: 'نور خالد', email: 'nour@example.com', phone: '0554567890', totalWashes: 8, totalSpent: 400, joinDate: '2024-01-05', status: 'suspended' }
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
        c.name.includes(this.searchTerm) || c.email.includes(this.searchTerm)
      );
    }
  }

  suspendCustomer(id: number): void {
    const customer = this.customers.find(c => c.id === id);
    if (customer) {
      customer.status = customer.status === 'active' ? 'suspended' : 'active';
    }
  }
}
