import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import { LoginRequest, LoginResponse } from '../models/auth.models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo-container">
          <img [src]="logoImageUrl" 
               alt="FamilyCart Logo" 
               class="logo-img">
          <h1 class="logo-text">FamilyCart</h1>
        </div>
        <h2>Login</h2>
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="email" 
              required 
              email
              placeholder="Enter your email"
              [disabled]="loading">
          </div>
          <button 
            type="submit" 
            class="btn btn-primary" 
            [disabled]="!loginForm.valid || loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(-30px, -30px) rotate(180deg); }
    }

    .login-card {
      background: white;
      padding: 50px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 450px;
      position: relative;
      z-index: 1;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
      cursor: pointer;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
        
        .logo-img {
          transform: rotate(5deg) scale(1.1);
        }
      }
    }

    .logo-img {
      height: 50px;
      width: 50px;
      object-fit: contain;
      transition: all 0.3s ease;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .logo-text {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transition: all 0.3s ease;
    }

    .login-card h2 {
      margin-bottom: 32px;
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      color: #333;
      font-size: 15px;
    }

    .form-group input {
      width: 100%;
      padding: 16px 18px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 16px;
      box-sizing: border-box;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .form-group input:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .btn {
      width: 100%;
      padding: 16px 24px;
      border: none;
      border-radius: 12px;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    @media (max-width: 600px) {
      .login-card {
        padding: 40px 30px;
        border-radius: 16px;
      }

      .login-card h2 {
        font-size: 26px;
      }

      .logo-img {
        height: 40px;
        width: 40px;
      }

      .logo-text {
        font-size: 1.4rem;
      }

      .logo-container {
        gap: 8px;
        margin-bottom: 20px;
      }
    }
  `]
})
export class LoginComponent {
  email: string = '';
  loading: boolean = false;
  logoImageUrl = environment.logoImageUrl;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onLogin(): void {
    if (!this.email) return;

    this.loading = true;
    const loginData: LoginRequest = { email: this.email };

    this.apiService.post<LoginResponse>('user/login', loginData).subscribe({
      next: (response) => {
        this.loading = false;
        // Store email in sessionStorage to use in OTP page
        sessionStorage.setItem('login_email', this.email);
        this.router.navigate(['/otp']);
      },
      error: (error) => {
        this.loading = false;
        // Check for payload message first, then message, then detail
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Login failed. Please try again.';
        this.notificationService.showError(errorMessage);
      }
    });
  }
}

