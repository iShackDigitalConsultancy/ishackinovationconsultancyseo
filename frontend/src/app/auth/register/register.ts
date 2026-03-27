import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div class="flex justify-center flex-col items-center">
          <div class="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4 cursor-pointer" routerLink="/">IS</div>
          <h2 class="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Create an agency account
          </h2>
          <p class="mt-2 text-center text-sm text-slate-600">
            Or
            <a routerLink="/login" class="font-medium text-primary hover:text-blue-500 transition-colors">
              sign in to your existing account
            </a>
          </p>
        </div>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div class="glass-panel py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/50 bg-white/60 backdrop-blur-xl">
          
          <div *ngIf="error" class="mb-4 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium">
            {{ error }}
          </div>
          
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            
            <div>
              <label for="agencyName" class="block text-sm font-medium text-slate-700"> Agency Name </label>
              <div class="mt-1">
                <input id="agencyName" name="agencyName" type="text" required [(ngModel)]="agencyName" [disabled]="loading" class="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white/70 transition-all disabled:opacity-50">
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-slate-700"> Email address </label>
              <div class="mt-1">
                <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email" [disabled]="loading" class="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white/70 transition-all disabled:opacity-50">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700"> Password </label>
              <div class="mt-1">
                <input id="password" name="password" type="password" autocomplete="new-password" required [(ngModel)]="password" [disabled]="loading" class="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white/70 transition-all disabled:opacity-50">
              </div>
            </div>

            <div>
              <button type="submit" [disabled]="loading" class="relative overflow-hidden w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
                <span *ngIf="!loading">Register & Pay ($299/mo)</span>
                <span *ngIf="loading">Processing...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class Register {
  private http = inject(HttpClient);
  
  agencyName = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  onSubmit() {
    this.error = '';
    
    if(!this.agencyName || !this.email || !this.password) {
      this.error = 'Please fill out all fields.';
      return;
    }

    this.loading = true;

    this.http.post<any>(`${environment.apiUrl}/auth/register`, {
      agencyName: this.agencyName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        // Store token locally if you are using it right away
        if(response.token) {
          localStorage.setItem('auth_token', response.token);
        }

        if (response.authorizationUrl) {
          // Redirect to Paystack Checkout if available
          window.location.href = response.authorizationUrl;
        } else {
          // Fallback if payment is not set up securely
          window.location.href = '/dashboard';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to register account. Please try again.';
      }
    });
  }
}
