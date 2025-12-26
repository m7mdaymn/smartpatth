import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Merchant {
  id: number;
  businessName: string;
  ownerName: string;
  phone: string;
  location: string;
  totalCustomers: number;
  totalRevenue: number;
  joinDate: string;
  status: 'active' | 'suspended';
  rating: number;
}

@Component({
  selector: 'app-merchant-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-details.component.html',
  styleUrls: ['./merchant-details.component.css']
})
export class MerchantDetailsComponent implements OnInit {
  merchants: Merchant[] = [];
  filteredMerchants: Merchant[] = [];
  searchTerm = '';
  isLoading = false;

  constructor() {}

  ngOnInit(): void {
    this.loadMerchants();
  }

  loadMerchants(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.merchants = [
        { id: 1, businessName: 'مغسلة النور', ownerName: 'خالد محمد', phone: '0112223333', location: 'الرياض - الملز', totalCustomers: 245, totalRevenue: 48500, joinDate: '2023-05-10', status: 'active', rating: 4.8 },
        { id: 2, businessName: 'مغسلة الهدى', ownerName: 'فاطمة علي', phone: '0113334444', location: 'الرياض - النرجس', totalCustomers: 178, totalRevenue: 35400, joinDate: '2023-06-15', status: 'active', rating: 4.6 },
        { id: 3, businessName: 'مغسلة المستقبل', ownerName: 'محمد سالم', phone: '0114445555', location: 'الرياض - الربيع', totalCustomers: 156, totalRevenue: 31200, joinDate: '2023-07-20', status: 'active', rating: 4.7 }
      ];
      this.filteredMerchants = this.merchants;
      this.isLoading = false;
    }, 1000);
  }

  searchMerchants(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredMerchants = this.merchants;
    } else {
      this.filteredMerchants = this.merchants.filter(m =>
        m.businessName.includes(this.searchTerm) || m.ownerName.includes(this.searchTerm)
      );
    }
  }

  suspendMerchant(id: number): void {
    const merchant = this.merchants.find(m => m.id === id);
    if (merchant) {
      merchant.status = merchant.status === 'active' ? 'suspended' : 'active';
    }
  }
}
