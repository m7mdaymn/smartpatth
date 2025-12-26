import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-merchant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './merchant-dashboard.component.html',
  styleUrls: ['./merchant-dashboard.component.css']
})
export class MerchantDashboardComponent implements OnInit {
  merchantData = {
    businessName: 'مغسلة النخبة للسيارات',
    totalCustomers: 245,
    totalRevenue: 48500,
    washesToday: 18,
    activeLoyaltyCards: 189,
    recentScans: [
      { customer: 'أحمد محمد', time: '10:30 ص', status: 'ناجح' },
      { customer: 'سعيد خالد', time: '09:15 ص', status: 'ناجح' },
      { customer: 'فهد علي', time: '08:45 ص', status: 'ناجح' }
    ],
    quickStats: {
      monthlyGrowth: 15.5,
      customerRetention: 87.3,
      avgWashValue: 45.75,
      rewardsRedeemed: 23
    }
  };

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateTo(route: string): void {
    this.router.navigate([`/merchant/${route}`]);
  }

  scanQR(): void {
    this.router.navigate(['/merchant/scan-qr']);
  }
}