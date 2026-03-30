import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="h-screen flex overflow-hidden bg-slate-50 font-sans text-slate-900">
      
      <!-- Sidebar -->
      <div class="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 relative z-20 shadow-2xl">
        <div class="h-16 flex items-center px-6 bg-slate-950 border-b border-white/5">
          <div class="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md mr-3 cursor-pointer" routerLink="/">IS</div>
          <span class="text-white font-bold tracking-wide">Agency Portal</span>
        </div>
        
        <div class="flex-1 overflow-y-auto py-4">
          <nav class="space-y-1 px-3">
            <a href="#" class="bg-primary/10 text-white group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl border border-primary/20">
              <svg class="text-primary mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Overview
            </a>
          </nav>
        </div>
        
        <div class="p-4 border-t border-white/10">
          <button (click)="logout()" class="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <svg class="mr-3 h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign out
          </button>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col relative z-0 overflow-y-auto">
        <main class="flex-1 relative z-0 focus:outline-none">
          
          <!-- Payment Pending Lock Screen -->
          <div *ngIf="paymentStatus === 'pending'" class="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[80vh]">
            <div class="bg-amber-100 text-amber-700 p-6 rounded-full mb-6 shadow-sm border border-amber-200">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h1 class="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Activate Your Subscription to Proceed</h1>
            <p class="text-lg text-slate-600 mb-8 max-w-xl">Your iShack AEO Agency account is registered. Protect your margins and unlock autonomous AI SEO by finalizing your Paystack subscription.</p>
            
            <div class="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg">
               <h3 class="font-bold text-slate-800 text-xl border-b border-slate-100 pb-4 mb-6">Complete Checkout</h3>
               <button (click)="retrySubscription()" [disabled]="isProcessing" class="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
                 <span *ngIf="isProcessing">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 </span>
                 <span *ngIf="!isProcessing">Finalize Secure Payment &rarr;</span>
               </button>
               <p class="text-xs text-slate-500 font-medium mt-4">Payments are secured globally via Visa/MasterCard through Paystack.</p>
               <div *ngIf="error" class="mt-4 text-red-600 text-sm font-bold">{{ error }}</div>
            </div>
          </div>

          <!-- Active Dashboard Matrices -->
          <div *ngIf="paymentStatus !== 'pending'" class="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div class="flex items-center justify-between mb-8">
              <h1 class="text-3xl font-extrabold text-slate-900" [style.color]="branding.brand_color">Client Operations Center</h1>
              <img *ngIf="branding.brand_logo_url" [src]="branding.brand_logo_url" class="h-10 object-contain rounded drop-shadow" alt="Brand Logo">
            </div>
            
            <div *ngIf="error" class="mb-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium shadow-sm flex items-center justify-between">
              {{ error }}
            </div>

            <!-- Metrics -->
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
              <div class="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl relative overflow-hidden group">
                <div class="absolute inset-0 opacity-10" [style.background-color]="branding.brand_color"></div>
                <div class="p-5 relative z-10">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                      <svg class="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-bold text-slate-500 truncate uppercase tracking-wider">Active Campaigns</dt>
                        <dd class="flex items-baseline">
                          <div class="text-3xl font-extrabold text-slate-900">{{ campaigns.length }}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl relative">
                <div class="p-5">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 bg-green-50 rounded-lg p-3 border border-green-100">
                      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-bold text-slate-500 truncate uppercase tracking-wider">Organic Execution Loop</dt>
                        <dd class="flex items-baseline">
                          <div class="text-xl font-bold text-green-600">Active & Indexing</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Deploy Checkout System -->
            <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-8">
              <div class="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 class="text-lg font-bold text-slate-900">Deploy Target Campaign</h3>
                <p class="text-sm text-slate-500">Inject a domain and securely checkout via Paystack to activate our autonomous agents.</p>
              </div>
              <div class="p-6 flex flex-col md:flex-row gap-4 items-center bg-white">
                <div class="w-full flex-1">
                  <input type="url" [(ngModel)]="checkoutUrl" placeholder="https://client-website.com" class="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-slate-50 transition-all font-mono">
                </div>
                <select [(ngModel)]="checkoutTier" class="w-full md:w-56 px-4 py-3 border border-slate-300 rounded-xl shadow-sm text-slate-700 font-medium focus:outline-none focus:ring-primary sm:text-sm bg-slate-50 transition-all">
                  <option value="basic">Growth Start ($499)</option>
                  <option value="pro">Domination Pro ($899)</option>
                  <option value="enterprise">Enterprise Elite ($1499)</option>
                </select>
                <input type="text" [(ngModel)]="promoCode" placeholder="Promo Code (Optional)" class="w-full md:w-48 px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-slate-50 transition-all uppercase">
                <button (click)="deployCampaign()" [disabled]="!checkoutUrl || isProcessing" class="w-full md:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md truncate flex items-center justify-center gap-2">
                  <span *ngIf="isProcessing">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </span>
                  <span *ngIf="!isProcessing && !promoCode">Paystack Checkout &rarr;</span>
                  <span *ngIf="!isProcessing && promoCode" class="text-pink-400">Redeem VIP Bypass</span>
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="campaigns.length === 0" class="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              <h3 class="mt-4 text-lg font-bold text-slate-900">No AI campaigns deployed</h3>
              <p class="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Deploy a target domain above to initialize the autonomous execution cluster.</p>
            </div>

            <!-- Proof of Work Matrix State -->
            <div *ngIf="campaigns.length > 0" class="space-y-8 mb-12">
              
              <!-- Map each Active Campaign to an ROI Card -->
              <div *ngFor="let cam of campaigns" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 class="font-black text-slate-900 text-xl flex items-center gap-2">
                       <svg class="w-5 h-5" [style.color]="branding.brand_color" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      {{ cam.client_domain }}
                    </h3>
                    <p class="text-xs font-mono text-slate-500 mt-1 uppercase font-bold tracking-wider">
                      Tier: <span [style.color]="branding.brand_color">{{ cam.package_tier }}</span> | 
                      Engine Status: <span class="text-green-500">{{ cam.status }}</span>
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{{ cam.completed_tasks?.length || 0 }} Operations Complete</span>
                  </div>
                </div>
                
                <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  <!-- Left: Telemetry & Traffic -->
                  <div class="col-span-1 border-r border-slate-100 pr-0 lg:pr-8 space-y-6">
                    <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Live Analytics</h4>
                    
                    <div *ngIf="!cam.live_metrics" class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                      <p class="text-sm text-slate-500 font-medium">Analytics Engine Synchronizing...</p>
                    </div>
                    
                    <div *ngIf="cam.live_metrics" class="space-y-4">
                      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span class="text-sm text-slate-600 font-medium">Organic Traffic:</span>
                        <span class="text-lg font-bold text-slate-900">{{ cam.live_metrics.organic_traffic | number }}</span>
                      </div>
                      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span class="text-sm text-slate-600 font-medium">Ranked Keywords:</span>
                        <span class="text-lg font-bold text-slate-900">{{ cam.live_metrics.organic_keywords | number }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-600 font-medium">Domain Authority:</span>
                        <span class="text-lg font-bold text-slate-900">{{ cam.live_metrics.domain_rating }} <span class="text-xs text-slate-400 font-normal">DR</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Right: Finalized Agent Payloads (Proof of Work) -->
                  <div class="col-span-1 lg:col-span-2 space-y-4">
                    <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider">SEO Execution Log</h4>
                    
                    <div *ngIf="cam.completed_tasks?.length === 0" class="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                      Agents are currently formulating mapping. Operational log will output here when Phase 1 concludes.
                    </div>
                    
                    <div *ngFor="let task of cam.completed_tasks" class="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                      <div class="flex justify-between items-start mb-2">
                        <span class="text-sm font-extrabold text-slate-900" [style.color]="branding.brand_color">{{ task.task_type }}</span>
                        <span class="text-xs text-slate-400 font-mono">{{ task.completed_at | date:'short' }}</span>
                      </div>
                      <!-- Truncated JSON Payload -->
                      <pre class="text-xs text-slate-600 font-mono bg-white border border-slate-200 p-3 rounded-lg overflow-x-auto shadow-inner group-hover:border-slate-300 transition-colors">{{ task.result_payload | json }}</pre>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  `
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  campaigns: any[] = [];
  branding: any = { brand_color: '#007bff', brand_logo_url: '' };
  paymentStatus: 'pending' | 'active' | 'suspended' = 'active'; // Default active until load
  
  checkoutUrl = '';
  checkoutTier = 'pro';
  promoCode = '';
  isProcessing = false;
  
  error = '';

  ngOnInit() {
    this.fetchPortalData();
  }

  getHeaders() {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token') || '';
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchPortalData() {
    this.http.get<any>(`${environment.apiUrl}/client/portal-data`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.campaigns = data.campaigns || [];
        this.branding = data.branding || { brand_color: '#007bff' };
        this.paymentStatus = data.paymentStatus || 'pending';
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  retrySubscription() {
    this.error = '';
    this.isProcessing = true;
    
    // Attempt standard proxy charge attempt
    this.http.post<any>(`${environment.apiUrl}/payments/initialize`, { 
        domain: 'saas_onboarding_retry', 
        tier: 'agency' 
      }, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          if (res.authorization_url && typeof window !== 'undefined') {
             window.location.href = res.authorization_url;
          }
        },
        error: (err) => {
          this.isProcessing = false;
          this.error = 'Unable to launch Paystack gateway. Please contact support.';
        }
    });
  }

  deployCampaign() {
    if (!this.checkoutUrl) return;
    this.error = '';
    this.isProcessing = true;

    if (this.promoCode && this.promoCode.trim().length > 0) {
      // Promo Override Engine
      this.http.post<any>(`${environment.apiUrl}/payments/promo-redeem`, { 
        domain: this.checkoutUrl, 
        tier: this.checkoutTier, 
        promoCode: this.promoCode 
      }, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          alert('Promo Redeemed! VIP Target URL Deployed.');
          this.checkoutUrl = '';
          this.promoCode = '';
          this.fetchPortalData(); // Reload matrices
        },
        error: (err) => {
          this.isProcessing = false;
          this.error = err.error?.error || 'Invalid Promo Code.';
        }
      });
    } else {
      // Native Paystack Checkout Matrix
      this.http.post<any>(`${environment.apiUrl}/payments/initialize`, { 
        domain: this.checkoutUrl, 
        tier: this.checkoutTier 
      }, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          // HTTP Redirect Window strictly to the Paystack Payment Gateway Tunnel
          if (res.authorization_url && typeof window !== 'undefined') {
             window.location.href = res.authorization_url;
          }
        },
        error: (err) => {
          this.isProcessing = false;
          this.error = err.error?.error || 'Paystack Gateway Error.';
        }
      });
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    this.router.navigate(['/']);
  }
}
