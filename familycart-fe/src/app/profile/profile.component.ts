import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../environments/environment';

export interface ProfileData {
  id: number;
  uuid: string;
  gender: string | null;
  email: string;
  is_admin: boolean;
  username: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  family_membership?: number;
}

export interface ProfileResponse {
  message?: string;
  payload?: ProfileData;
  status?: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-container">
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div class="logo-container">
              <img [src]="logoImageUrl" 
                   alt="FamilyCart Logo" 
                   class="logo-img">
              <h1 class="logo-text">FamilyCart</h1>
            </div>
            <nav class="nav" [class.active]="menuOpen">
              <a [routerLink]="['/']" class="nav-link">Home</a>
              <a [routerLink]="['/profile']" class="nav-link active">Profile</a>
              <div class="dropdown">
                <a href="#" class="nav-link dropdown-toggle" [class.active]="groceryListDropdownOpen" (click)="toggleGroceryListDropdown(); $event.preventDefault()">
                  GroceryList
                  <span class="dropdown-arrow">▼</span>
                </a>
                <ul class="dropdown-menu" [class.show]="groceryListDropdownOpen">
                  <li><a [routerLink]="['/create-grocery-list']" class="dropdown-item">Create New</a></li>
                  <li><a [routerLink]="['/grocery-lists']" class="dropdown-item">MyList</a></li>
                </ul>
              </div>
              <a [routerLink]="['/my-family']" class="nav-link">MyFamily</a>
              <a (click)="logout()" class="nav-link logout-link" href="javascript:void(0)">Logout</a>
            </nav>
            <button class="menu-toggle" (click)="toggleMenu()" aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <div class="container">
          <div class="profile-card">
            <h2>My Profile</h2>
        
        <div *ngIf="loading" class="loading-state">
          <p>Loading profile...</p>
        </div>

        <div *ngIf="!loading && profile" class="profile-form-container">
          <form (ngSubmit)="onUpdateProfile()" #profileForm="ngForm">
            <!-- Non-editable fields -->
            <div class="form-section">
              <h3 class="section-title">Account Information</h3>
              
              <div class="form-group readonly">
                <label for="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  [value]="profile.username"
                  readonly
                  class="readonly-input">
              </div>

              <div class="form-group readonly">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  [value]="profile.email"
                  readonly
                  class="readonly-input">
                <span class="verified-badge" *ngIf="profile.email_verified">✓ Verified</span>
              </div>
            </div>

            <!-- Editable fields -->
            <div class="form-section">
              <h3 class="section-title">Personal Information</h3>
              
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  [(ngModel)]="profile.first_name"
                  required
                  placeholder="Enter your first name"
                  [disabled]="updating">
              </div>

              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  [(ngModel)]="profile.last_name"
                  required
                  placeholder="Enter your last name"
                  [disabled]="updating">
              </div>

              <div class="form-group">
                <label for="gender">Gender</label>
                <select 
                  id="gender" 
                  name="gender" 
                  [(ngModel)]="profile.gender"
                  [disabled]="updating"
                  class="gender-select">
                  <option [value]="null">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="!profileForm.valid || updating">
                {{ updating ? 'Updating...' : 'Update Profile' }}
              </button>
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="goBack()"
                [disabled]="updating">
                Back
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="!loading && !profile && error" class="error-state">
          <p>{{ error }}</p>
          <button class="btn btn-primary" (click)="loadProfile()">Retry</button>
        </div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2025 FamilyCart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      position: relative;
      overflow-x: hidden;
    }

    // Header Styles (same as home and my-family)
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.2rem 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
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
      height: 45px;
      width: 45px;
      object-fit: contain;
      transition: all 0.3s ease;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .logo-text {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transition: all 0.3s ease;
    }

    .nav {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      position: relative;
      display: inline-block;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: white;
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }
      
      &:hover, &.active {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
        
        &::after {
          width: 80%;
        }
      }

      &.logout-link {
        color: #ffcccc;
        font-weight: 600;
        
        &:hover {
          color: #ff9999;
          background: rgba(255, 204, 204, 0.2);
          opacity: 1;
        }
      }
    }

    // Dropdown Styles
    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      
      &.active .dropdown-arrow {
        transform: rotate(180deg);
      }
      
      .dropdown-arrow {
        font-size: 10px;
        transition: transform 0.3s ease;
        display: inline-block;
      }
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      list-style: none;
      padding: 8px 0;
      margin: 8px 0 0 0;
      min-width: 180px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1000;
      
      &.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
    }

    .dropdown-item {
      display: block;
      padding: 10px 20px;
      color: #333;
      text-decoration: none;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f5f5f5;
        color: #667eea;
        transform: translateX(8px);
      }
    }

    .menu-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      
      span {
        width: 25px;
        height: 3px;
        background: white;
        border-radius: 3px;
        transition: all 0.3s ease;
      }
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .profile-card {
      background: white;
      padding: 50px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
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

    .profile-card h2 {
      margin-bottom: 32px;
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f0f0;
    }

    .form-group {
      margin-bottom: 24px;
      position: relative;

      &.readonly {
        opacity: 0.8;
      }
    }

    .form-group label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      color: #333;
      font-size: 15px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 16px 18px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 16px;
      box-sizing: border-box;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .readonly-input {
      background: #f5f5f5 !important;
      cursor: not-allowed;
      color: #666;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .form-group input:disabled,
    .form-group select:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .gender-select {
      cursor: pointer;
    }

    .verified-badge {
      display: inline-block;
      margin-left: 10px;
      padding: 4px 12px;
      background: #4caf50;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 32px;
    }

    .btn {
      flex: 1;
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

    .btn-secondary {
      background: #6c757d;
      color: white;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    // Footer
    .footer {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      color: white;
      text-align: center;
      padding: 2.5rem 0;
      margin-top: auto;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      }
    }

    // Responsive Design
    @media (max-width: 767px) {
      .menu-toggle {
        display: flex;
      }

      .nav {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        flex-direction: column;
        padding: 1rem 0;
        gap: 0;
        display: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        
        &.active {
          display: flex;
        }
      }

      .nav-link {
        width: 100%;
        padding: 1rem 20px;
        border-radius: 0;
        
        &::after {
          display: none;
        }
      }

      .dropdown {
        width: 100%;
      }

      .dropdown-menu {
        position: static;
        width: 100%;
        margin-top: 8px;
        opacity: 1;
        visibility: visible;
        transform: none;
        box-shadow: none;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        display: none;

        &.show {
          display: block;
        }

        .dropdown-item {
          color: white;
          
          &:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            transform: translateX(8px);
          }
        }
      }

      .header-content {
        flex-wrap: wrap;
      }

      .profile-card {
        padding: 40px 30px;
        border-radius: 16px;
        margin: 0 20px;
      }

      .profile-card h2 {
        font-size: 26px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: ProfileData | null = null;
  originalProfile: ProfileData | null = null;
  loading: boolean = false;
  updating: boolean = false;
  error: string = '';
  logoImageUrl = environment.logoImageUrl;
  menuOpen = false;
  groceryListDropdownOpen = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.showError('Please login to view your profile.');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.get<ProfileResponse>('user/profile', null, token).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.payload) {
          this.profile = { ...response.payload };
          // Store original profile for comparison
          this.originalProfile = JSON.parse(JSON.stringify(response.payload));
        } else {
          this.error = 'No profile data received.';
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to load profile. Please try again.';
        this.error = errorMessage;
        this.notificationService.showError(errorMessage);
        
        if (error.status === 401) {
          // Token expired or invalid
          this.authService.removeToken();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  onUpdateProfile(): void {
    if (!this.profile || !this.originalProfile) return;

    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.showError('Please login to update your profile.');
      this.router.navigate(['/login']);
      return;
    }

    // Compare current values with original to find changed fields
    const changedFields: { [key: string]: string | null } = {};

    if (this.profile.first_name !== this.originalProfile.first_name) {
      changedFields['first_name'] = this.profile.first_name;
    }

    if (this.profile.last_name !== this.originalProfile.last_name) {
      changedFields['last_name'] = this.profile.last_name;
    }

    // Handle gender comparison (null can be different from empty string)
    const currentGender = this.profile.gender || null;
    const originalGender = this.originalProfile.gender || null;
    if (currentGender !== originalGender) {
      changedFields['gender'] = currentGender;
    }

    // Check if there are any changes
    if (Object.keys(changedFields).length === 0) {
      this.notificationService.showInfo('No changes detected.');
      return;
    }

    this.updating = true;

    // Create FormData with only changed fields
    const formData = new FormData();
    Object.keys(changedFields).forEach(key => {
      const value = changedFields[key];
      // For null values, send empty string (FormData doesn't support null)
      // API will handle empty string appropriately
      formData.append(key, value === null ? '' : String(value));
    });

    // Use PATCH with FormData
    this.apiService.patchFormData<ProfileResponse>('user/profile', formData, token).subscribe({
      next: (response) => {
        this.updating = false;
        const successMessage = response.message || 'Profile updated successfully!';
        this.notificationService.showSuccess(successMessage);
        
        // Update localStorage with updated profile data
        if (response.payload) {
          this.updateLocalStorage(response.payload);
        }
        
        // Reload profile to get updated data
        this.loadProfile();
      },
      error: (error) => {
        this.updating = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to update profile. Please try again.';
        this.notificationService.showError(errorMessage);
        
        if (error.status === 401) {
          this.authService.removeToken();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  updateLocalStorage(profile: ProfileData): void {
    // Update localStorage with profile data
    if (profile.first_name) {
      localStorage.setItem('first_name', profile.first_name);
    }
    if (profile.last_name) {
      localStorage.setItem('last_name', profile.last_name);
    }
    if (profile.gender !== null && profile.gender !== undefined) {
      localStorage.setItem('gender', profile.gender);
    } else {
      localStorage.removeItem('gender');
    }
    localStorage.setItem('email_verified', String(profile.email_verified));
    if (profile.username) {
      localStorage.setItem('username', profile.username);
    }
    if (profile.email) {
      localStorage.setItem('email', profile.email);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    // Close dropdown when menu toggles
    this.groceryListDropdownOpen = false;
  }

  toggleGroceryListDropdown(): void {
    this.groceryListDropdownOpen = !this.groceryListDropdownOpen;
  }

  logout(): void {
    this.authService.removeToken();
    this.notificationService.showSuccess('Logged out successfully.');
    // Close mobile menu if open
    this.menuOpen = false;
    this.groceryListDropdownOpen = false;
    // Navigate to home page
    this.router.navigate(['/']);
  }
}

