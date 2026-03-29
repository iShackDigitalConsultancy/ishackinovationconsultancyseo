import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
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
              (click)="setActiveTab('clients')" 
              [ngClass]="activeTab === 'clients' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-400 border-white/10 hover:text-white hover:border-white/20'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Client OS
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
            <button 
              (click)="setActiveTab('crm')" 
              [ngClass]="activeTab === 'crm' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-400 border-white/10 hover:text-white hover:border-white/20'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Campaign Portfolio CRM
              </span>
            </button>
            <button 
              (click)="setActiveTab('urls')" 
              [ngClass]="activeTab === 'urls' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-400 border-white/10 hover:text-white hover:border-white/20'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                Targeted URLs
              </span>
            </button>
            <button 
              (click)="setActiveTab('settings')" 
              [ngClass]="activeTab === 'settings' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-400 border-white/10 hover:text-white hover:border-white/20'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                System & Billing
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

        </div>

        <!-- Client OS View -->
        <div *ngIf="activeTab === 'clients'" class="animate-fade-in space-y-6">
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6 shadow-2xl">
              <div>
                <h2 class="text-2xl font-extrabold text-white flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  Client OS Data Center
                </h2>
                <p class="text-sm text-slate-400 mt-1 font-medium ml-13">Create, modify, and delete comprehensive client profiles underneath the SuperAdmin umbrella.</p>
              </div>
              
              <div class="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-white/5 shadow-inner">
                <div class="flex gap-3">
                  <input #newClientName type="text" placeholder="Agency/Business Name" class="flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors">
                  <input #newClientEmail type="email" placeholder="Master Login Email" class="flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors">
                  <select #newClientRole class="w-40 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors">
                    <option value="free">Free Tier</option>
                    <option value="paid" selected>Paid Subscription</option>
                  </select>
                </div>
                <div class="flex gap-3">
                  <input #newContact type="text" placeholder="POC Name (e.g. John Doe)" class="flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors">
                  <input #newAddress type="text" placeholder="Physical/Billing Address" class="flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors">
                  <button (click)="createClient(newClientName.value, newClientEmail.value, newClientRole.value, newContact.value, newAddress.value); newClientName.value=''; newClientEmail.value=''; newContact.value=''; newAddress.value=''" class="w-40 bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Client
                  </button>
                </div>
              </div>
          </div>

          <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="text-xs text-slate-500 uppercase bg-slate-950 border-b border-white/5 font-bold">
                  <tr>
                    <th scope="col" class="px-6 py-4">Agency / Business Profile</th>
                    <th scope="col" class="px-6 py-4">Contact Person & Info</th>
                    <th scope="col" class="px-6 py-4">Billing Status</th>
                    <th scope="col" class="px-6 py-4">Joined</th>
                    <th scope="col" class="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr *ngFor="let agency of recentAgencies" class="hover:bg-white/[0.02] transition-colors group">
                    <!-- Read Mode -->
                    <ng-container *ngIf="editAgencyId !== agency.id">
                      <td class="px-6 py-4">
                        <div class="font-bold text-white text-base">{{ agency.agency_name }}</div>
                        <div class="text-xs text-slate-500 mt-0.5 truncate max-w-xs" title="{{ agency.address }}">{{ agency.address || 'No physical address' }}</div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-slate-200 font-medium">{{ agency.contact_person || 'No POC' }}</div>
                        <div class="font-mono text-slate-400 text-xs mt-0.5">{{ agency.email }}</div>
                      </td>
                      <td class="px-6 py-4">
                        <span *ngIf="agency.role === 'paid'" class="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Paid ($299/mo)</span>
                        <span *ngIf="agency.role === 'free'" class="bg-slate-500/10 text-slate-400 border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Free Tier</span>
                      </td>
                      <td class="px-6 py-4 text-slate-500 text-xs font-medium">{{ agency.created_at | date:'MMM dd, yyyy' }}</td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button (click)="editAgencyId = agency.id" class="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg" title="Edit Profile">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button (click)="deleteClient(agency.id)" class="text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 p-2 rounded-lg" title="Delete Client">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Edit Mode -->
                    <ng-container *ngIf="editAgencyId === agency.id">
                      <td class="px-6 py-4 space-y-2">
                        <input [(ngModel)]="agency.agency_name" placeholder="Business Name" class="w-full bg-slate-950 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                        <input [(ngModel)]="agency.address" placeholder="HQ Address" class="w-full bg-slate-950 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                      </td>
                      <td class="px-6 py-4 space-y-2">
                        <input [(ngModel)]="agency.contact_person" placeholder="Contact Person" class="w-full bg-slate-950 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                        <input [(ngModel)]="agency.email" type="email" placeholder="Login Email" class="w-full bg-slate-950 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500">
                      </td>
                      <td class="px-6 py-4">
                        <select [(ngModel)]="agency.role" class="w-full bg-slate-950 border border-white/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
                          <option value="free">Free Tier</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td class="px-6 py-4 text-slate-500 text-xs font-medium">{{ agency.created_at | date:'MMM dd, yyyy' }}</td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button (click)="saveClientEdit(agency)" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow">Save</button>
                          <button (click)="editAgencyId = null; fetchMetrics()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded transition-colors">Cancel</button>
                        </div>
                      </td>
                    </ng-container>
                  </tr>
                  <tr *ngIf="!recentAgencies || recentAgencies.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 font-medium italic">No client profiles registered yet.</td>
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
              </div>
              <div class="p-5 space-y-4">
                <div *ngIf="campaigns.length === 0" class="text-center p-6 bg-slate-900 border border-dashed border-white/20 rounded-xl my-2">
                  <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <h3 class="text-white font-bold mb-1 text-sm">No Active Campaigns</h3>
                  <p class="text-slate-400 text-xs">To activate this War Room, you must deploy a Target Domain in the <span class="text-blue-400 font-bold">'Client Portfolio CRM'</span> tab.</p>
                </div>
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
                <div *ngIf="agentTasks.length === 0" class="text-center p-6 bg-slate-950 border border-dashed border-white/10 rounded-xl mt-2">
                  <svg class="w-8 h-8 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  <p class="text-slate-400 text-xs leading-relaxed">Once a campaign is deployed, the <strong>PM Agent</strong> will automatically populate this queue with continuous algorithmic SEO tasks.</p>
                </div>
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
                
                <!-- Blank State Tutorial -->
                <div *ngIf="agentLogs.length === 0" class="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in font-sans">
                  <div class="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-6 shadow-2xl">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 class="text-xl font-bold text-slate-200 mb-3 tracking-wide">Observation Deck is Blank</h3>
                  <p class="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">You are currently looking at the raw neural stream of your AI SEO Agency. To make this terminal come alive, you need to push a target URL into the autonomous network.</p>
                  
                  <div class="bg-[#161B22] border border-white/10 p-5 rounded-2xl text-left text-sm text-slate-400 space-y-4 w-full max-w-md shadow-xl">
                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-blue-500/20">1</div>
                      <p>Navigate to the <strong class="text-white">Client Portfolio CRM</strong> tab.</p>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-blue-500/20">2</div>
                      <p>Select a Client Agency from the dropdown and type in their <strong class="text-white">Target Domain URL</strong>.</p>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-blue-500/20">3</div>
                      <p>Click <strong class="text-primary">Deploy AI Campaign</strong> to ingest the URL.</p>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded bg-green-500/10 text-green-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-green-500/20">4</div>
                      <p>Return to this Deck to watch the <strong class="text-white">Agents begin crawling, researching, and executing their objectives live.</strong></p>
                    </div>
                  </div>
                </div>
                
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

        <!-- Campaign CRM Portfolio View -->
        <div *ngIf="activeTab === 'crm'" class="animate-fade-in">
          <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-6 border-b border-white/5 bg-slate-900/50 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div>
                <h2 class="text-2xl font-extrabold text-white flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  Client Portfolio CRM
                </h2>
                <p class="text-sm text-slate-400 mt-1 font-medium ml-13">Manage MRR, view historical SERP ranking updates, and preview upcoming AI execution hooks.</p>
              </div>
              
              <div class="flex gap-3 bg-slate-950 p-2 rounded-xl border border-white/5 shadow-inner">
                <select #newCampAgency class="w-48 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary transition-colors">
                  <option value="">-- Master Umbrella --</option>
                  <option *ngFor="let ag of recentAgencies" [value]="ag.id">{{ ag.agency_name }}</option>
                </select>
                <input #newCampDomain type="text" placeholder="Target Domain URL" class="w-full lg:w-56 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors">
                <select #newCampTier class="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary transition-colors">
                  <option value="basic">Growth Start ($499)</option>
                  <option value="pro" selected>Domination Pro ($899)</option>
                  <option value="enterprise">Enterprise Elite ($1499)</option>
                </select>
                <button (click)="startCampaign(newCampDomain.value, newCampTier.value, newCampAgency.value); newCampDomain.value=''" class="bg-primary hover:bg-blue-600 px-6 py-2 rounded-lg text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Deploy AI Campaign
                </button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-950 text-xs uppercase tracking-wider font-bold text-slate-400 border-b border-white/10">
                  <tr>
                    <th class="px-6 py-4">Client Domain</th>
                    <th class="px-6 py-4">Agency / Partner</th>
                    <th class="px-6 py-4">Execution Tier</th>
                    <th class="px-6 py-4 text-right">Monthly Revenue</th>
                    <th class="px-6 py-4 text-center">Status</th>
                    <th class="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr *ngIf="campaigns.length === 0">
                    <td colspan="6" class="px-6 py-16">
                      <div class="max-w-3xl mx-auto text-center">
                        <div class="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-800 shadow-2xl flex items-center justify-center mx-auto mb-6">
                          <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <h3 class="text-2xl font-extrabold text-white mb-3">Portfolio is Blank</h3>
                        <p class="text-slate-400 text-base mb-10 max-w-xl mx-auto">This is your Master CRM. Any autonomous AI Campaigns your clients pay for (or that you manually trigger above) will permanently exist here for global monitoring. <strong class="text-white">Let's trigger your first one:</strong></p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                          <div class="bg-slate-900 border border-white/5 p-5 rounded-2xl shadow-lg relative group overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
                            <div class="flex items-center gap-3 mb-3">
                              <div class="w-8 h-8 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center font-mono">1</div>
                              <h4 class="text-white font-bold text-sm">Select Target</h4>
                            </div>
                            <p class="text-slate-400 text-xs leading-relaxed">Use the deployment bar above. Type in a URL like <strong class="text-slate-200">ishackinnovationconsultancy.com</strong>.</p>
                          </div>
                          
                          <div class="bg-slate-900 border border-white/5 p-5 rounded-2xl shadow-lg relative group overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-purple-500/50"></div>
                            <div class="flex items-center gap-3 mb-3">
                              <div class="w-8 h-8 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center font-mono">2</div>
                              <h4 class="text-white font-bold text-sm">Bind Umbrella</h4>
                            </div>
                            <p class="text-slate-400 text-xs leading-relaxed">Map the URL to a specific Agency Client from your <strong class="text-slate-200">'Agencies'</strong> dropdown so billing routes correctly.</p>
                          </div>
                          
                          <div class="bg-slate-900 border border-white/5 p-5 rounded-2xl shadow-lg relative group overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                            <div class="flex items-center gap-3 mb-3">
                              <div class="w-8 h-8 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center font-mono">3</div>
                              <h4 class="text-white font-bold text-sm">Deploy Engine</h4>
                            </div>
                            <p class="text-slate-400 text-xs leading-relaxed">Click Deploy. The system will ingest the domain and instantly strike the autonomous agent workforce natively.</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <ng-container *ngFor="let cam of campaigns">
                    <tr class="hover:bg-white/[0.02] transition-colors cursor-pointer group" (click)="toggleExpand(cam.id)">
                      <td class="px-6 py-5">
                        <div class="font-bold text-white text-base flex items-center gap-2">
                          <svg class="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                          {{ cam.client_domain }}
                        </div>
                        <div class="text-xs text-slate-500 mt-1 font-mono tracking-wider">Started: {{ cam.created_at | date:'MMM dd, yyyy' }}</div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="text-sm text-slate-300 font-medium">{{ cam.agency_name }}</div>
                      </td>
                      <td class="px-6 py-5">
                        <span class="inline-flex items-center px-2.5 py-1 rounded bg-slate-800 text-xs font-bold capitalize border border-white/10"
                              [ngClass]="{'text-blue-400 border-blue-500/30': cam.package_tier === 'pro', 'text-yellow-400 border-yellow-500/30': cam.package_tier === 'enterprise', 'text-slate-300': cam.package_tier === 'basic'}">
                          {{ cam.package_tier }}
                        </span>
                      </td>
                      <td class="px-6 py-5 text-right">
                        <div class="text-lg font-extrabold text-green-400">$ {{ cam.revenue | number }}</div>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                          <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                          {{ cam.status }}
                        </span>
                      </td>
                      <td class="px-6 py-5 text-right">
                        <button class="text-slate-400 hover:text-white transition-colors">
                          <svg class="w-5 h-5 transform transition-transform" [ngClass]="{'rotate-180': expandedCampaign === cam.id}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                      </td>
                    </tr>
                    
                    <!-- Expanded Data Drawer -->
                    <tr *ngIf="expandedCampaign === cam.id" class="bg-black/40 shadow-inner">
                      <td colspan="6" class="px-8 py-6">
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          
                          <!-- Historic Keyword Metrics -->
                          <div class="bg-slate-900 border border-white/10 p-5 rounded-xl">
                            <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                              <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                              Historic Keyword Result Tracking
                            </h3>
                            <div class="space-y-3">
                              <div *ngFor="let kw of cam.historic_metrics?.positionChanges" class="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span class="text-slate-300 font-medium">{{ kw.keyword }}</span>
                                <div class="flex items-center gap-3">
                                  <span class="text-slate-500 line-through text-xs">Pos {{ kw.prev }}</span>
                                  <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                  <span class="font-bold text-white bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30">Pos {{ kw.current }}</span>
                                </div>
                              </div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs">
                              <span class="text-slate-400">Total Organic Keywords: <b class="text-white">{{ cam.historic_metrics?.organicKeywords | number }}</b></span>
                              <span class="text-slate-400">Traffic Value: <b class="text-green-400">$ {{ cam.historic_metrics?.trafficValue | number }}</b></span>
                            </div>
                          </div>

                          <!-- Upcoming Project Tasks -->
                          <div class="bg-slate-900 border border-white/10 p-5 rounded-xl">
                            <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                              <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                              Upcoming Month Asana Tasks Queue
                            </h3>
                            <div class="space-y-2 h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                              <div *ngIf="!cam.tasks || cam.tasks.length === 0" class="text-slate-500 text-xs italic">No execution tasks planned.</div>
                              <div *ngFor="let task of cam.tasks" class="bg-slate-950 p-3 rounded-lg border border-white/5 flex justify-between items-center text-sm">
                                <span class="text-slate-300 font-medium">{{ task.task_type }}</span>
                                <div class="flex items-center gap-3">
                                  <span class="text-[10px] text-slate-500 font-bold uppercase">{{ task.assigned_agent }}</span>
                                  <span class="w-2 h-2 rounded-full" [ngClass]="{'bg-yellow-400': task.status === 'pending', 'bg-green-400': task.status === 'completed', 'bg-blue-400': task.status === 'in-progress'}"></span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        </div>

        <!-- Targeted URLs Master View -->
        <div *ngIf="activeTab === 'urls'" class="animate-fade-in space-y-6">
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-2xl">
            <h2 class="text-2xl font-extrabold text-white flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              </div>
              Global Targeted URIs
            </h2>
            <p class="text-sm text-slate-400 font-medium ml-13 mb-6">Aggregate execution logs and overarching active configurations across every internet zone the AI is maneuvering inside.</p>

            <!-- Global Target URL Injector -->
            <div class="bg-slate-950 p-4 border border-white/5 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center shadow-inner">
              <div class="w-full flex-1">
                <input #globalCampDomain type="text" placeholder="https://new-target-domain.com" class="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors">
              </div>
              <select #globalCampAgency class="w-full md:w-56 bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-pink-500 transition-colors">
                <option value="">-- Master Umbrella --</option>
                <option *ngFor="let ag of recentAgencies" [value]="ag.id">{{ ag.agency_name }}</option>
              </select>
              <select #globalCampTier class="w-full md:w-48 bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-pink-500 transition-colors">
                <option value="basic">Growth Start ($499)</option>
                <option value="pro" selected>Domination Pro ($899)</option>
                <option value="enterprise">Enterprise Elite ($1499)</option>
              </select>
              <button (click)="startCampaign(globalCampDomain.value, globalCampTier.value, globalCampAgency.value); globalCampDomain.value=''" class="w-full md:w-auto bg-pink-600 hover:bg-pink-500 px-8 py-2.5 rounded-lg text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                Track Target URL
              </button>
            </div>
            
            <div class="overflow-x-auto rounded-xl border border-white/5">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="bg-slate-950 text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-white/5">
                  <tr>
                    <th class="px-6 py-4">Targeted URL / Domain</th>
                    <th class="px-6 py-4">Linked Agency</th>
                    <th class="px-6 py-4">Package Scope</th>
                    <th class="px-6 py-4">Current AI Phase</th>
                    <th class="px-6 py-4 text-center">Executed Tasks</th>
                    <th class="px-6 py-4 text-right">Target Active Hooks</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr *ngFor="let target of targetedUrls" class="hover:bg-white/[0.02] transition-colors">
                    <td class="px-6 py-5">
                      <a href="https://{{ target.url }}" target="_blank" class="font-bold text-white text-base hover:text-pink-400 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        {{ target.url }}
                      </a>
                      <div class="text-xs text-slate-500 mt-1 font-mono tracking-wider">Started: {{ target.created_at | date:'MMM dd, yyyy' }}</div>
                    </td>
                    <td class="px-6 py-5">
                      <div class="text-sm text-slate-300 font-medium">{{ target.agency_name }}</div>
                      <div class="text-[10px] text-slate-500 font-mono">ID: {{ target.agency_id }}</div>
                    </td>
                    <td class="px-6 py-5">
                      <span class="inline-flex items-center px-2.5 py-1 rounded bg-slate-800 text-xs font-bold capitalize border border-white/10"
                            [ngClass]="{'text-blue-400 border-blue-500/30': target.package_tier === 'pro', 'text-yellow-400 border-yellow-500/30': target.package_tier === 'enterprise', 'text-slate-300': target.package_tier === 'basic'}">
                        {{ target.package_tier }}
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <div class="text-xs font-bold text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 inline-flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full" [ngClass]="{'bg-blue-400 animate-pulse': target.campaign_status === 'active', 'bg-green-400': target.campaign_status === 'completed'}"></div>
                        {{ target.current_phase || 'Awaiting Initialization' }}
                      </div>
                    </td>
                    <td class="px-6 py-5 text-center">
                      <div class="inline-flex items-center justify-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
                        <span class="text-green-400 font-bold">{{ target.task_completed || 0 }}</span>
                        <span class="text-slate-600">/</span>
                        <span class="text-slate-400 font-bold">{{ target.task_count || 0 }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-5 text-right font-mono text-pink-400 font-bold">
                      <span class="bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20">{{ target.active_hooks || 0 }} hooked</span>
                    </td>
                  </tr>
                  <tr *ngIf="targetedUrls.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 font-medium italic">No active domains mapped.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- System & Billing Settings View -->
        <div *ngIf="activeTab === 'settings'" class="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-6 border-b border-white/5 bg-slate-900/50">
              <h2 class="text-2xl font-extrabold text-white flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                </div>
                Discount & Promo Codes
              </h2>
              <p class="text-sm text-slate-400 mt-1 font-medium ml-13">Generate free-tier bypass execution codes for VIP clients or internal testing networks.</p>
            </div>
            
            <div class="p-6">
              <div class="flex gap-3 mb-6">
                <input #newPromo type="text" placeholder="e.g. VIP-AGENCY-2027" class="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors uppercase font-mono tracking-wider">
                <button (click)="createPromoCode(newPromo.value); newPromo.value=''" class="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl text-white font-bold shadow-md transition-colors flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Generate Free Key
                </button>
              </div>

              <div class="bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                <div *ngIf="promoCodes.length === 0" class="p-6 text-center text-slate-500 italic">No active promo codes available.</div>
                <div *ngFor="let promo of promoCodes" class="p-4 border-b border-white/5 last:border-b-0 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="bg-purple-500/10 text-purple-400 font-mono font-bold tracking-widest px-3 py-1.5 rounded-lg border border-purple-500/20 shadow-sm">{{ promo.code }}</div>
                    <div class="text-xs text-slate-500">Created: {{ promo.created_at | date:'shortDate' }}</div>
                  </div>
                  <button (click)="deletePromoCode(promo.id)" class="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
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
  activeTab: any = 'metrics';
  campaigns: any[] = [];
  agentTasks: any[] = [];
  agentLogs: any[] = [];
  
  // Settings & CRM State
  expandedCampaign: number | null = null;
  promoCodes: any[] = [];
  editAgencyId: number | null = null;
  targetedUrls: any[] = [];

  ngOnInit() {
    this.fetchMetrics();
    // Poll logs every 15s to make it feel alive
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.activeTab === 'agents' || this.activeTab === 'crm') {
          this.fetchAgentData();
        }
      }, 15000);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'agents' || tab === 'crm') {
      this.fetchAgentData();
    }
    if (tab === 'settings') {
      this.fetchPromoCodes();
    }
    if (tab === 'urls') {
      this.fetchTargetedUrls();
    }
  }

  fetchTargetedUrls() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/targeted-urls`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.targetedUrls = data,
      error: (err) => console.error(err)
    });
  }

  toggleExpand(id: number) {
    if (this.expandedCampaign === id) {
      this.expandedCampaign = null;
    } else {
      this.expandedCampaign = id;
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

  startCampaign(domain: string, tier: string, agencyId: string = '') {
    if (!domain) return alert("Please enter a domain");
    
    this.http.post(`${environment.apiUrl}/admin/sandbox/start-campaign`, { domain, tier, agencyId }, { headers: this.getHeaders() }).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.fetchAgentData();
        if (this.activeTab === 'urls') this.fetchTargetedUrls();
      },
      error: (err) => alert('Failed to target URL.')
    });
  }

  createClient(agencyName: string, email: string, role: string, contactPerson: string, address: string) {
    if (!agencyName || !email) return alert('Name and email required');
    this.http.post(`${environment.apiUrl}/admin/agencies`, { agencyName, email, role, contactPerson, address }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert('Client Profile Created!');
        this.fetchMetrics();
      },
      error: (err: any) => alert(err.error?.error || 'Failed to create client')
    });
  }

  saveClientEdit(agency: any) {
    this.http.put(`${environment.apiUrl}/admin/agencies/${agency.id}`, { agencyName: agency.agency_name, email: agency.email, role: agency.role, contactPerson: agency.contact_person, address: agency.address }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.editAgencyId = null;
        this.fetchMetrics();
      },
      error: (err: any) => alert(err.error?.error || 'Failed to update client')
    });
  }

  deleteClient(id: number) {
    if (confirm('CRITICAL WARNING: This will permanently delete the client, ALL their campaigns, and ALL their AI agent execution logs. Proceed?')) {
      this.http.delete(`${environment.apiUrl}/admin/agencies/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => this.fetchMetrics(),
        error: (err: any) => alert(err.error?.error || 'Failed to delete client')
      });
    }
  }

  fetchPromoCodes() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/promo-codes`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.promoCodes = data,
      error: (err) => console.error(err)
    });
  }

  createPromoCode(code: string) {
    if (!code) return;
    this.http.post(`${environment.apiUrl}/admin/promo-codes`, { code }, { headers: this.getHeaders() }).subscribe({
      next: () => this.fetchPromoCodes(),
      error: () => alert('Failed to create promo code. It might already exist.')
    });
  }

  deletePromoCode(id: number) {
    if (confirm('Are you sure you want to delete this promo code?')) {
      this.http.delete(`${environment.apiUrl}/admin/promo-codes/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => this.fetchPromoCodes(),
        error: () => alert('Failed to delete promo code.')
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
