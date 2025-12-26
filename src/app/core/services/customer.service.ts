import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  qrCode: string;
  walletBalance: number;
  loyaltyCards: LoyaltyCard[];
  washes: WashHistory[];
  notifications: Notification[];
}

export interface LoyaltyCard {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantLogo?: string;
  carImage?: string;
  washesRemaining: number;
  totalWashes: number;
  expiresAt: string;
  progress: number;
  isActive: boolean;
}

export interface WashHistory {
  id: string;
  merchantName: string;
  merchantLogo?: string;
  date: string;
  time: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  rating?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promotion';
  date: string;
  read: boolean;
  icon: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'free_wash' | 'discount' | 'upgrade';
  value: number;
  expiresAt: string;
  status: 'available' | 'claimed' | 'expired';
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private profile = signal<CustomerProfile | null>(null);
  private washes = signal<WashHistory[]>([]);
  private notifications = signal<Notification[]>([]);
  private rewards = signal<Reward[]>([]);

  readonly customerProfile = computed(() => this.profile());
  readonly washHistory = computed(() => this.washes());
  readonly customerNotifications = computed(() => this.notifications());
  readonly customerRewards = computed(() => this.rewards());

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private authService: AuthService
  ) {
    // Load demo data on initialization
    this.loadDemoData();
  }

  // Demo Data (Replace with real API calls)
  private loadDemoData(): void {
    // Demo Profile
    const demoProfile: CustomerProfile = {
      id: 'cust_001',
      name: 'محمد أحمد',
      email: 'mohamed@example.com',
      phone: '0551234567',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed',
      qrCode: 'DP-CUST-001-2024',
      walletBalance: 250,
      loyaltyCards: [
        {
          id: 'card_001',
          merchantId: 'merch_001',
          merchantName: 'مغسلة النور',
          merchantLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Nour',
          carImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=Car1',
          washesRemaining: 3,
          totalWashes: 5,
          expiresAt: '2024-03-15',
          progress: 40,
          isActive: true
        },
        {
          id: 'card_002',
          merchantId: 'merch_002',
          merchantName: 'مغسلة الأصالة',
          merchantLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Asala',
          carImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=Car2',
          washesRemaining: 8,
          totalWashes: 10,
          expiresAt: '2024-04-20',
          progress: 20,
          isActive: true
        }
      ],
      washes: [
        {
          id: 'wash_001',
          merchantName: 'مغسلة النور',
          merchantLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Nour',
          date: '2024-01-15',
          time: '10:30 ص',
          amount: 50,
          status: 'completed',
          rating: 5
        },
        {
          id: 'wash_002',
          merchantName: 'مغسلة الأصالة',
          merchantLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Asala',
          date: '2024-01-10',
          time: '03:45 م',
          amount: 60,
          status: 'completed',
          rating: 4
        }
      ],
      notifications: [
        {
          id: 'notif_001',
          title: 'مغسلة النور',
          message: 'عرض خاص: احصل على غسلة مجانية بعد 3 زيارات!',
          type: 'promotion',
          date: '2024-01-14',
          read: false,
          icon: '🎁'
        },
        {
          id: 'notif_002',
          title: 'تذكير',
          message: 'باقي لك غسلتين للحصول على مكافأة مجانية في مغسلة النور',
          type: 'info',
          date: '2024-01-13',
          read: false,
          icon: '⏰'
        }
      ]
    };

    // Demo Rewards
    const demoRewards: Reward[] = [
      {
        id: 'reward_001',
        title: 'غسلة مجانية',
        description: 'احصل على غسلة مجانية بعد إكمال 5 زيارات',
        type: 'free_wash',
        value: 100,
        expiresAt: '2024-02-28',
        status: 'available'
      },
      {
        id: 'reward_002',
        title: 'خصم 20%',
        description: 'خصم 20% على خدمة التلميع',
        type: 'discount',
        value: 20,
        expiresAt: '2024-01-31',
        status: 'available'
      }
    ];

    this.profile.set(demoProfile);
    this.washes.set(demoProfile.washes);
    this.notifications.set(demoProfile.notifications);
    this.rewards.set(demoRewards);
  }

  // Real API Methods
  getCustomerProfile(): Observable<CustomerProfile> {
    const userId = this.authService.user()?.id;
    
    if (!userId) {
      return of(this.profile()!);
    }

    return this.http.get<CustomerProfile>(`${environment.apiUrl}/Customer/profile/${userId}`)
      .pipe(
        tap(profile => this.profile.set(profile)),
        catchError(error => {
          this.toast.showError('فشل في تحميل بيانات الملف الشخصي');
          return of(this.profile()!); // Return demo data on error
        })
      );
  }

  getWashHistory(): Observable<WashHistory[]> {
    const userId = this.authService.user()?.id;
    
    if (!userId) {
      return of(this.washes());
    }

    return this.http.get<WashHistory[]>(`${environment.apiUrl}/Customer/washes/${userId}`)
      .pipe(
        tap(washes => this.washes.set(washes)),
        catchError(error => {
          this.toast.showError('فشل في تحميل سجل الغسلات');
          return of(this.washes());
        })
      );
  }

  getNotifications(): Observable<Notification[]> {
    const userId = this.authService.user()?.id;
    
    if (!userId) {
      return of(this.notifications());
    }

    return this.http.get<Notification[]>(`${environment.apiUrl}/Customer/notifications/${userId}`)
      .pipe(
        tap(notifications => this.notifications.set(notifications)),
        catchError(error => {
          this.toast.showError('فشل في تحميل الإشعارات');
          return of(this.notifications());
        })
      );
  }

  getRewards(): Observable<Reward[]> {
    const userId = this.authService.user()?.id;
    
    if (!userId) {
      return of(this.rewards());
    }

    return this.http.get<Reward[]>(`${environment.apiUrl}/Customer/rewards/${userId}`)
      .pipe(
        tap(rewards => this.rewards.set(rewards)),
        catchError(error => {
          this.toast.showError('فشل في تحميل المكافآت');
          return of(this.rewards());
        })
      );
  }

  purchasePass(passData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Customer/purchase-pass`, passData)
      .pipe(
        tap(() => {
          this.toast.showSuccess('تم شراء الباقة بنجاح');
        }),
        catchError(error => {
          this.toast.showError('فشل في شراء الباقة');
          return of(null);
        })
      );
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Customer/notifications/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          this.toast.showSuccess('تم تحديث الإشعار');
          this.notifications.update(notifs =>
            notifs.map(n => n.id === notificationId ? { ...n, read: true } : n)
          );
        }),
        catchError(error => {
          this.toast.showError('فشل في تحديث الإشعار');
          return of(null);
        })
      );
  }

  claimReward(rewardId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Customer/rewards/${rewardId}/claim`, {})
      .pipe(
        tap(() => {
          this.toast.showSuccess('تم استلام المكافأة بنجاح');
          this.rewards.update(rewards =>
            rewards.map(r => r.id === rewardId ? { ...r, status: 'claimed' } : r)
          );
        }),
        catchError(error => {
          this.toast.showError('فشل في استلام المكافأة');
          return of(null);
        })
      );
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Customer/profile`, profileData)
      .pipe(
        tap(() => {
          this.toast.showSuccess('تم تحديث الملف الشخصي بنجاح');
          this.getCustomerProfile().subscribe();
        }),
        catchError(error => {
          this.toast.showError('فشل في تحديث الملف الشخصي');
          return of(null);
        })
      );
  }

  addFunds(amount: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Customer/wallet/add-funds`, { amount })
      .pipe(
        tap(() => {
          this.toast.showSuccess(`تم إضافة ${amount} ريال إلى المحفظة`);
          if (this.profile()) {
            this.profile.set({
              ...this.profile()!,
              walletBalance: this.profile()!.walletBalance + amount
            });
          }
        }),
        catchError(error => {
          this.toast.showError('فشل في إضافة الرصيد');
          return of(null);
        })
      );
  }

  // Demo Methods
  addDemoWash(wash: WashHistory): void {
    this.washes.update(washes => [wash, ...washes]);
  }

  addDemoNotification(notification: Notification): void {
    this.notifications.update(notifs => [notification, ...notifs]);
  }
}