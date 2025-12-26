import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ScanResult {
  qrCode: string;
  customerName: string;
  timestamp: string;
  serviceType: string;
  amount: number;
  status: 'success' | 'error';
}

@Component({
  selector: 'app-scan-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scan-qr.component.html',
  styleUrls: ['./scan-qr.component.css']
})
export class ScanQrComponent {
  qrInput = '';
  scanHistory: ScanResult[] = [];
  lastScanResult: ScanResult | null = null;
  isScanning = false;

  constructor() {
    this.loadScanHistory();
  }

  loadScanHistory(): void {
    this.scanHistory = [
      {
        qrCode: 'DP-CUST-001-مغسلة النور',
        customerName: 'أحمد محمد',
        timestamp: '2024-01-15 14:30',
        serviceType: 'غسلة كاملة',
        amount: 50,
        status: 'success'
      },
      {
        qrCode: 'DP-CUST-002-مغسلة النور',
        customerName: 'سعيد خالد',
        timestamp: '2024-01-15 13:15',
        serviceType: 'غسلة خارجية',
        amount: 30,
        status: 'success'
      }
    ];
  }

  scanQR(): void {
    if (!this.qrInput.trim()) return;

    this.isScanning = true;
    setTimeout(() => {
      this.lastScanResult = {
        qrCode: this.qrInput,
        customerName: 'عميل جديد',
        timestamp: new Date().toLocaleString('ar-SA'),
        serviceType: 'غسلة كاملة',
        amount: 50,
        status: 'success'
      };

      this.scanHistory.unshift(this.lastScanResult);
      this.qrInput = '';
      this.isScanning = false;
    }, 1000);
  }

  clearHistory(): void {
    this.scanHistory = [];
  }
}
