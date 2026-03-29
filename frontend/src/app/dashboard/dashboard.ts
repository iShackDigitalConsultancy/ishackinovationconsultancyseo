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
          
          <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div class="flex items-center justify-between mb-8">
              <h1 class="text-3xl font-extrabold text-slate-900">Dashboard</h1>
            </div>
            
            <div *ngIf="error" class="mb-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium shadow-sm flex items-center justify-between">
              {{ error }}
              <button *ngIf="error.includes('Upgrade')" class="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-600 transition-colors">Upgrade to Paid ($299/mo)</button>
            </div>

            <!-- Metrics -->
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <div class="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl">
                <div class="p-5">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                      <svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-medium text-slate-500 truncate">Total Active Domains</dt>
                        <dd class="flex items-baseline">
                          <div class="text-2xl font-bold text-slate-900">{{ sites.length }}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl">
                <div class="p-5">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
                      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-medium text-slate-500 truncate">SaaS Orchestrations</dt>
                        <dd class="flex items-baseline">
                          <div class="text-2xl font-bold text-slate-900">{{ campaigns.length }} Active</div>
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
            <div *ngIf="sites.length === 0" class="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              <h3 class="mt-4 text-lg font-bold text-slate-900">No client sites connected</h3>
              <p class="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Get started by connecting your first client website so our AI can begin the continuous SEO audit process.</p>
            </div>

            <!-- Combined Matrix State -->
            <div *ngIf="sites.length > 0 || campaigns.length > 0" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-12">
              <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 class="font-bold text-slate-800">Targeted Tracking Matrix</h3>
              </div>
              <ul class="divide-y divide-slate-200">
                <!-- Campaigns Loop -->
                <li *ngFor="let cam of campaigns" class="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                   <div>
                     <p class="font-bold text-slate-900 text-lg flex items-center gap-2">
                       <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                       {{ cam.client_domain }}
                     </p>
                     <p class="text-xs font-mono text-slate-500 mt-1">Tier: <span class="text-blue-600 font-bold uppercase">{{ cam.package_tier }}</span> | Orchestration: <span class="text-green-600 font-bold uppercase">{{ cam.status }}</span></p>
                   </div>
                   <button class="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-slate-800 transition-colors text-sm border border-slate-700" [routerLink]="['/agent', cam.client_domain]">
                     Live AI Observation
                   </button>
                </li>
                
                <!-- Sub-Sites OpenClaw loop -->
                <li *ngFor="let site of sites" class="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between bg-slate-50/30">
                   <div>
                     <p class="font-bold text-slate-700 text-base flex items-center gap-2">
                       <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       {{ site.url }}
                     </p>
                     <p class="text-xs font-medium text-slate-400 mt-1">Free Tier SEO Scan | Status: <span class="capitalize" [ngClass]="{'text-orange-500 font-bold': site.status === 'pending', 'text-green-500 font-bold': site.status === 'completed'}">{{ site.status }}</span></p>
                   </div>
                   <button class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-100 transition-colors text-sm">
                     View SEO Report
                   </button>
                </li>
              </ul>
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

  sites: any[] = [];
  campaigns: any[] = [];
  
  checkoutUrl = '';
  checkoutTier = 'pro';
  promoCode = '';
  isProcessing = false;
  
  error = '';

  ngOnInit() {
    this.fetchSites();
  }

  getHeaders() {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token') || '';
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchSites() {
    this.http.get<any>(`${environment.apiUrl}/sites`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.sites = data.sites || [];
        this.campaigns = data.campaigns || [];
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
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
          this.fetchSites(); // Reload matrices
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
