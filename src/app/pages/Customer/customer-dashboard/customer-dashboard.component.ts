import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';

interface Wash {
  id: number;
  date: string;
  time: string;
  type: string;
  location: string;
  status: 'completed' | 'pending' | 'cancelled';
  price: number;
  carType: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  currentPoints: number;
  merchant: string;
  expiryDate: string;
  icon: string;
}

interface WalletTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
}

interface LoyaltyCard {
  merchant: string;
  washesCompleted: number;
  washesRequired: number;
  expiryDate: string;
  progress: number;
  qrCode: string;
  cardColor: string;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerAnimation', [
      transition(':enter', [
        query('.stat-card, .quick-action, .loyalty-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('0.8s 0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class CustomerDashboardComponent implements OnInit {
  user: any = {
    name: 'محمد أحمد',
    email: 'customer@example.com',
    phone: '0551234567',
    avatar: 'https://ui-avatars.com/api/?name=محمد+أحمد&background=3B82F6&color=fff&size=128'
  };

  stats = {
    totalWashes: 24,
    totalSpent: 1200,
    rewardsEarned: 1500,
    favoriteMerchant: 'مغسلة النور'
  };

  wallet = {
    balance: 450,
    currency: 'ريال'
  };

  recentWashes: Wash[] = [];
  availableRewards: Reward[] = [];
  walletTransactions: WalletTransaction[] = [];
  loyaltyCards: LoyaltyCard[] = [];
  quickActions = [
    { icon: '🚗', label: 'حجز غسلة جديدة', route: '/customer/washes', color: '#3B82F6' },
    { icon: '💳', label: 'إضافة رصيد', route: '/customer/wallet', color: '#10B981' },
    { icon: '🏆', label: 'المكافآت', route: '/customer/rewards', color: '#F59E0B' },
    { icon: '📱', label: 'QR Code', route: '/customer/profile', color: '#8B5CF6' }
  ];

  selectedCard: LoyaltyCard | null = null;
  showQRModal = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  loadUserData(): void {
    const user = this.authService.user();
    if (user) {
      this.user = {
        ...this.user,
        name: user.name || 'محمد أحمد',
        email: user.email,
        phone: user.phone || '0551234567'
      };
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      // Recent Washes
      this.recentWashes = [
        {
          id: 1,
          date: '2024-01-15',
          time: '14:30',
          type: 'غسلة كاملة',
          location: 'مغسلة النور - الرياض',
          status: 'completed',
          price: 50,
          carType: 'تويوتا كامري 2022'
        },
        {
          id: 2,
          date: '2024-01-14',
          time: '11:15',
          type: 'غسلة خارجية',
          location: 'مغسلة الهدى - الرياض',
          status: 'completed',
          price: 30,
          carType: 'تويوتا كامري 2022'
        },
        {
          id: 3,
          date: '2024-01-13',
          time: '16:45',
          type: 'تلميع',
          location: 'مغسلة النور - الرياض',
          status: 'pending',
          price: 120,
          carType: 'تويوتا كامري 2022'
        }
      ];

      // Available Rewards
      this.availableRewards = [
        {
          id: 1,
          name: 'غسلة مجانية',
          description: 'احصل على غسلة مجانية بعد 10 غسلات',
          pointsRequired: 1000,
          currentPoints: 850,
          merchant: 'مغسلة النور',
          expiryDate: '2024-03-15',
          icon: '🚗'
        },
        {
          id: 2,
          name: 'تخفيض 25%',
          description: 'تخفيض 25% على التلميع',
          pointsRequired: 500,
          currentPoints: 320,
          merchant: 'مغسلة الهدى',
          expiryDate: '2024-02-28',
          icon: '✨'
        },
        {
          id: 3,
          name: 'كوبون 50 ريال',
          description: 'كوبون بقيمة 50 ريال',
          pointsRequired: 800,
          currentPoints: 800,
          merchant: 'مغسلة المستقبل',
          expiryDate: '2024-04-10',
          icon: '🎫'
        }
      ];

      // Wallet Transactions
      this.walletTransactions = [
        {
          id: 1,
          date: '2024-01-15',
          description: 'إضافة رصيد عبر البطاقة',
          amount: 200,
          type: 'credit',
          balance: 650
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
          balance: 500
        }
      ];

      // Loyalty Cards
      this.loyaltyCards = [
        {
          merchant: 'مغسلة النور',
          washesCompleted: 8,
          washesRequired: 10,
          expiryDate: '2024-02-28',
          progress: 80,
          qrCode: 'DP-CUST-001-مغسلة النور',
          cardColor: '#3B82F6'
        },
        {
          merchant: 'مغسلة الهدى',
          washesCompleted: 5,
          washesRequired: 8,
          expiryDate: '2024-03-15',
          progress: 62.5,
          qrCode: 'DP-CUST-001-مغسلة الهدى',
          cardColor: '#10B981'
        },
        {
          merchant: 'مغسلة المستقبل',
          washesCompleted: 3,
          washesRequired: 6,
          expiryDate: '2024-04-01',
          progress: 50,
          qrCode: 'DP-CUST-001-مغسلة المستقبل',
          cardColor: '#8B5CF6'
        }
      ];

      this.selectedCard = this.loyaltyCards[0];
      this.isLoading = false;
    }, 1000);
  }

  showQRCode(card: LoyaltyCard): void {
    this.selectedCard = card;
    this.showQRModal = true;
  }

  closeQRModal(): void {
    this.showQRModal = false;
  }

  copyQRCode(): void {
    if (this.selectedCard) {
      navigator.clipboard.writeText(this.selectedCard.qrCode);
      // يمكن إضافة toast هنا
      alert('تم نسخ رمز QR إلى الحافظة');
    }
  }

  redeemReward(reward: Reward): void {
    if (reward.currentPoints >= reward.pointsRequired) {
      if (confirm(`هل تريد استبدال ${reward.name}؟`)) {
        // Simulate API call
        this.availableRewards = this.availableRewards.filter(r => r.id !== reward.id);
        alert(`تم استبدال ${reward.name} بنجاح!`);
      }
    } else {
      alert(`تحتاج ${reward.pointsRequired - reward.currentPoints} نقطة إضافية`);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}