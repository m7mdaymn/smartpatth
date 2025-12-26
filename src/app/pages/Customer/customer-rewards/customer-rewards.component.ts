import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  currentPoints: number;
  merchant: string;
  expiryDate: string;
  category: string;
  icon: string;
  discount?: number;
}

@Component({
  selector: 'app-customer-rewards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-rewards.component.html',
  styleUrls: ['./customer-rewards.component.css']
})
export class CustomerRewardsComponent implements OnInit {
  allRewards: Reward[] = [];
  filteredRewards: Reward[] = [];
  activeCategory = 'all';
  totalPoints = 1500;
  isLoading = false;
  categories = ['all', 'discount', 'free', 'cashback', 'voucher'];

  constructor() {}

  ngOnInit(): void {
    this.loadRewards();
  }

  loadRewards(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.allRewards = [
        {
          id: 1,
          name: 'غسلة مجانية',
          description: 'احصل على غسلة مجانية بعد 10 غسلات',
          pointsRequired: 1000,
          currentPoints: 850,
          merchant: 'مغسلة النور',
          expiryDate: '2024-03-15',
          category: 'free',
          icon: '🚗'
        },
        {
          id: 2,
          name: 'تخفيض 25%',
          description: 'تخفيض 25% على جميع الخدمات',
          pointsRequired: 500,
          currentPoints: 320,
          merchant: 'مغسلة الهدى',
          expiryDate: '2024-02-28',
          category: 'discount',
          discount: 25,
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
          category: 'voucher',
          icon: '🎫'
        },
        {
          id: 4,
          name: 'استرجاع 10% نقد',
          description: 'استرجاع 10% من قيمة الغسلة',
          pointsRequired: 600,
          currentPoints: 600,
          merchant: 'جميع المغسلات',
          expiryDate: '2024-03-20',
          category: 'cashback',
          icon: '💰'
        }
      ];
      this.filterRewards();
      this.isLoading = false;
    }, 1000);
  }

  filterRewards(): void {
    if (this.activeCategory === 'all') {
      this.filteredRewards = this.allRewards;
    } else {
      this.filteredRewards = this.allRewards.filter(r => r.category === this.activeCategory);
    }
  }

  setCategory(category: string): void {
    this.activeCategory = category;
    this.filterRewards();
  }

  redeemReward(reward: Reward): void {
    if (reward.currentPoints >= reward.pointsRequired) {
      if (confirm(`هل تريد استبدال ${reward.name}؟`)) {
        alert(`تم استبدال ${reward.name} بنجاح!`);
        reward.currentPoints -= reward.pointsRequired;
        this.totalPoints -= reward.pointsRequired;
      }
    }
  }

  getProgressPercentage(reward: Reward): number {
    return (reward.currentPoints / reward.pointsRequired) * 100;
  }
}
