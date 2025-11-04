import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification" class="notification" [class.success]="notification.type === 'success'" 
         [class.error]="notification.type === 'error'" [class.info]="notification.type === 'info'">
      <span class="notification-message">{{ notification.message }}</span>
      <button class="notification-close" (click)="close()">&times;</button>
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 10000;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification.success {
      background-color: #4caf50;
      color: white;
    }

    .notification.error {
      background-color: #f44336;
      color: white;
    }

    .notification.info {
      background-color: #2196f3;
      color: white;
    }

    .notification-message {
      flex: 1;
    }

    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .notification-close:hover {
      opacity: 0.8;
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: Notification | null = null;
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(
      notification => this.notification = notification
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  close(): void {
    this.notificationService.clear();
  }
}

