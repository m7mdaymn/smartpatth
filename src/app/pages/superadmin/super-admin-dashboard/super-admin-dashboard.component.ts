import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css']
})
export class SuperAdminDashboardComponent implements OnInit {
  systemData = {
    totalCustomers: 1245,
    totalMerchants: 68,
    totalRevenue: 245800,
    activeWashes: 42,
    stats: {
      monthlyGrowth: 23.5,
      systemUptime: 99.8,
      avgTransactionValue: 47.50,
      totalTransactions: 5234
    }
  };

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateTo(route: string): void {
    this.router.navigate([`/super-admin/${route}`]);
  }
}
