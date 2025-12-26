import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RevenueData {
  date: string;
  totalRevenue: number;
  customerCount: number;
  merchantCount: number;
  transactionCount: number;
}

@Component({
  selector: 'app-system-revenue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-revenue.component.html',
  styleUrls: ['./system-revenue.component.css']
})
export class SystemRevenueComponent implements OnInit {
  revenueData: RevenueData[] = [];
  monthlyStats = {
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    monthlyGrowth: 0
  };
  isLoading = false;

  constructor() {}

  ngOnInit(): void {
    this.loadRevenueData();
  }

  loadRevenueData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.revenueData = [
        { date: '2024-01-01', totalRevenue: 12500, customerCount: 245, merchantCount: 68, transactionCount: 250 },
        { date: '2024-01-02', totalRevenue: 13200, customerCount: 248, merchantCount: 68, transactionCount: 264 },
        { date: '2024-01-03', totalRevenue: 11800, customerCount: 242, merchantCount: 68, transactionCount: 236 },
        { date: '2024-01-04', totalRevenue: 14500, customerCount: 256, merchantCount: 68, transactionCount: 290 },
        { date: '2024-01-05', totalRevenue: 13800, customerCount: 252, merchantCount: 68, transactionCount: 276 }
      ];

      this.monthlyStats = {
        totalRevenue: 65800,
        totalTransactions: 1316,
        avgTransactionValue: 50,
        monthlyGrowth: 18.5
      };

      this.isLoading = false;
    }, 1000);
  }

  getTotalRevenue(): number {
    return this.revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
  }
}
