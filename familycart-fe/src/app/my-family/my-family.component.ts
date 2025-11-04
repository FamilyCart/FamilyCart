import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { FamilyListResponse, FamilyMember } from '../models/family.models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-my-family',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="family-container">
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
              <a [routerLink]="['/profile']" class="nav-link">Profile</a>
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
              <a [routerLink]="['/my-family']" class="nav-link active">MyFamily</a>
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
          <div class="page-header">
            <h2 class="page-title">My Families</h2>
            <p class="page-subtitle">View all families you are part of</p>
          </div>

          <div *ngIf="loading" class="loading-state">
            <p>Loading families...</p>
          </div>

          <div *ngIf="!loading && families && families.length > 0" class="families-list">
            <div *ngFor="let family of families; let i = index" class="family-card" [style.animation-delay]="(i * 0.1) + 's'">
              <div class="card-decoration" [class.owner-bg]="family.role === 'owner'" [class.member-bg]="family.role === 'member'"></div>
              <div class="family-card-content">
                <div class="family-card-header">
                  <div class="family-icon-wrapper" [class.owner-icon]="family.role === 'owner'" [class.member-icon]="family.role === 'member'">
                    <span class="family-icon">🏠</span>
                  </div>
                  <div class="family-title-section">
                    <h3 class="family-name">{{ family.family_name }}</h3>
                    <span class="role-badge" [class.owner]="family.role === 'owner'" [class.member]="family.role === 'member'">
                      {{ family.role === 'owner' ? '👑 Owner' : '👤 Member' }}
                    </span>
                  </div>
                </div>
                <div class="family-card-body">
                  <div class="info-item">
                    <div class="info-icon">📋</div>
                    <div class="info-content">
                      <span class="info-label">Family Name</span>
                      <span class="info-value">{{ family.family_name }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-icon">👤</div>
                    <div class="info-content">
                      <span class="info-label">Your Role</span>
                      <span class="info-value">{{ family.role | titlecase }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-icon">📅</div>
                    <div class="info-content">
                      <span class="info-label">Member Since</span>
                      <span class="info-value">{{ formatDate(family.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!loading && families && families.length === 0" class="empty-state">
            <div class="empty-icon">👨‍👩‍👧‍👦</div>
            <p>You are not part of any family yet.</p>
            <a [routerLink]="['/family-selection']" class="btn btn-primary">Join or Create Family</a>
          </div>

          <div *ngIf="!loading && error" class="error-state">
            <p>{{ error }}</p>
            <button class="btn btn-primary" (click)="loadFamilies()">Retry</button>
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
    .family-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      position: relative;
      overflow-x: hidden;
    }

    // Header Styles (same as home)
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

      li {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .dropdown-item {
        display: block;
        padding: 10px 20px;
        color: #333;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
        border-radius: 4px;
        margin: 0 8px;

        &:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateX(4px);
        }
      }
    }

    .menu-toggle {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      
      span {
        width: 25px;
        height: 3px;
        background: white;
        margin: 3px 0;
        transition: 0.3s;
      }
    }

    // Main Content
    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
      animation: slideUp 0.6s ease-out;
      position: relative;
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

    .page-title {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
      position: relative;
    }

    .page-subtitle {
      font-size: 1.25rem;
      color: #666;
      font-weight: 500;
    }

    .loading-state {
      text-align: center;
      padding: 80px 20px;
      color: #666;
      
      p {
        font-size: 1.25rem;
        font-weight: 500;
      }
    }

    .error-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      margin: 0 auto;
      
      p {
        color: #e74c3c;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 80px 40px;
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      margin: 0 auto;
      animation: slideUp 0.6s ease-out;
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: 1.5rem;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-15px);
      }
    }

    .families-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .family-card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      animation: slideUp 0.6s ease-out both;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(102, 126, 234, 0.1);
      
      &:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
        
        .card-decoration {
          transform: scale(1.1);
        }
        
        .family-icon {
          transform: scale(1.2) rotate(10deg);
        }
      }
    }

    .card-decoration {
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      opacity: 0.1;
      transform: translate(30%, -30%);
      transition: transform 0.4s ease;
      z-index: 0;
      
      &.owner-bg {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      }
      
      &.member-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }

    .family-card-content {
      position: relative;
      z-index: 1;
      padding: 2.5rem;
    }

    .family-card-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .family-icon-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      
      &.owner-icon {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      }
      
      &.member-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      &:hover {
        transform: rotate(5deg);
      }
    }

    .family-icon {
      font-size: 2.5rem;
      transition: all 0.3s ease;
    }

    .family-title-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .family-name {
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
      margin: 0;
      line-height: 1.3;
    }

    .role-badge {
      padding: 8px 20px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 13px;
      display: inline-block;
      width: fit-content;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      
      &.owner {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
        }
      }
      
      &.member {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
      }
    }

    .family-card-body {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1rem;
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
      border-radius: 16px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      
      &:hover {
        background: linear-gradient(135deg, #f0f4ff 0%, #f8f9ff 100%);
        border-color: rgba(102, 126, 234, 0.2);
        transform: translateX(8px);
      }
    }

    .info-icon {
      font-size: 1.75rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-weight: 600;
      color: #888;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      
      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
      }
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
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
        background-size: 200% 100%;
        animation: gradientShift 3s ease infinite;
      }
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    // Responsive Design
    @media (min-width: 768px) {
      .families-list {
        grid-template-columns: repeat(2, 1fr);
        gap: 2.5rem;
      }

      .page-title {
        font-size: 3.5rem;
      }
    }

    @media (min-width: 992px) {
      .families-list {
        grid-template-columns: repeat(2, 1fr);
        gap: 3rem;
      }

      .family-card-content {
        padding: 3rem;
      }
    }

    @media (max-width: 767px) {
      .menu-toggle {
        display: flex;
      }
      
      .nav {
        display: none;
        width: 100%;
        flex-direction: column;
        gap: 1rem;
        padding-top: 1rem;
        
        &.active {
          display: flex;
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

      .page-title {
        font-size: 2rem;
      }

      .page-subtitle {
        font-size: 1rem;
      }

      .family-card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .family-icon-wrapper {
        width: 60px;
        height: 60px;
      }

      .family-icon {
        font-size: 2rem;
      }

      .family-name {
        font-size: 1.5rem;
      }

      .family-card-content {
        padding: 2rem 1.5rem;
      }

      .info-item {
        padding: 0.875rem;
        gap: 1rem;
      }

      .info-icon {
        width: 45px;
        height: 45px;
        font-size: 1.5rem;
      }
    }
  `]
})
export class MyFamilyComponent implements OnInit {
  families: FamilyMember[] = [];
  loading: boolean = false;
  error: string = '';
  menuOpen = false;
  groceryListDropdownOpen = false;
  logoImageUrl = environment.logoImageUrl;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadFamilies();
  }

  loadFamilies(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.showError('Please login to view your families.');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.get<FamilyListResponse>('family/list', null, token).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.payload && Array.isArray(response.payload)) {
          this.families = response.payload;
        } else {
          this.families = [];
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to load families. Please try again.';
        this.error = errorMessage;
        this.notificationService.showError(errorMessage);
        
        if (error.status === 401) {
          this.authService.removeToken();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.groceryListDropdownOpen = false;
  }

  toggleGroceryListDropdown(): void {
    this.groceryListDropdownOpen = !this.groceryListDropdownOpen;
  }

  logout(): void {
    this.authService.removeToken();
    this.notificationService.showSuccess('Logged out successfully.');
    this.menuOpen = false;
    this.groceryListDropdownOpen = false;
    this.router.navigate(['/']);
  }
}

