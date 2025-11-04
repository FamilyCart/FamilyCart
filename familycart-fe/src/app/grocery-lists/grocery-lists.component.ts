import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { GroceryListResponse, GroceryList } from '../models/grocery.models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-grocery-lists',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, TitleCasePipe],
  template: `
    <div class="grocery-container">
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div class="logo-container" (click)="goHome()">
              <img [src]="logoImageUrl" 
                   alt="FamilyCart Logo" 
                   class="logo-img">
              <h1 class="logo-text">FamilyCart</h1>
            </div>
            <nav class="nav" [class.active]="menuOpen">
              <a [routerLink]="['/']" class="nav-link">Home</a>
              <a [routerLink]="['/profile']" class="nav-link">Profile</a>
              <div class="dropdown">
                <a href="#" class="nav-link dropdown-toggle active" [class.active]="groceryListDropdownOpen" (click)="toggleGroceryListDropdown(); $event.preventDefault()">
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
          <div class="page-header">
            <h2 class="page-title">My Grocery Lists</h2>
            <p class="page-subtitle">View and manage all your grocery lists</p>
          </div>

          <div *ngIf="loading" class="loading-state">
            <p>Loading grocery lists...</p>
          </div>

          <div *ngIf="!loading && groceryLists && groceryLists.length > 0" class="lists-container">
            <div class="lists-grid">
              <div *ngFor="let list of groceryLists; let i = index" class="list-card" [style.animation-delay]="(i * 0.1) + 's'" (click)="viewListDetails(list.id)" [style.cursor]="'pointer'">
                <div class="card-decoration"></div>
                <div class="list-card-content">
                  <div class="list-card-header">
                    <div class="list-icon-wrapper">
                      <span class="list-icon">🛒</span>
                    </div>
                    <div class="list-title-section">
                      <h3 class="list-name">{{ list.name }}</h3>
                    </div>
                  </div>
                  <div class="list-card-body">
                    <div class="info-item">
                      <div class="info-icon">📝</div>
                      <div class="info-content">
                        <span class="info-label">Name</span>
                        <span class="info-value">{{ list.name }}</span>
                      </div>
                    </div>
                    <div class="info-item" *ngIf="list.description">
                      <div class="info-icon">📄</div>
                      <div class="info-content">
                        <span class="info-label">Description</span>
                        <span class="info-value">{{ list.description }}</span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="info-icon">📅</div>
                      <div class="info-content">
                        <span class="info-label">Created</span>
                        <span class="info-value">{{ formatDate(list.created_at) }}</span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="info-icon">🔄</div>
                      <div class="info-content">
                        <span class="info-label">Last Updated</span>
                        <span class="info-value">{{ formatDate(list.updated_at) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div class="pagination" *ngIf="totalCount > 0 && totalPages > 1">
              <div class="pagination-info">
                <span>Showing {{ ((currentPage - 1) * pageSize) + 1 }} - {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} lists</span>
                <span class="page-info">(Page {{ currentPage }} of {{ totalPages }})</span>
              </div>
              <div class="pagination-controls">
                <button 
                  class="btn-pagination" 
                  [disabled]="!hasPreviousPage || loading"
                  (click)="loadPreviousPage()"
                  title="Previous Page">
                  ← Previous
                </button>
                <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
                <button 
                  class="btn-pagination" 
                  [disabled]="!hasNextPage || loading"
                  (click)="loadNextPage()"
                  title="Next Page">
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="!loading && groceryLists && groceryLists.length === 0" class="empty-state">
            <div class="empty-icon">🛒</div>
            <p>You don't have any grocery lists yet.</p>
            <button type="button" class="btn btn-primary" (click)="goToCreateList()">Create Your First List</button>
          </div>

          <div *ngIf="!loading && error" class="error-state">
            <p>{{ error }}</p>
            <button class="btn btn-primary" (click)="loadGroceryLists()">Retry</button>
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
    .grocery-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      position: relative;
      overflow-x: hidden;
    }

    // Header Styles (same as other pages)
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

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
      animation: slideUp 0.6s ease-out;
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

    .lists-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .lists-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .list-card {
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
      }
    }

    .card-decoration {
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.1;
      transform: translate(30%, -30%);
      transition: transform 0.4s ease;
      z-index: 0;
    }

    .list-card-content {
      position: relative;
      z-index: 1;
      padding: 2.5rem;
    }

    .list-card-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .list-icon-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      
      &:hover {
        transform: rotate(5deg);
      }
    }

    .list-icon {
      font-size: 2.5rem;
      transition: all 0.3s ease;
    }

    .list-title-section {
      flex: 1;
    }

    .list-name {
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
      margin: 0;
      line-height: 1.3;
    }

    .list-card-body {
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

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      margin-top: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      color: #666;
      font-weight: 500;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .page-info {
        font-size: 0.9rem;
        color: #888;
      }
    }

    .pagination-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .btn-pagination {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }

    .page-indicator {
      padding: 0.5rem 1rem;
      background: #f5f5f5;
      border-radius: 8px;
      font-weight: 600;
      color: #333;
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

    .footer {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      color: white;
      text-align: center;
      padding: 2.5rem 0;
      margin-top: auto;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    }

    @media (min-width: 768px) {
      .lists-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2.5rem;
      }

      .page-title {
        font-size: 3.5rem;
      }
    }

    @media (min-width: 992px) {
      .lists-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 3rem;
      }
    }

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

      .pagination {
        flex-direction: column;
        text-align: center;
      }

      .pagination-controls {
        width: 100%;
        justify-content: center;
      }

      .page-title {
        font-size: 2rem;
      }

      .list-card-content {
        padding: 2rem 1.5rem;
      }
    }
  `]
})
export class GroceryListsComponent implements OnInit {
  groceryLists: GroceryList[] = [];
  loading: boolean = false;
  error: string = '';
  menuOpen = false;
  groceryListDropdownOpen = false;
  logoImageUrl = environment.logoImageUrl;
  
  // Pagination
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10; // Default, will be extracted from URL
  totalPages: number = 1;
  nextUrl: string | null = null;
  previousUrl: string | null = null;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  
  Math = Math; // Make Math available in template

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadGroceryLists();
  }

  loadGroceryLists(url?: string): void {
    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.showError('Please login to view your grocery lists.');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = '';

    // If URL is provided (for pagination), use it directly, otherwise use the base endpoint
    const endpoint = url ? this.extractEndpointFromUrl(url) : 'grocery/grocery-lists';

    this.apiService.get<GroceryListResponse>(endpoint, null, token).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Extract data from nested structure
        if (response.results && response.results.payload) {
          this.groceryLists = response.results.payload;
        } else {
          this.groceryLists = [];
        }

        // Update pagination info
        this.totalCount = response.count || 0;
        this.nextUrl = response.next;
        this.previousUrl = response.previous;
        this.hasNextPage = !!response.next;
        this.hasPreviousPage = !!response.previous;

        // Extract limit and offset from URLs to calculate pagination
        const paginationInfo = this.extractPaginationInfo(response);
        this.pageSize = paginationInfo.limit;
        this.currentPage = paginationInfo.currentPage;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        
        // Ensure currentPage is valid
        if (this.currentPage < 1) {
          this.currentPage = 1;
        }
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to load grocery lists. Please try again.';
        this.error = errorMessage;
        this.notificationService.showError(errorMessage);
        
        if (error.status === 401) {
          this.authService.removeToken();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  extractEndpointFromUrl(url: string): string {
    // Extract endpoint from full URL (e.g., "http://127.0.0.1:8000/grocery/grocery-lists/?limit=1&offset=1&page=1")
    try {
      const urlObj = new URL(url);
      let endpoint = urlObj.pathname + urlObj.search;
      // Remove leading slash if present
      if (endpoint.startsWith('/')) {
        endpoint = endpoint.substring(1);
      }
      return endpoint;
    } catch {
      // If URL parsing fails, try to extract manually
      const apiBasePath = environment.apiBasePath;
      const match = url.match(new RegExp(`/${apiBasePath}/.*`));
      if (match) {
        return match[0].startsWith('/') ? match[0].substring(1) : match[0];
      }
      return 'grocery/grocery-lists';
    }
  }

  extractPaginationInfo(response: GroceryListResponse): { limit: number; offset: number; currentPage: number } {
    let limit = 10; // Default limit
    let offset = 0; // Default offset
    
    // If we have a previous URL, we're not on the first page
    // Extract limit and calculate current offset from previous
    if (response.previous) {
      try {
        const urlParams = new URLSearchParams(response.previous.split('?')[1] || '');
        limit = parseInt(urlParams.get('limit') || '10', 10);
        const prevOffset = parseInt(urlParams.get('offset') || '0', 10);
        // Current page is the next page after previous
        offset = prevOffset + limit;
      } catch (e) {
        console.error('Error parsing previous URL:', e);
      }
    }
    // If we have a next URL, extract limit and offset to know where we are
    else if (response.next) {
      try {
        const urlParams = new URLSearchParams(response.next.split('?')[1] || '');
        limit = parseInt(urlParams.get('limit') || '10', 10);
        const nextOffset = parseInt(urlParams.get('offset') || '0', 10);
        // If next offset is 1, we're on page 1 (offset 0)
        // Otherwise, we need to calculate backwards
        if (nextOffset > 0) {
          offset = nextOffset - limit;
          // Ensure offset is not negative
          offset = Math.max(0, offset);
        } else {
          offset = 0;
        }
      } catch (e) {
        console.error('Error parsing next URL:', e);
      }
    }
    // If neither next nor previous, we're on page 1
    else {
      offset = 0;
    }
    
    // Calculate current page: offset / limit + 1 (since offset is 0-based)
    // For page 1: offset = 0, so page = 0/limit + 1 = 1
    const currentPage = offset === 0 ? 1 : Math.floor(offset / limit) + 1;
    
    return {
      limit: limit || 10,
      offset: offset || 0,
      currentPage: currentPage || 1
    };
  }

  loadNextPage(): void {
    if (this.nextUrl && !this.loading) {
      this.loadGroceryLists(this.nextUrl);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadPreviousPage(): void {
    if (this.previousUrl && !this.loading) {
      this.loadGroceryLists(this.previousUrl);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  viewListDetails(listId: number): void {
    this.router.navigate(['/grocery-lists', listId]);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToCreateList(): void {
    this.router.navigate(['/create-grocery-list']);
  }

  logout(): void {
    this.authService.removeToken();
    this.notificationService.showSuccess('Logged out successfully.');
    this.menuOpen = false;
    this.groceryListDropdownOpen = false;
    this.router.navigate(['/']);
  }
}

