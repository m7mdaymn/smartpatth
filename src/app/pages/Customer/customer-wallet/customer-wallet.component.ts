import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
  paymentMethod?: string;
}

interface PaymentMethod {
  id: number;
  type: string;
  name: string;
  lastDigits: string;
  icon: string;
}

@Component({
  selector: 'app-customer-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-wallet.component.html',
  styleUrls: ['./customer-wallet.component.css']
})
export class CustomerWalletComponent implements OnInit {
  balance = 450;
  transactions: Transaction[] = [];
  paymentMethods: PaymentMethod[] = [];
  addFundsAmount = '';
  selectedPaymentMethod: PaymentMethod | null = null;
  isLoading = false;
  showAddFundsModal = false;
  successMessage = '';

  constructor() {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadPaymentMethods();
  }

  loadTransactions(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.transactions = [
        {
          id: 1,
          date: '2024-01-15',
          description: 'إضافة رصيد عبر البطاقة',
          amount: 200,
          type: 'credit',
          balance: 650,
          paymentMethod: 'بطاقة ائتمان'
        },
        {
          id: 2,
          date: '2024-01-14',
          description: 'دفع غسلة - مغسلة النور',
          amount: 50,
          type: 'debit',
          balance: 450
        },
        {
          id: 3,
          date: '2024-01-12',
          description: 'إضافة رصيد عبر STC Pay',
          amount: 300,
          type: 'credit',
          balance: 500,
          paymentMethod: 'STC Pay'
        },
        {
          id: 4,
          date: '2024-01-10',
          description: 'دفع غسلة - مغسلة الهدى',
          amount: 30,
          type: 'debit',
          balance: 200
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  loadPaymentMethods(): void {
    this.paymentMethods = [
      { id: 1, type: 'card', name: 'بطاقة الراجحي', lastDigits: '4242', icon: '💳' },
      { id: 2, type: 'stc', name: 'STC Pay', lastDigits: '0551234567', icon: '📱' },
      { id: 3, type: 'apay', name: 'Apple Pay', lastDigits: '****', icon: '🍎' }
    ];
    this.selectedPaymentMethod = this.paymentMethods[0];
  }

  openAddFundsModal(): void {
    this.showAddFundsModal = true;
  }

  closeAddFundsModal(): void {
    this.showAddFundsModal = false;
    this.addFundsAmount = '';
  }

  addFunds(): void {
    const amount = parseFloat(this.addFundsAmount);
    if (amount > 0 && this.selectedPaymentMethod) {
      this.isLoading = true;
      setTimeout(() => {
        this.balance += amount;
        this.transactions.unshift({
          id: this.transactions.length + 1,
          date: new Date().toISOString().split('T')[0],
          description: `إضافة رصيد عبر ${this.selectedPaymentMethod?.name}`,
          amount: amount,
          type: 'credit',
          balance: this.balance,
          paymentMethod: this.selectedPaymentMethod?.name
        });
        this.successMessage = `تم إضافة ${amount} ريال بنجاح!`;
        this.closeAddFundsModal();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      }, 1500);
    }
  }

  quickAddAmount(amount: number): void {
    this.addFundsAmount = amount.toString();
  }
}
