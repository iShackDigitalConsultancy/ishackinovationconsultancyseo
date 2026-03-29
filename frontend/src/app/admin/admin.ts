import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
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

          <!-- Tabs Navigation -->
          <div class="flex gap-4 mb-8">
            <button 
              (click)="setActiveTab('metrics')" 
              [ngClass]="activeTab === 'metrics' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-400 border-white/10 hover:text-white hover:border-white/20'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                Financial Metrics
              </span>
            </button>
            <button 
              (click)="setActiveTab('agents')" 
              [ngClass]="activeTab === 'agents' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-400 border-white/10 hover:text-white hover:border-white/20'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                AI Observation Deck
              </span>
            </button>
          </div>

        <!-- Metrics View -->
        <div *ngIf="activeTab === 'metrics'">
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

        <!-- AI Agent War Room View -->
        <div *ngIf="activeTab === 'agents'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left Column: Campaigns & Tasks -->
          <div class="col-span-1 space-y-6">
            <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div class="p-5 border-b border-white/5 bg-slate-900/50 flex flex-col gap-3">
                <div class="flex justify-between items-center">
                  <h2 class="text-white font-bold flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    Active AI Campaigns
                  </h2>
                </div>
                <!-- Launch Input -->
                <div class="flex gap-2">
                  <input #campDomain type="text" placeholder="e.g. ishack.co.za" class="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors">
                  <select #campTier class="bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-primary transition-colors">
                    <option value="basic">Growth Start ($499)</option>
                    <option value="pro" selected>Domination Pro ($899)</option>
                    <option value="enterprise">Enterprise Elite ($1499)</option>
                  </select>
                  <button (click)="startCampaign(campDomain.value, campTier.value); campDomain.value=''" class="bg-primary hover:bg-blue-600 px-3 py-1.5 rounded-lg text-white font-bold text-sm shadow-md transition-colors whitespace-nowrap">Deploy</button>
                </div>
              </div>
              <div class="p-5 space-y-4">
                <div *ngIf="campaigns.length === 0" class="text-slate-500 text-sm italic">No active campaigns running.</div>
                <div *ngFor="let cam of campaigns" class="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-colors">
                  <div class="flex justify-between">
                    <div class="font-bold text-white">{{ cam.client_domain }}</div>
                    <div class="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 shadow-sm">{{ cam.status }}</div>
                  </div>
                  <div class="text-xs text-slate-400 mt-2 font-medium">Agency: <span class="text-slate-300">{{ cam.agency_name }}</span></div>
                </div>
              </div>
            </div>

            <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div class="p-5 border-b border-white/5 bg-slate-900/50">
                <h2 class="text-white font-bold flex items-center gap-2">
                  <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  Orchestration Tasks
                </h2>
              </div>
              <div class="p-5 space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div *ngIf="agentTasks.length === 0" class="text-slate-500 text-sm italic">Task queue is empty.</div>
                <div *ngFor="let task of agentTasks" class="bg-slate-950 rounded-xl p-3 border border-white/5">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10">{{ task.assigned_agent }}</span>
                    <span class="text-[10px] uppercase tracking-wide font-bold" [ngClass]="{'text-green-400': task.status === 'completed', 'text-yellow-400': task.status === 'pending'}">{{ task.status }}</span>
                  </div>
                  <div class="text-sm text-white font-medium">{{ task.task_type }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Terminal Logs -->
          <div class="col-span-1 lg:col-span-2">
            <div class="bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden h-[850px] flex flex-col relative">
              
              <!-- Mac Terminal Header -->
              <div class="bg-[#161B22] p-3 flex items-center border-b border-white/5 z-10 relative">
                <div class="flex gap-2 mr-4">
                  <div class="w-3 h-3 rounded-full bg-red-500/80 border border-red-500"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500/80 border border-green-500"></div>
                </div>
                <div class="text-xs text-slate-400 font-mono tracking-wider mx-auto bg-black/20 px-4 py-1 rounded-md border border-white/5">swarm-agent-logs ~ zsh</div>
              </div>

              <!-- Live Memory Stream -->
              <div class="p-6 font-mono text-sm overflow-y-auto flex-1 space-y-5 custom-scrollbar bg-gradient-to-b from-[#0D1117] to-[#0A0D12]">
                <div *ngIf="agentLogs.length === 0" class="text-slate-500 italic">Waiting for agent network to initialize...</div>
                
                <div *ngFor="let log of agentLogs" class="animate-fade-in group">
                  <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span>[{{ log.created_at | date:'HH:mm:ss' }}]</span>
                    <span class="text-blue-400 font-bold border border-blue-400/20 bg-blue-400/10 px-1.5 rounded">{{ log.agent_name }}</span>
                    <span class="text-slate-600">to</span>
                    <span class="text-accent underline decoration-accent/30 decoration-dashed">camp_{{ log.campaign_id }}</span>
                  </div>
                  <div class="pl-3 border-l-2 border-white/10 ml-2 py-1 space-y-1.5 group-hover:border-primary/50 transition-colors">
                    <div class="text-emerald-400">
                      <span class="opacity-50 select-none mr-2">➜</span>{{ log.action_taken }}
                    </div>
                    <div class="text-slate-400 bg-white/5 p-2 rounded border border-white/5 font-sans italic text-[13px] shadow-inner">
                      "{{ log.thought_process }}"
                    </div>
                  </div>
                </div>
              </div>

              <!-- Commands Footer -->
              <div class="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between z-10 relative">
                <div class="flex items-center text-sm font-mono text-slate-400">
                  <span class="text-primary mr-2">❯</span> 
                  <span class="animate-pulse">_</span>
                </div>
                <div class="flex gap-2">
                  <button (click)="forceVeraReport()" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-white/10 transition-colors">man run_vera_sharp</button>
                  <button (click)="forcePmHeartbeat()" class="text-xs bg-primary hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded shadow-lg transition-colors">force pm_heartbeat</button>
                </div>
              </div>

            </div>
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
  
  // Observation Deck State
  activeTab: 'metrics' | 'agents' = 'metrics';
  campaigns: any[] = [];
  agentTasks: any[] = [];
  agentLogs: any[] = [];

  ngOnInit() {
    this.fetchMetrics();
    // Poll logs every 15s to make it feel alive
    setInterval(() => {
      if (this.activeTab === 'agents') {
        this.fetchAgentData();
      }
    }, 15000);
  }

  setActiveTab(tab: 'metrics' | 'agents') {
    this.activeTab = tab;
    if (tab === 'agents') {
      this.fetchAgentData();
    }
  }

  getHeaders() {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token') || '';
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchMetrics() {
    this.http.get<any>(`${environment.apiUrl}/admin/metrics`, { headers: this.getHeaders() }).subscribe({
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

  fetchAgentData() {
    const headers = this.getHeaders();
    
    this.http.get<any[]>(`${environment.apiUrl}/admin/campaigns`, { headers }).subscribe(data => this.campaigns = data);
    this.http.get<any[]>(`${environment.apiUrl}/admin/agent-tasks`, { headers }).subscribe(data => this.agentTasks = data);
    this.http.get<any[]>(`${environment.apiUrl}/admin/agent-logs`, { headers }).subscribe(data => this.agentLogs = data);
  }

  forcePmHeartbeat() {
    if (confirm("Force an off-schedule execution of the Project Manager AI?")) {
      this.http.post(`${environment.apiUrl}/admin/sandbox/trigger-pm`, {}, { headers: this.getHeaders() }).subscribe({
        next: (res: any) => alert(res.message),
        error: (err) => alert('Failed to trigger PM Agent.')
      });
      setTimeout(() => this.fetchAgentData(), 2000);
    }
  }

  forceVeraReport() {
    if (confirm("Force Vera Sharp to construct and send the daily digest email right now?")) {
      this.http.post(`${environment.apiUrl}/admin/sandbox/trigger-vera`, {}, { headers: this.getHeaders() }).subscribe({
        next: (res: any) => alert(res.message),
        error: (err) => alert('Failed to trigger Vera Sharp.')
      });
    }
  }

  startCampaign(domain: string, tier: string) {
    if (!domain) return alert("Please enter a domain");
    
    this.http.post(`${environment.apiUrl}/admin/sandbox/start-campaign`, { domain, tier }, { headers: this.getHeaders() }).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.fetchAgentData();
      },
      error: (err) => alert('Failed to deploy campaign.')
    });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    this.router.navigate(['/']);
  }
}
