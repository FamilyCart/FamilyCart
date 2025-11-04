import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { FamilyResponse } from '../models/auth.models';

@Component({
  selector: 'app-family-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="family-selection-container">
      <div class="family-selection-card">
        <h2>Family Setup</h2>
        <p class="subtitle">Choose to join an existing family or create a new one</p>
        
        <div class="options">
          <div class="option-tabs">
            <button 
              class="tab-btn" 
              [class.active]="selectedOption === 'join'"
              (click)="selectOption('join')">
              Join Family
            </button>
            <button 
              class="tab-btn" 
              [class.active]="selectedOption === 'create'"
              (click)="selectOption('create')">
              Create Family
            </button>
          </div>

          <div class="option-content">
            <!-- Join Family Form -->
            <form *ngIf="selectedOption === 'join'" (ngSubmit)="onJoinFamily()" #joinForm="ngForm" class="family-form">
              <div class="form-icon">🔗</div>
              <div class="form-group">
                <label for="familyCode">
                  <span class="label-icon">📝</span>
                  Family Code (6 characters)
                </label>
                <input 
                  type="text" 
                  id="familyCode" 
                  name="familyCode" 
                  [(ngModel)]="familyCode" 
                  required 
                  pattern="[A-Za-z0-9]{6}"
                  maxlength="6"
                  placeholder="Enter 6-character code"
                  [disabled]="loading"
                  class="code-input">
                <p class="input-hint">Ask your family admin for the 6-character code</p>
              </div>
              <button 
                type="submit" 
                class="btn btn-primary btn-join" 
                [disabled]="!joinForm.valid || loading">
                <span *ngIf="!loading">👥 Join Family</span>
                <span *ngIf="loading">⏳ Joining...</span>
              </button>
            </form>

            <!-- Create Family Form -->
            <form *ngIf="selectedOption === 'create'" (ngSubmit)="onCreateFamily()" #createForm="ngForm" class="family-form">
              <div class="form-icon">✨</div>
              <div class="form-group">
                <label for="familyName">
                  <span class="label-icon">🏠</span>
                  Family Name
                </label>
                <input 
                  type="text" 
                  id="familyName" 
                  name="familyName" 
                  [(ngModel)]="familyName" 
                  required
                  placeholder="Enter a memorable family name"
                  [disabled]="loading">
                <p class="input-hint">Choose a name that represents your family</p>
              </div>
              <button 
                type="submit" 
                class="btn btn-primary btn-create" 
                [disabled]="!createForm.valid || loading">
                <span *ngIf="!loading">✨ Create Family</span>
                <span *ngIf="loading">⏳ Creating...</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .family-selection-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
    }

    .family-selection-container::before {
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

    .family-selection-card {
      background: white;
      padding: 50px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 550px;
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

    .family-selection-card h2 {
      margin-bottom: 8px;
      text-align: center;
      color: #333;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 32px;
      font-size: 15px;
      line-height: 1.5;
    }

    .options {
      margin-top: 8px;
    }

    .option-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      background: #f8f9fa;
      padding: 6px;
      border-radius: 12px;
    }

    .tab-btn {
      flex: 1;
      padding: 14px 20px;
      border: none;
      background: transparent;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      color: #666;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }

    .tab-btn:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .tab-btn.active {
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transform: translateY(-2px);
    }

    .option-content {
      min-height: 200px;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .family-form {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .form-icon {
      font-size: 64px;
      margin-bottom: 24px;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .form-group {
      margin-bottom: 24px;
      width: 100%;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-weight: 600;
      color: #333;
      font-size: 15px;
    }

    .label-icon {
      font-size: 20px;
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

    .code-input {
      text-transform: uppercase;
      letter-spacing: 6px;
      font-weight: 700;
      text-align: center;
      font-size: 20px;
      padding: 18px;
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

    .input-hint {
      margin-top: 8px;
      font-size: 13px;
      color: #888;
      font-style: italic;
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-join {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .btn-create {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .btn-create:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Mobile responsive */
    @media (max-width: 600px) {
      .family-selection-card {
        padding: 30px 24px;
        border-radius: 16px;
      }

      .family-selection-card h2 {
        font-size: 26px;
      }

      .form-icon {
        font-size: 48px;
      }

      .code-input {
        letter-spacing: 4px;
        font-size: 18px;
      }
    }
  `]
})
export class FamilySelectionComponent implements OnInit {
  selectedOption: 'join' | 'create' = 'join';
  familyCode: string = '';
  familyName: string = '';
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      // If no token, might need to get it from signup response or redirect
      // For now, we'll assume token should be available after signup
      const email = sessionStorage.getItem('signup_email');
      if (!email) {
        this.notificationService.showError('Please sign up first.');
        this.router.navigate(['/signup']);
      }
    }
  }

  selectOption(option: 'join' | 'create'): void {
    this.selectedOption = option;
  }

  onJoinFamily(): void {
    if (!this.familyCode || this.familyCode.length !== 6) return;

    this.loading = true;
    const token = this.authService.getToken();
    const formData = new FormData();
    formData.append('family_code', this.familyCode.toUpperCase());

    this.apiService.postFormData<FamilyResponse>('family/join', formData, token || undefined).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.showSuccess('Family joined successfully.');
        sessionStorage.removeItem('signup_email');
        // Redirect to home or dashboard
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        // Check for payload message first, then message, then detail
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to join family. Please check the code and try again.';
        this.notificationService.showError(errorMessage);
      }
    });
  }

  onCreateFamily(): void {
    if (!this.familyName) return;

    this.loading = true;
    const token = this.authService.getToken();
    const formData = new FormData();
    formData.append('family_name', this.familyName);

    this.apiService.postFormData<FamilyResponse>('family/join', formData, token || undefined).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.showSuccess('Family created successfully.');
        sessionStorage.removeItem('signup_email');
        // Redirect to home or dashboard
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.message || error.error?.detail || 'Failed to create family. Please try again.';
        this.notificationService.showError(errorMessage);
      }
    });
  }
}

