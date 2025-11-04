import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'otp',
    loadComponent: () => import('./otp/otp.component').then(m => m.OTPComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'family-selection',
    loadComponent: () => import('./family-selection/family-selection.component').then(m => m.FamilySelectionComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'my-family',
    loadComponent: () => import('./my-family/my-family.component').then(m => m.MyFamilyComponent)
  },
  {
    path: 'grocery-lists',
    loadComponent: () => import('./grocery-lists/grocery-lists.component').then(m => m.GroceryListsComponent)
  },
  {
    path: 'grocery-lists/:id',
    loadComponent: () => import('./grocery-list-detail/grocery-list-detail.component').then(m => m.GroceryListDetailComponent)
  },
  {
    path: 'create-grocery-list',
    loadComponent: () => import('./create-grocery-list/create-grocery-list.component').then(m => m.CreateGroceryListComponent)
  }
];
