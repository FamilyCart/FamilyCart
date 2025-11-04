import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { DatePipe } from '@angular/common';
import { GroceryItem, GroceryItemsListResponse, GroceryItemResponse } from '../models/grocery-items.models';
import { environment } from '../../environments/environment';

export interface GroceryListDetail {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  family_membership: number;
  created_by: number;
}

export interface GroceryListDetailResponse {
  message?: string;
  payload?: GroceryListDetail;
  status?: number;
}

@Component({
  selector: 'app-grocery-list-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  template: `
    <div class="detail-container">
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
          <div class="detail-card">
            <div *ngIf="loading" class="loading-state">
              <p>Loading grocery list details...</p>
            </div>

            <div *ngIf="!loading && groceryList" class="detail-content">
              <div class="detail-header">
                <h2 class="page-title">Grocery List Details</h2>
                <button 
                  class="btn btn-delete-list" 
                  (click)="confirmDelete()"
                  [disabled]="deleting">
                  <span class="btn-icon">🗑️</span>
                  <span>{{ deleting ? 'Deleting...' : 'Delete List' }}</span>
                </button>
              </div>

              <form (ngSubmit)="onUpdateList()" #listForm="ngForm">
                <div class="form-group">
                  <label for="name">List Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    [(ngModel)]="groceryList.name"
                    required
                    placeholder="Enter list name"
                    [disabled]="updating || deleting"
                    class="form-input">
                </div>

                <div class="form-group">
                  <label for="description">Description</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    [ngModel]="groceryList.description || ''"
                    (ngModelChange)="groceryList.description = $event || null"
                    placeholder="Enter description (optional)"
                    rows="4"
                    [disabled]="updating || deleting"
                    class="form-textarea"></textarea>
                </div>

                <div class="info-section">
                  <div class="info-item">
                    <span class="info-label">Created At:</span>
                    <span class="info-value">{{ groceryList.created_at | date:'long' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Last Updated:</span>
                    <span class="info-value">{{ groceryList.updated_at | date:'long' }}</span>
                  </div>
                </div>

                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    [disabled]="!listForm.valid || updating || deleting || !hasChanges()">
                    {{ updating ? 'Updating...' : 'Update List' }}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-secondary" 
                    (click)="goBack()"
                    [disabled]="updating || deleting">
                    Back to Lists
                  </button>
                </div>
              </form>

              <!-- Grocery Items Section -->
              <div class="items-section" *ngIf="!loading && groceryList">
                <div class="section-header">
                  <h3 class="section-title">🛒 Grocery Items</h3>
                  <button 
                    type="button" 
                    class="btn btn-add-item" 
                    (click)="addGroceryItem()"
                    [disabled]="updating || deleting || savingItems || editingItemId !== null">
                    <span class="btn-icon">➕</span>
                    <span>Add Item</span>
                  </button>
                </div>

                <div *ngIf="loadingItems" class="loading-items">
                  <p>Loading items...</p>
                </div>

                <div *ngIf="!loadingItems && groceryItems.length === 0" class="empty-items">
                  <p>No items in this list yet. Click "Add Item" to start adding items.</p>
                </div>

                <div class="items-list" *ngIf="!loadingItems && groceryItems.length > 0">
                  <div *ngFor="let item of groceryItems; let i = index" class="item-card" [class.purchased]="item.purchased" [class.editing]="editingItemId === item.id">
                    <!-- Read-only View -->
                    <div *ngIf="!item.id || editingItemId !== item.id" class="item-view">
                      <div class="item-header">
                        <div class="item-info">
                          <span *ngIf="item.purchased" class="purchased-badge">✓ Purchased</span>
                        </div>
                        <div class="item-actions-header">
                          <button 
                            type="button" 
                            class="btn-icon-edit" 
                            (click)="startEditItem(item)"
                            [disabled]="updating || deleting || savingItems || editingItemId !== null"
                            title="Edit item">
                            ✏️
                          </button>
                          <button 
                            type="button" 
                            class="btn-icon-delete" 
                            (click)="confirmDeleteItem(item, i)"
                            [disabled]="updating || deleting || savingItems || editingItemId !== null"
                            title="Delete item">
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div class="item-details">
                        <div class="detail-row">
                          <span class="detail-label">Name:</span>
                          <span class="detail-value">{{ item.name || 'N/A' }}</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">Quantity:</span>
                          <span class="detail-value">{{ item.quantity }} {{ item.quantity_type }}</span>
                        </div>
                        <div class="detail-row" *ngIf="item.note">
                          <span class="detail-label">Note:</span>
                          <span class="detail-value">{{ item.note }}</span>
                        </div>
                        <div class="detail-row">
                          <label class="purchase-toggle-label">
                            <input 
                              type="checkbox" 
                              [(ngModel)]="item.purchased"
                              [name]="'purchasedView_' + i"
                              (change)="onItemChange(item)"
                              [disabled]="updating || deleting || savingItems">
                            <span class="toggle-label-text">{{ item.purchased ? '✓ Purchased' : 'Not Purchased' }}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- Edit Form (shown only when editing) -->
                    <div *ngIf="(!item.id) || editingItemId === item.id" class="item-form">
                      <div class="form-row">
                        <div class="form-group">
                          <label>Item Name *</label>
                          <input 
                            type="text" 
                            [(ngModel)]="item.name"
                            [name]="'itemName_' + i"
                            required
                            placeholder="e.g., Sugar"
                            [disabled]="updating || deleting || savingItems"
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
                            [disabled]="updating || deleting || savingItems"
                            class="form-input">
                        </div>

                        <div class="form-group">
                          <label>Quantity Type *</label>
                          <select 
                            [(ngModel)]="item.quantity_type"
                            [name]="'quantityType_' + i"
                            required
                            [disabled]="updating || deleting || savingItems"
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
                            [disabled]="updating || deleting || savingItems"
                            class="form-input">
                        </div>

                        <div class="form-group toggle-group">
                          <label>Purchased</label>
                          <label class="toggle-switch">
                            <input 
                              type="checkbox" 
                              [(ngModel)]="item.purchased"
                              [name]="'purchased_' + i"
                              (change)="onItemChange(item)"
                              [disabled]="updating || deleting || savingItems">
                            <span class="toggle-slider"></span>
                          </label>
                          <span class="toggle-label">{{ item.purchased ? 'Yes' : 'No' }}</span>
                        </div>
                      </div>

                      <div class="item-actions">
                        <button 
                          type="button" 
                          class="btn btn-save-item" 
                          (click)="saveItem(item, i)"
                          [disabled]="updating || deleting || savingItems || isSaveDisabled(item, i)">
                          {{ savingItems ? 'Saving...' : (!item.id ? '💾 Create' : '💾 Save') }}
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-cancel-item" 
                          (click)="cancelEditItem(item)"
                          [disabled]="savingItems">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pagination Controls -->
                <div class="pagination-controls" *ngIf="!loadingItems && (paginationNext || paginationPrevious || paginationCount > 0)">
                  <div class="pagination-info">
                    <span>Total: {{ paginationCount }} items</span>
                  </div>
                  <div class="pagination-buttons">
                    <button 
                      type="button" 
                      class="btn btn-pagination" 
                      (click)="loadPage(paginationPrevious)"
                      [disabled]="!paginationPrevious || loadingItems">
                      ← Previous
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-pagination" 
                      (click)="loadPage(paginationNext)"
                      [disabled]="!paginationNext || loadingItems">
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!loading && !groceryList && error" class="error-state">
              <p>{{ error }}</p>
              <button class="btn btn-primary" (click)="loadListDetails()">Retry</button>
              <button class="btn btn-secondary" (click)="goBack()">Back to Lists</button>
            </div>
          </div>

          <!-- Delete Confirmation Modal for Grocery List -->
          <div *ngIf="showDeleteConfirm" class="modal-overlay" (click)="cancelDelete()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>Delete Grocery List</h3>
              <p>Are you sure you want to delete "{{ groceryList?.name }}"? This action cannot be undone.</p>
              <div class="modal-actions">
                <button class="btn btn-danger" (click)="deleteList()" [disabled]="deleting">
                  {{ deleting ? 'Deleting...' : 'Yes, Delete' }}
                </button>
                <button class="btn btn-secondary" (click)="cancelDelete()" [disabled]="deleting">Cancel</button>
              </div>
            </div>
          </div>

          <!-- Delete Confirmation Modal for Grocery Item -->
          <div *ngIf="showDeleteItemConfirm" class="modal-overlay" (click)="cancelDeleteItem()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>Delete Grocery Item</h3>
              <p>Are you sure you want to delete "{{ itemToDelete?.name }}"? This action cannot be undone.</p>
              <div class="modal-actions">
                <button class="btn btn-danger" (click)="deleteItemConfirmed()" [disabled]="savingItems">
                  {{ savingItems ? 'Deleting...' : 'Yes, Delete' }}
                </button>
                <button class="btn btn-secondary" (click)="cancelDeleteItem()" [disabled]="savingItems">Cancel</button>
              </div>
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
    .detail-container {
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

    .detail-card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      padding: 3rem;
      max-width: 800px;
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

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .page-title {
      font-size: 2.5rem;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: #333;
      font-size: 15px;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 16px 18px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 16px;
      box-sizing: border-box;
      transition: all 0.3s ease;
      background: #fafafa;
      font-family: inherit;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .form-input:disabled,
    .form-textarea:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .info-section {
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
      border-radius: 16px;
      padding: 1.5rem;
      margin: 2rem 0;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
    }

    .info-label {
      font-weight: 600;
      color: #888;
      font-size: 14px;
    }

    .info-value {
      color: #333;
      font-size: 15px;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
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

    .btn-danger {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
      }
    }

    .btn-delete-list {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      padding: 10px 18px;
      font-size: 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
      transition: all 0.3s ease;
      flex: none;
      white-space: nowrap;
      
      .btn-icon {
        font-size: 16px;
        transition: transform 0.3s ease;
      }
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(231, 76, 60, 0.5);
        
        .btn-icon {
          transform: scale(1.2) rotate(-5deg);
        }
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-state,
    .error-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .error-state p {
      color: #e74c3c;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }

    .items-section {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #f0f0f0;
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

    .btn-add {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-add-item {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 10px 18px;
      font-size: 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      transition: all 0.3s ease;
      flex: none;
      white-space: nowrap;
      
      .btn-icon {
        font-size: 16px;
        transition: transform 0.3s ease;
      }
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
        
        .btn-icon {
          transform: scale(1.2) rotate(90deg);
        }
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }

    .loading-items {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .item-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      border: 2px solid #f0f0f0;
      transition: all 0.3s ease;
      
      &.purchased {
        border-color: #10b981;
        background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
      }

      &.editing {
        border-color: #667eea;
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.25);
        transform: scale(1.01);
      }
      
      &:hover:not(.editing) {
        border-color: rgba(102, 126, 234, 0.3);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
      }
    }

    .item-view {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .item-actions-header {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-icon-edit,
    .btn-icon-delete {
      background: transparent;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }
    }

    .btn-icon-edit {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }

    .btn-icon-delete {
      border-color: #e74c3c;
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        border-color: #e74c3c;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
      }
    }

    .item-details {
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 0;
    }

    .detail-label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
      min-width: 100px;
    }

    .detail-value {
      color: #333;
      font-size: 15px;
      font-weight: 500;
      flex: 1;
    }

    .purchase-toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      
      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .toggle-label-text {
        font-weight: 500;
        color: #333;
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

    .item-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .purchased-badge {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
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

    .form-row:last-of-type {
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

    .item-actions {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn-save-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      width: auto;
      flex: none;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }

    .btn-cancel-item {
      background: #6c757d;
      color: white;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
      transition: all 0.3s ease;
      width: auto;
      flex: none;
      
      &:hover:not(:disabled) {
        background: #5a6268;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }

    .pagination-controls {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .pagination-buttons {
      display: flex;
      gap: 0.75rem;
    }

    .btn-pagination {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      flex: none;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        background: #ccc;
      }
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

    .form-group {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
      
      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        color: #333;
      }
      
      p {
        color: #666;
        margin-bottom: 2rem;
        line-height: 1.6;
      }
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
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

      .detail-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .modal-actions {
        flex-direction: column;
      }

      .detail-card {
        padding: 2rem 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-row:last-of-type {
        grid-template-columns: 1fr;
      }

      .toggle-group {
        width: 100%;
        justify-content: flex-start;
      }

      .pagination-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .pagination-buttons {
        width: 100%;
        justify-content: center;
      }

      .btn-pagination {
        flex: 1;
        min-width: 120px;
      }

      .btn-delete-list,
      .btn-add-item {
        font-size: 13px;
        padding: 8px 16px;
      }
    }
  `]
})
export class GroceryListDetailComponent implements OnInit {
  groceryList: GroceryListDetail | null = null;
  originalList: GroceryListDetail | null = null;
  groceryItems: GroceryItem[] = [];
  originalItems: GroceryItem[] = [];
  loading: boolean = false;
  loadingItems: boolean = false;
  updating: boolean = false;
  deleting: boolean = false;
  savingItems: boolean = false;
  error: string = '';
  menuOpen = false;
  groceryListDropdownOpen = false;
  showDeleteConfirm = false;
  showDeleteItemConfirm = false;
  itemToDelete: GroceryItem | null = null;
  itemToDeleteIndex: number = -1;
  listId: number = 0;
  editingItemId: number | null = null; // Track which item is being edited
  paginationNext: string | null = null;
  paginationPrevious: string | null = null;
  paginationCount: number = 0;
  logoImageUrl = environment.logoImageUrl;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Get list_id from route params
    this.route.params.subscribe(params => {
      this.listId = +params['id'];
      if (this.listId) {
        this.loadListDetails();
      }
    });
  }

  loadListDetails(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.showError('Please login to view grocery list details.');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.get<GroceryListDetailResponse>(`grocery/grocery-lists/${this.listId}`, null, token).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.payload) {
          // Ensure description is null or string (not undefined)
          const payload = {
            ...response.payload,
            description: response.payload.description ?? null
          };
          this.groceryList = payload;
          // Store original for comparison
          this.originalList = JSON.parse(JSON.stringify(payload));
          
          // Load grocery items after list is loaded
          this.loadGroceryItems();
        } else {
          this.error = 'No grocery list data received.';
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to load grocery list details. Please try again.';
        this.error = errorMessage;
        this.notificationService.showError(errorMessage);
        
        if (error.status === 401) {
          this.authService.removeToken();
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          this.notificationService.showError('Grocery list not found.');
          this.router.navigate(['/grocery-lists']);
        }
      }
    });
  }

  hasChanges(): boolean {
    if (!this.groceryList || !this.originalList) return false;
    
    return this.groceryList.name !== this.originalList.name ||
           this.groceryList.description !== this.originalList.description;
  }

  onUpdateList(): void {
    if (!this.groceryList || !this.originalList) return;

    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.showError('Please login to update the grocery list.');
      this.router.navigate(['/login']);
      return;
    }

    // Check if there are changes
    if (!this.hasChanges()) {
      this.notificationService.showInfo('No changes detected.');
      return;
    }

    this.updating = true;

    // Create FormData with only changed fields
    const formData = new FormData();
    
    if (this.groceryList.name !== this.originalList.name) {
      formData.append('name', this.groceryList.name);
    }
    
    if (this.groceryList.description !== this.originalList.description) {
      const descValue = this.groceryList.description === null ? '' : this.groceryList.description;
      formData.append('description', descValue);
    }

    // Use PATCH with FormData
    this.apiService.patchFormData<GroceryListDetailResponse>(
      `grocery/grocery-lists/${this.listId}/`,
      formData,
      token
    ).subscribe({
      next: (response) => {
        this.updating = false;
        const successMessage = response.message || 'Grocery list updated successfully!';
        this.notificationService.showSuccess(successMessage);
        // Reload to get updated data
        this.loadListDetails();
      },
      error: (error) => {
        this.updating = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to update grocery list. Please try again.';
        this.notificationService.showError(errorMessage);
        
        if (error.status === 401) {
          this.authService.removeToken();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  deleteList(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.showError('Please login to delete the grocery list.');
      this.router.navigate(['/login']);
      return;
    }

    this.deleting = true;

    this.apiService.delete(`grocery/grocery-lists/${this.listId}/`, token).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.notificationService.showSuccess('Grocery list deleted successfully!');
        // Navigate back to lists
        this.router.navigate(['/grocery-lists']);
      },
      error: (error) => {
        this.deleting = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to delete grocery list. Please try again.';
        this.notificationService.showError(errorMessage);
        
        if (error.status === 401) {
          this.authService.removeToken();
          this.router.navigate(['/login']);
        }
      }
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

  loadGroceryItems(pageUrl?: string): void {
    const token = this.authService.getToken();
    if (!token || !this.listId) {
      return;
    }

    this.loadingItems = true;

    // Use pageUrl if provided, otherwise use the default endpoint
    let endpoint: string;
    if (pageUrl) {
      // Extract the relative path from the full URL
      try {
        const url = new URL(pageUrl);
        endpoint = url.pathname.substring(1) + url.search; // Remove leading /
      } catch {
        // If it's already a relative URL, use it as is
        endpoint = pageUrl.startsWith('api/') ? pageUrl : `api/${pageUrl}`;
      }
    } else {
      endpoint = `grocery/grocery-items/?grocery_list_id=${this.listId}`;
    }

    this.apiService.get<GroceryItemsListResponse>(
      endpoint,
      null,
      token
    ).subscribe({
      next: (response) => {
        this.loadingItems = false;
        // Store pagination info
        this.paginationCount = response.count || 0;
        this.paginationNext = response.next;
        this.paginationPrevious = response.previous;
        
        // Extract data from nested structure: response.results.payload
        if (response.results && response.results.payload && Array.isArray(response.results.payload)) {
          this.groceryItems = response.results.payload.map(item => ({
            ...item,
            note: item.note || ''
          }));
          // Store original for comparison
          this.originalItems = JSON.parse(JSON.stringify(this.groceryItems));
        } else {
          this.groceryItems = [];
          this.originalItems = [];
        }
      },
      error: (error) => {
        this.loadingItems = false;
        console.error('Error loading grocery items:', error);
        // Don't show error notification for items, just log it
        this.groceryItems = [];
        this.originalItems = [];
      }
    });
  }

  loadPage(pageUrl: string | null): void {
    if (pageUrl) {
      this.loadGroceryItems(pageUrl);
    }
  }

  addGroceryItem(): void {
    // New items don't have an ID, so they will show the form by default
    this.groceryItems.push({
      name: '',
      quantity: 0,
      quantity_type: 'Gram',
      note: '',
      purchased: false
    });
  }

  startEditItem(item: GroceryItem): void {
    if (item.id) {
      this.editingItemId = item.id;
    }
  }

  cancelEditItem(item: GroceryItem): void {
    if (item.id) {
      // Restore original values
      const original = this.originalItems.find(orig => orig.id === item.id);
      if (original) {
        const itemIndex = this.groceryItems.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          this.groceryItems[itemIndex] = JSON.parse(JSON.stringify(original));
        }
      }
      this.editingItemId = null;
    } else {
      // For new items without ID, just remove from array
      const itemIndex = this.groceryItems.findIndex(i => i === item);
      if (itemIndex !== -1) {
        this.groceryItems.splice(itemIndex, 1);
      }
    }
  }

  saveItem(item: GroceryItem, index: number): void {
    if (item.id) {
      // Update existing item
      this.updateGroceryItem(item, index);
    } else {
      // Save new item - we'll save all new items together
      // For now, just save this one item immediately
      this.saveSingleNewItem(item, index);
    }
  }

  saveSingleNewItem(item: GroceryItem, index: number): void {
    // Validate
    if (!item.name || item.name.trim() === '' || item.quantity <= 0) {
      this.notificationService.showError('Please fill in all required fields (name and quantity > 0).');
      return;
    }

    const token = this.authService.getToken();
    if (!token || !this.listId) {
      return;
    }

    this.savingItems = true;

    const itemFormData = new FormData();
    itemFormData.append('name', item.name);
    itemFormData.append('quantity', String(item.quantity));
    itemFormData.append('quantity_type', item.quantity_type);
    itemFormData.append('note', item.note || '');
    itemFormData.append('purchased', String(item.purchased));

    this.apiService.postFormData<GroceryItemResponse>(
      `grocery/grocery-items/?grocery_list_id=${this.listId}`,
      itemFormData,
      token
    ).subscribe({
      next: (response) => {
        this.savingItems = false;
        if (response.payload && response.payload.id) {
          const updatedItem: GroceryItem = {
            id: response.payload.id,
            name: response.payload.name || '',
            quantity: response.payload.quantity || 0,
            quantity_type: response.payload.quantity_type || 'Gram',
            note: response.payload.note || '',
            purchased: response.payload.purchased || false
          };
          this.groceryItems[index] = updatedItem;
          this.originalItems.push(JSON.parse(JSON.stringify(updatedItem)));
          this.notificationService.showSuccess('Item added successfully!');
          // Refresh to ensure consistency
          this.loadGroceryItems();
        }
      },
      error: (error) => {
        this.savingItems = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to add item.';
        this.notificationService.showError(errorMessage);
      }
    });
  }

  confirmDeleteItem(item: GroceryItem, index: number): void {
    this.itemToDelete = item;
    this.itemToDeleteIndex = index;
    this.showDeleteItemConfirm = true;
  }

  cancelDeleteItem(): void {
    this.showDeleteItemConfirm = false;
    this.itemToDelete = null;
    this.itemToDeleteIndex = -1;
  }

  deleteItemConfirmed(): void {
    if (!this.itemToDelete) {
      return;
    }
    
    // If item has an ID, delete it from server
    if (this.itemToDelete.id) {
      this.deleteGroceryItem(this.itemToDelete.id, this.itemToDeleteIndex);
    } else {
      // Just remove from local array if it's a new item
      this.groceryItems.splice(this.itemToDeleteIndex, 1);
    }
    
    this.cancelDeleteItem();
  }

  removeGroceryItem(index: number): void {
    const item = this.groceryItems[index];
    
    // If item has an ID, delete it from server
    if (item.id) {
      this.deleteGroceryItem(item.id, index);
    } else {
      // Just remove from local array if it's a new item
      this.groceryItems.splice(index, 1);
    }
  }

  deleteGroceryItem(itemId: number, index: number): void {
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    this.savingItems = true;

    this.apiService.delete(`grocery/grocery-items/${itemId}/`, token).subscribe({
      next: () => {
        this.savingItems = false;
        this.groceryItems.splice(index, 1);
        this.originalItems = this.originalItems.filter(item => item.id !== itemId);
        this.notificationService.showSuccess('Item deleted successfully!');
        // Refresh items list to ensure consistency
        this.loadGroceryItems();
      },
      error: (error) => {
        this.savingItems = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to delete item.';
        this.notificationService.showError(errorMessage);
      }
    });
  }

  isItemUnchanged(item: GroceryItem, index: number): boolean {
    if (!item.id) return false; // New items are always changeable (can be saved)
    
    const original = this.originalItems.find(orig => orig.id === item.id);
    if (!original) return false;
    
    return item.name === original.name &&
           item.quantity === original.quantity &&
           item.quantity_type === original.quantity_type &&
           (item.note || '') === (original.note || '') &&
           item.purchased === original.purchased;
  }

  isSaveDisabled(item: GroceryItem, index: number): boolean {
    // For new items: disable if empty (no name or quantity <= 0)
    if (!item.id) {
      return !item.name || item.name.trim() === '' || item.quantity <= 0;
    }
    // For existing items: disable if unchanged
    return this.isItemUnchanged(item, index);
  }

  onItemChange(item: GroceryItem): void {
    // Auto-save purchased status change for existing items
    if (item.id) {
      this.updateGroceryItem(item, -1, true);
    }
  }

  updateGroceryItem(item: GroceryItem, index: number, autoSave: boolean = false): void {
    if (!item.id) {
      // This shouldn't happen as this button only shows for items with ID
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    // Validate item fields
    if (!item.name || item.name.trim() === '' || item.quantity <= 0) {
      if (!autoSave) {
        this.notificationService.showError('Please fill in all required fields (name and quantity > 0).');
      }
      return;
    }

    if (!autoSave && this.isItemUnchanged(item, index)) {
      return;
    }

    this.savingItems = true;

    const formData = new FormData();
    formData.append('name', item.name);
    formData.append('quantity', String(item.quantity));
    formData.append('quantity_type', item.quantity_type);
    formData.append('note', item.note || '');
    formData.append('purchased', String(item.purchased));

    this.apiService.patchFormData<GroceryItemResponse>(
      `grocery/grocery-items/${item.id}/`,
      formData,
      token
    ).subscribe({
      next: (response) => {
        this.savingItems = false;
        if (response.payload) {
          // Update the item in array
          const itemIndex = this.groceryItems.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            this.groceryItems[itemIndex] = { ...response.payload };
            // Update original
            const origIndex = this.originalItems.findIndex(i => i.id === item.id);
            if (origIndex !== -1) {
              this.originalItems[origIndex] = JSON.parse(JSON.stringify(response.payload));
            }
          }
        }
        
        if (autoSave) {
          // Silent update for purchased toggle - update local state immediately
          if (response.payload) {
            const updatedItem: GroceryItem = {
              id: response.payload.id,
              name: response.payload.name || '',
              quantity: response.payload.quantity || 0,
              quantity_type: response.payload.quantity_type || 'Gram',
              note: response.payload.note || '',
              purchased: response.payload.purchased || false
            };
            const itemIndex = this.groceryItems.findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
              this.groceryItems[itemIndex] = updatedItem;
              const origIndex = this.originalItems.findIndex(i => i.id === item.id);
              if (origIndex !== -1) {
                this.originalItems[origIndex] = JSON.parse(JSON.stringify(updatedItem));
              }
            }
          }
        } else {
          this.notificationService.showSuccess('Item updated successfully!');
          // Exit edit mode
          this.editingItemId = null;
          // Refresh to ensure consistency
          this.loadGroceryItems();
        }
      },
      error: (error) => {
        this.savingItems = false;
        const errorMessage = error.error?.payload || error.error?.message || error.error?.detail || 'Failed to update item.';
        this.notificationService.showError(errorMessage);
      }
    });
  }


  logout(): void {
    this.authService.removeToken();
    this.notificationService.showSuccess('Logged out successfully.');
    this.menuOpen = false;
    this.groceryListDropdownOpen = false;
    this.router.navigate(['/']);
  }
}

