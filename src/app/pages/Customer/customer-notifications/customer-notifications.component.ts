import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
  read: boolean;
  icon: string;
}

@Component({
  selector: 'app-customer-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-notifications.component.html',
  styleUrls: ['./customer-notifications.component.css']
})
export class CustomerNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.notifications = [
        {
          id: 1,
          title: 'غسلة مكتملة',
          message: 'تم إكمال غسلتك بنجاح في مغسلة النور',
          type: 'success',
          timestamp: '2024-01-15 14:30',
          read: false,
          icon: '✅'
        },
        {
          id: 2,
          title: 'تنبيه المكافأة',
          message: 'لديك 150 نقطة متبقية للحصول على مكافأة جديدة',
          type: 'info',
          timestamp: '2024-01-14 10:15',
          read: false,
          icon: '🏆'
        },
        {
          id: 3,
          title: 'انتهاء الصلاحية',
          message: 'بطاقة الولاء في مغسلة الهدى ستنتهي صلاحيتها بعد 5 أيام',
          type: 'warning',
          timestamp: '2024-01-13 09:45',
          read: true,
          icon: '⚠️'
        },
        {
          id: 4,
          title: 'عرض خاص',
          message: 'احصل على تخفيض 30% على التلميع في مغسلة النور',
          type: 'info',
          timestamp: '2024-01-12 16:20',
          read: true,
          icon: '🎉'
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clearAll(): void {
    this.notifications = [];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}
