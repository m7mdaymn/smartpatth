import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface MerchantProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  logo?: string;
  plan: 'Basic' | 'Pro';
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
}

export interface MerchantCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  carPhoto?: string;
  joinDate: string;
  totalWashes: number;
  status: 'active' | 'inactive';
  lastWash?: string;
}

export interface MerchantDashboardStats {
  totalCustomers: number;
  totalWashes: number;
  totalRevenue: number;
  activeSubscription: string;
  subscriptionExpiry?: string;
}

export interface QRScanResult {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  qrCode: string;
  lastWash?: string;
  totalWashes: number;
}

export interface MerchantSettings {
  id: string;
  merchantId: string;
  notificationWelcomeTemplate: string;
  notificationRemainingTemplate: string;
  notificationRewardTemplate: string;
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  customBusinessTagline?: string;
  customRewardMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MerchantService {
  constructor(private apiService: ApiService) {}

  /**
   * Get merchant profile
   */
  getProfile(merchantId: string): Observable<ApiResponse<MerchantProfile>> {
    return this.apiService.get(`Merchant/${merchantId}/profile`);
  }

  /**
   * Update merchant profile
   */
  updateProfile(merchantId: string, data: Partial<MerchantProfile>): Observable<ApiResponse<MerchantProfile>> {
    return this.apiService.put(`Merchant/${merchantId}/profile`, data);
  }

  /**
   * Get merchant dashboard
   */
  getDashboard(merchantId: string): Observable<ApiResponse<MerchantDashboardStats>> {
    return this.apiService.get(`Merchant/${merchantId}/dashboard`);
  }

  /**
   * Get all customers of merchant
   */
  getCustomers(merchantId: string): Observable<ApiResponse<MerchantCustomer[]>> {
    return this.apiService.get(`Merchant/${merchantId}/customers`);
  }

  /**
   * Get specific customer details
   */
  getCustomer(merchantId: string, customerId: string): Observable<ApiResponse<MerchantCustomer>> {
    return this.apiService.get(`Merchant/${merchantId}/customers/${customerId}`);
  }

  /**
   * Scan QR code - get customer details
   */
  scanQRCode(merchantId: string, qrCode: string): Observable<ApiResponse<QRScanResult>> {
    return this.apiService.post(`Merchant/${merchantId}/scan-qr`, { 
      customerQRCode: qrCode,
      merchantId: merchantId,
      amount: 0
    });
  }

  /**
   * Record wash for customer
   */
  recordWash(merchantId: string, customerId: string, amount?: number): Observable<ApiResponse<any>> {
    return this.apiService.post(`Merchant/${merchantId}/customers/${customerId}/wash`, {
      amount
    });
  }

  /**
   * Get merchant settings
   */
  getSettings(merchantId: string): Observable<ApiResponse<MerchantSettings>> {
    return this.apiService.get(`Merchant/${merchantId}/settings`);
  }

  /**
   * Update merchant settings
   */
  updateSettings(merchantId: string, settings: Partial<MerchantSettings>): Observable<ApiResponse<MerchantSettings>> {
    return this.apiService.put(`Merchant/${merchantId}/settings`, settings);
  }

  /**
   * Change subscription plan
   */
  changePlan(merchantId: string, newPlan: 'Basic' | 'Pro'): Observable<ApiResponse<any>> {
    return this.apiService.post(`Merchant/${merchantId}/change-plan`, { newPlan });
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(merchantId: string): Observable<ApiResponse<any>> {
    return this.apiService.post(`Merchant/${merchantId}/cancel-subscription`, {});
  }

  /**
   * Get revenue analytics
   */
  getAnalytics(merchantId: string, startDate?: string, endDate?: string): Observable<ApiResponse<any>> {
    let endpoint = `Merchant/${merchantId}/analytics`;
    if (startDate && endDate) {
      endpoint += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(endpoint);
  }

  /**
   * Change password
   */
  changePassword(merchantId: string, currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.apiService.put(`Merchant/${merchantId}/password`, {
      currentPassword,
      newPassword
    });
  }
}
