import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { GroceryItem, GroceryItemResponse, CreateGroceryListResponse } from '../models/grocery-items.models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create-grocery-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="create-container">
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
          <div class="create-card">
            <div class="page-header">
              <h2 class="page-title">Create New Grocery List</h2>
              <p class="page-subtitle">Add your grocery list details and items</p>
            </div>

            <form (ngSubmit)="onSubmit()" #createForm="ngForm">
              <!-- Grocery List Details -->
              <div class="form-section">
                <h3 class="section-title">📋 List Details</h3>
                
                <div class="form-group">
                  <label for="name">List Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    [(ngModel)]="groceryListName"
                    required
                    placeholder="Enter grocery list name"
                    [disabled]="creating || saving"
                    class="form-input">
                </div>

                <div class="form-group">
                  <label for="description">Description</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    [(ngModel)]="groceryListDescription"
                    placeholder="Enter description (optional)"
                    rows="3"
                    [disabled]="creating || saving"
                    class="form-textarea"></textarea>
                </div>
              </div>

              <!-- Grocery Items Section -->
              <div class="form-section">
                <div class="section-header">
                  <h3 class="section-title">🛒 Grocery Items</h3>
                  <button 
                    type="button" 
                    class="btn btn-add" 
                    (click)="addGroceryItem()"
                    [disabled]="creating || saving">
                    ➕ Add Item
                  </button>
                </div>

                <div *ngIf="groceryItems.length === 0" class="empty-items">
                  <p>No items added yet. Click "Add Item" to start adding items to your list.</p>
                </div>

                <div class="items-list">
                  <div *ngFor="let item of groceryItems; let i = index" class="item-card">
                    <div class="item-header">
                      <span class="item-number">Item {{ i + 1 }}</span>
                      <button 
                        type="button" 
                        class="btn-remove" 
                        (click)="removeGroceryItem(i)"
                        [disabled]="creating || saving"
                        title="Remove item">
                        🗑️
                      </button>
                    </div>
                    
                    <div class="item-form">
                      <div class="form-row">
                        <div class="form-group">
                          <label>Item Name *</label>
                          <input 
                            type="text" 
                            [(ngModel)]="item.name"
                            [name]="'itemName_' + i"
                            required
                            placeholder="e.g., Sugar"
                            [disabled]="creating || saving"
                            class="form-input">
                        </div>

                        <div class="form-group">
                          <label>Quantity *</label>
                          <input 
                            type="number" 
                            [(ngModel)]="item.quantity"
                            [name]="'quantity_' + i"
                            required
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            [disabled]="creating || saving"
                            class="form-input">
                        </div>

                        <div class="form-group">
                          <label>Quantity Type *</label>
                          <select 
                            [(ngModel)]="item.quantity_type"
                            [name]="'quantityType_' + i"
                            required
                            [disabled]="creating || saving"
                            class="form-select">
                            <option value="Gram">Gram</option>
                            <option value="Liter">Liter</option>
                            <option value="Count">Count</option>
                          </select>
                        </div>
                      </div>

                      <div class="form-row">
                        <div class="form-group flex-grow">
                          <label>Note</label>
                          <input 
                            type="text" 
                            [(ngModel)]="item.note"
                            [name]="'note_' + i"
                            placeholder="Optional note"
                            [disabled]="creating || saving"
                            class="form-input">
                        </div>

                        <div class="form-group toggle-group">
                          <label>Purchased</label>
                          <label class="toggle-switch">
                            <input 
                              type="checkbox" 
                              [(ngModel)]="item.purchased"
                              [name]="'purchased_' + i"
                              [disabled]="creating || saving">
                            <span class="toggle-slider"></span>
                          </label>
                          <span class="toggle-label">{{ item.purchased ? 'Yes' : 'No' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  [disabled]="!createForm.valid || creating || saving || !validateGroceryItems()">
                  {{ saving ? 'Creating...' : 'Create Grocery List' }}
                </button>
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  (click)="goBack()"
                  [disabled]="creating || saving">
                  Cancel
                </button>
              </div>
            </form>
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
    .create-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      position: relative;
      overflow-x: hidden;
    }

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

    .create-card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      padding: 3rem;
      max-width: 900px;
      margin: 0 auto;
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

    .page-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .page-title {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #666;
      font-weight: 500;
    }

    .form-section {
      margin-bottom: 2.5rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
      border-radius: 16px;
      border: 2px solid rgba(102, 126, 234, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin: 0;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 15px;
      box-sizing: border-box;
      transition: all 0.3s ease;
      background: white;
      font-family: inherit;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      transform: translateY(-1px);
    }

    .form-input:disabled,
    .form-textarea:disabled,
    .form-select:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .item-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      border: 2px solid #f0f0f0;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: rgba(102, 126, 234, 0.3);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
      }
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .item-number {
      font-weight: 700;
      color: #667eea;
      font-size: 1rem;
    }

    .btn-remove {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .item-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }

    .form-row:last-child {
      grid-template-columns: 1fr auto;
    }

    .flex-grow {
      flex: 1;
    }

    .toggle-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 180px;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
      margin: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.3s;
      border-radius: 26px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    input:checked + .toggle-slider {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }

    .toggle-label {
      font-weight: 600;
      color: #333;
      min-width: 35px;
    }

    .empty-items {
      text-align: center;
      padding: 2rem;
      color: #888;
      background: white;
      border-radius: 12px;
      border: 2px dashed #e0e0e0;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #f0f0f0;
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
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
      
      &:hover:not(:disabled) {
        background: #5a6268;
        transform: translateY(-2px);
      }
    }

    .btn-add {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 8px;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      }
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .footer {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      color: white;
      text-align: center;
      padding: 2.5rem 0;
      margin-top: auto;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
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

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-row:last-child {
        grid-template-columns: 1fr;
      }

      .toggle-group {
        width: 100%;
        justify-content: flex-start;
      }

      .form-actions {
        flex-direction: column;
      }

      .create-card {
        padding: 2rem 1.5rem;
      }

      .page-title {
        font-size: 2rem;
      }
    }
  `]
})
export class CreateGroceryListComponent implements OnInit {
  groceryListName: string = '';
  groceryListDescription: string = '';
  groceryItems: GroceryItem[] = [];
  creating: boolean = false;
  saving: boolean = false;
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
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.notificationService.showError('Please login to create a grocery list.');
      this.router.navigate(['/login']);
    }
  }

  addGroceryItem(): void {
    this.groceryItems.push({
      name: '',
      quantity: 0,
      quantity_type: 'Gram',
      note: '',
      purchased: false
    });
  }

  removeGroceryItem(index: number): void {
    this.groceryItems.splice(index, 1);
  }

  validateGroceryItems(): boolean {
    if (this.groceryItems.length === 0) {
      return false;
    }
    
    // Check if all items have required fields
    return this.groceryItems.every(item => 
      item.name && item.name.trim() !== '' && 
      item.quantity > 0 &&
      item.quantity_type
    );
  }

  onSubmit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.showError('Please login to create a grocery list.');
      this.router.navigate(['/login']);
      return;
    }

    // Validate grocery items
    if (!this.validateGroceryItems()) {
      this.notificationService.showError('Please add at least one valid grocery item with name and quantity > 0.');
      return;
    }

    // Get family_membership from localStorage
    const familyMembership = localStorage.getItem('family_membership');
    if (!familyMembership) {
      this.notificationService.showError('Family membership not found. Please refresh the page.');
      return;
    }

    this.saving = true;

    // Step 1: Create the grocery list
    const formData = new FormData();
    formData.append('name', this.groceryListName);
    formData.append('description', this.groceryListDescription || '');
    formData.append('family_membership', familyMembership);

    this.apiService.postFormData<CreateGroceryListResponse>('grocery/grocery-lists/', formData, token).subscribe({
      next: (response) => {
        if (response.payload && response.payload.id) {
          const listId = response.payload.id;
          
          // Step 2: Create grocery items if any
          if (this.groceryItems.length > 0) {
            this.createGroceryItems(listId, token);
          } else {
            // No items, just navigate
            this.saving = false;
            this.notificationService.showSuccess('Grocery list created successfully!');
            this.router.navigate(['/grocery-lists']);
          }
        } else {
          this.saving = false;
          this.notificationService.showError('Failed to create grocery list. Invalid response.');
        }
      },
      error: (error) => {
        this.saving = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to create grocery list. Please try again.';
        this.notificationService.showError(errorMessage);
        
        if (error.status === 401) {
          this.authService.removeToken();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  createGroceryItems(listId: number, token: string): void {
    this.creating = true;
    let completed = 0;
    let errors = 0;

    if (this.groceryItems.length === 0) {
      this.creating = false;
      this.saving = false;
      this.notificationService.showSuccess('Grocery list created successfully!');
      this.router.navigate(['/grocery-lists']);
      return;
    }

    // Create items one by one
    this.groceryItems.forEach((item, index) => {
      const itemFormData = new FormData();
      itemFormData.append('name', item.name);
      itemFormData.append('quantity', String(item.quantity));
      itemFormData.append('quantity_type', item.quantity_type);
      itemFormData.append('note', item.note || '');
      itemFormData.append('purchased', String(item.purchased));

      this.apiService.postFormData<GroceryItemResponse>(
        `grocery/grocery-items/?grocery_list_id=${listId}`,
        itemFormData,
        token
      ).subscribe({
        next: () => {
          completed++;
          if (completed + errors === this.groceryItems.length) {
            this.creating = false;
            this.saving = false;
            if (errors === 0) {
              this.notificationService.showSuccess('Grocery list and items created successfully!');
            } else {
              this.notificationService.showSuccess(`Grocery list created! ${completed} items added successfully, ${errors} items failed.`);
            }
            this.router.navigate(['/grocery-lists']);
          }
        },
        error: (error) => {
          errors++;
          completed++;
          console.error(`Failed to create item ${index + 1}:`, error);
          
          if (completed + errors === this.groceryItems.length) {
            this.creating = false;
            this.saving = false;
            if (errors === this.groceryItems.length) {
              this.notificationService.showError('Grocery list created but failed to add items. Please add them manually.');
            } else {
              this.notificationService.showSuccess(`Grocery list created! ${completed - errors} items added successfully, ${errors} items failed.`);
            }
            this.router.navigate(['/grocery-lists']);
          }
        }
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/grocery-lists']);
  }

  goHome(): void {
    this.router.navigate(['/']);
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

