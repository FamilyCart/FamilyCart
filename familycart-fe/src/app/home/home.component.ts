import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ApiService } from '../services/api.service';
import { ProfileData, ProfileResponse } from '../profile/profile.component';
import { FamilyListResponse } from '../models/family.models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  menuOpen = false;
  isAuthenticated = false;
  groceryListDropdownOpen = false;
  logoImageUrl = environment.logoImageUrl;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    // Load user data whenever component initializes and user is authenticated
    if (this.isAuthenticated) {
      this.loadUserData();
    }
  }

  checkAuthentication(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  loadUserData(): void {
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    // Call profile API
    this.apiService.get<ProfileResponse>('user/profile', null, token).subscribe({
      next: (profileResponse) => {
        if (profileResponse.payload) {
          const profile = profileResponse.payload;
          
          // Store user data in localStorage
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
          
          // Store family_membership for matching with family list
          if (profile.family_membership !== undefined && profile.family_membership !== null) {
            localStorage.setItem('family_membership', String(profile.family_membership));
            
            // Call family list API after profile is loaded
            this.loadFamilyData(token, profile.family_membership);
          } else {
            localStorage.removeItem('family_membership');
            // Still call family list API even if family_membership is not set
            this.loadFamilyData(token);
          }
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Don't show notification to avoid annoying users on every page load
        // Only handle token expiration
        if (error.status === 401) {
          this.authService.removeToken();
          this.isAuthenticated = false;
        }
      }
    });
  }

  loadFamilyData(token: string, familyMembershipId?: number): void {
    // Call family list API
    this.apiService.get<FamilyListResponse>('family/list', null, token).subscribe({
      next: (familyResponse) => {
        if (familyResponse.payload && familyResponse.payload.length > 0) {
          // If family_membership is provided, find matching family
          if (familyMembershipId !== undefined && familyMembershipId !== null) {
            const matchingFamily = familyResponse.payload.find(
              family => family.id === familyMembershipId
            );
            
            if (matchingFamily) {
              localStorage.setItem('family_name', matchingFamily.family_name);
              localStorage.setItem('role', matchingFamily.role);
            } else {
              // If no match found, clear stored values
              localStorage.removeItem('family_name');
              localStorage.removeItem('role');
            }
          } else {
            // If family_membership is not set, use the first family (or handle as needed)
            const firstFamily = familyResponse.payload[0];
            if (firstFamily) {
              localStorage.setItem('family_name', firstFamily.family_name);
              localStorage.setItem('role', firstFamily.role);
            }
          }
        } else {
          // No families found, clear stored values
          localStorage.removeItem('family_name');
          localStorage.removeItem('role');
        }
      },
      error: (error) => {
        console.error('Error loading family list:', error);
        // Don't show notification to avoid annoying users on every page load
        if (error.status === 401) {
          this.authService.removeToken();
          this.isAuthenticated = false;
        }
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    // Close dropdown when menu toggles
    this.groceryListDropdownOpen = false;
  }

  toggleGroceryListDropdown(): void {
    this.groceryListDropdownOpen = !this.groceryListDropdownOpen;
  }

  closeDropdown(): void {
    this.groceryListDropdownOpen = false;
  }

  logout(): void {
    this.authService.removeToken();
    this.isAuthenticated = false;
    this.notificationService.showSuccess('Logged out successfully.');
    // Close mobile menu if open
    this.menuOpen = false;
    this.groceryListDropdownOpen = false;
    // Navigate to home page
    this.router.navigate(['/']);
  }
}
