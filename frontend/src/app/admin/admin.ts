import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-950 font-sans text-slate-100 p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10">IS</div>
            <div>
              <h1 class="text-3xl font-extrabold text-white tracking-tight">Super Admin Global Control</h1>
              <p class="text-slate-400">iShack Innovation Consultancy • Financials & Metrics</p>
            </div>
          </div>
          <button (click)="logout()" class="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-xl text-sm font-bold transition-all">Exit to Sandbox</button>
        </div>

        <div *ngIf="error" class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 font-medium">
          {{ error }}
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Monthly Recurring Revenue (MRR)</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">
              <span class="text-primary text-2xl mr-1">R</span>{{ metrics?.mrr | number }}
            </h3>
          </div>

          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Paid Agency Subscriptions</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ metrics?.paidAgencies }}</h3>
          </div>

          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Free Tier Agencies</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ (metrics?.totalAgencies || 0) - (metrics?.paidAgencies || 0) }}</h3>
          </div>

          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Total Client Sites Connected</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ metrics?.totalSites }}</h3>
          </div>

        </div>

        <!-- Agencies Table -->
        <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div class="p-6 border-b border-white/5">
            <h2 class="text-xl font-bold text-white">Registered Digital Agencies</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-300">
              <thead class="text-xs text-slate-500 uppercase bg-slate-950 border-b border-white/5">
                <tr>
                  <th scope="col" class="px-6 py-4">Agency Name</th>
                  <th scope="col" class="px-6 py-4">Email</th>
                  <th scope="col" class="px-6 py-4">Status</th>
                  <th scope="col" class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let agency of recentAgencies" class="hover:bg-white/[0.02] transition-colors">
                  <td class="px-6 py-4 font-medium text-white">{{ agency.agency_name }}</td>
                  <td class="px-6 py-4">{{ agency.email }}</td>
                  <td class="px-6 py-4">
                    <span *ngIf="agency.role === 'paid'" class="bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Paid ($299/mo)</span>
                    <span *ngIf="agency.role === 'free'" class="bg-slate-500/10 text-slate-400 border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Free Tier</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="text-primary hover:text-blue-400 font-medium font-bold transition-colors">Manage</button>
                  </td>
                </tr>
                <tr *ngIf="!recentAgencies || recentAgencies.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500 font-medium">No agencies registered yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  metrics: any = null;
  recentAgencies: any[] = [];
  error = '';

  ngOnInit() {
    this.fetchMetrics();
  }

  fetchMetrics() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/admin/metrics`, { headers }).subscribe({
      next: (data) => {
        this.metrics = data.metrics;
        this.recentAgencies = data.recentAgencies;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load global metrics. Ensure you have Super Admin privileges.';
        }
      }
    });
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/']);
  }
}
