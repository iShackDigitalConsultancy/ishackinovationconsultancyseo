import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
              <p class="text-slate-400">iShack AEO and SEO partner services • Financials & Metrics</p>
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
              (click)="setActiveTab('packages')" 
              [ngClass]="activeTab === 'packages' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-400 border-white/10 hover:text-white hover:border-white/20'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Packages
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
          
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group/card hover:border-white/10 transition-all">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover/card:bg-primary/20 transition-all"></div>
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative flex items-center gap-1.5">
              Monthly Recurring Revenue (MRR)
              <span class="group relative cursor-help text-slate-500 hover:text-slate-300 z-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 text-center font-normal tracking-wide">
                  Aggregated sum of all active package tiers executing continuously via the PM Agent.
                </span>
              </span>
            </p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">
              <span class="text-primary text-2xl mr-1">R</span>{{ metrics?.mrr | number }}
            </h3>
          </div>

          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group/card hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative flex items-center gap-1.5">
              Paid Agency Subscriptions
              <span class="group relative cursor-help text-slate-500 hover:text-slate-300 z-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 text-center font-normal tracking-wide">
                  Agencies containing URLs mapped to an active Package Tier rather than sitting Dormant.
                </span>
              </span>
            </p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ metrics?.paidAgencies }}</h3>
          </div>

          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group/card hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Free Tier Agencies</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ (metrics?.totalAgencies || 0) - (metrics?.paidAgencies || 0) }}</h3>
          </div>

          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group/card hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Total Client Sites Connected</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ metrics?.totalSites }}</h3>
          </div>

        </div>

        <!-- Google Analytics Cards -->
        <div class="mb-6 flex items-center justify-between mt-8">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Google Analytics (30 Days)
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group/card hover:border-white/10 transition-all">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover/card:bg-orange-500/20 transition-all"></div>
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative flex items-center gap-1.5">
              Active Users
              <span class="group relative cursor-help text-slate-500 hover:text-slate-300 z-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 text-center font-normal tracking-wide">
                  Number of unique organic visitors measured by GA4 property hooks over 30 days.
                </span>
              </span>
            </p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ metrics?.googleAnalytics?.activeUsers | number }}</h3>
          </div>
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Total Page Views</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ metrics?.googleAnalytics?.pageViews | number }}</h3>
          </div>
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Bounce Rate</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ metrics?.googleAnalytics?.bounceRate }}%</h3>
          </div>
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <p class="text-slate-400 font-medium text-sm mb-1 z-10 relative">Avg Session Duration</p>
            <h3 class="text-4xl font-extrabold text-white z-10 relative">{{ metrics?.googleAnalytics?.averageSessionDuration }}s</h3>
          </div>
        </div>
        
        <!-- ✨ Vera's Analytics Insights -->
        <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-2xl mb-12">
          <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-white/5 pb-4">
            <div>
              <h2 class="text-2xl font-extrabold text-white flex items-center gap-3">
                <span class="text-3xl">✨</span> Vera's Analytics Insights
              </h2>
              <p class="text-sm text-slate-400 mt-1 font-medium ml-11">Expert AI interpretation of your traffic to improve Conversion Rates.</p>
            </div>
            <button (click)="generateInsights()" [disabled]="isGeneratingInsights" class="bg-orange-500 hover:bg-orange-400 text-slate-900 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-2 whitespace-nowrap" [ngClass]="{'opacity-70 cursor-not-allowed': isGeneratingInsights}">
              <span *ngIf="isGeneratingInsights" class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
              <svg *ngIf="!isGeneratingInsights" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              {{ isGeneratingInsights ? 'Generating AI Strategies...' : 'Generate Traffic & CRO Insights' }}
            </button>
          </div>
          
          <div *ngIf="insights.length === 0 && !isGeneratingInsights" class="text-center text-slate-500 py-8 font-medium italic">
            Click 'Generate Insights' to instruct Vera to analyze your live Google Analytics data and prescribe optimization strategies.
          </div>
          
          <div *ngIf="insights.length > 0" class="space-y-4">
            <div *ngFor="let insight of insights; let i = index" class="bg-slate-950/50 border border-white/5 rounded-xl p-5 flex gap-5 hover:bg-slate-950 transition-colors">
              <div class="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 font-extrabold flex items-center justify-center flex-shrink-0 border border-orange-500/20 text-lg">
                {{ i + 1 }}
              </div>
              <div>
                <h4 class="text-lg font-bold text-white mb-2 tracking-wide">{{ insight.title }}</h4>
                <p class="text-slate-400 text-[15px] leading-relaxed">{{ insight.description }}</p>
              </div>
            </div>
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
                    <th scope="col" class="px-6 py-4">CMS Integration</th>
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
                        <span *ngIf="agency.cms_url" class="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center inline-flex gap-1.5 w-max">
                           <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                           Active Webhooks
                        </span>
                        <span *ngIf="!agency.cms_url" class="bg-slate-800 text-slate-500 border border-white/5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center inline-flex gap-1.5 w-max">Offline</span>
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
                      <td class="px-6 py-4 space-y-2">
                        <input [(ngModel)]="agency.cms_url" placeholder="https://wp-domain.com" class="w-full bg-slate-950 border border-blue-500/30 rounded px-2 py-1 text-xs text-blue-400 focus:outline-none focus:border-blue-500 placeholder-blue-500/50">
                        <div class="flex gap-2">
                          <input [(ngModel)]="agency.cms_username" placeholder="WP User" class="w-1/2 bg-slate-950 border border-blue-500/30 rounded px-2 py-1 text-xs text-blue-400 focus:outline-none focus:border-blue-500 placeholder-blue-500/50">
                          <input [(ngModel)]="agency.cms_password" type="password" placeholder="WP App Pass" class="w-1/2 bg-slate-950 border border-blue-500/30 rounded px-2 py-1 text-xs text-blue-400 focus:outline-none focus:border-blue-500 placeholder-blue-500/50">
                        </div>
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
                    <td colspan="6" class="px-6 py-12 text-center text-slate-500 font-medium italic">No client profiles registered yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- AI Agent War Room View -->
        <div *ngIf="activeTab === 'agents'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">

          <!-- Simple Explanation Banner -->
          <div class="col-span-full bg-blue-900/40 border border-blue-500/30 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6 items-center">
            <div class="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-3xl animate-bounce">🤖</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white mb-2">What am I looking at? What do I need to do?</h2>
              <p class="text-blue-100/80 text-sm leading-relaxed">
                Think of these "Agents" as your automated team of robot employees. They are working 24/7 in the background to improve your clients' Google rankings. They plan strategies, research keywords, and build links entirely on their own!
                <br><br>
                <strong class="text-white">Do you need to do anything here?</strong> Nope! You can just sit back and watch their actual "thoughts" scroll by live in the black Terminal box on the right. 
                The <i>only</i> time they need your help is if a yellow "Awaiting Approvals" box pops up—that just means they want you to double-check their work before they publish it.
              </p>
            </div>
          </div>
          
          <!-- Human-in-the-Loop Override Queue -->
          <div *ngIf="awaitingApprovals.length > 0" class="col-span-full bg-slate-900 border border-yellow-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-2 h-full bg-yellow-500 animate-pulse"></div>
            <div class="flex items-center justify-between mb-4 pl-4">
              <h2 class="text-xl font-extrabold text-white flex items-center gap-3">
                <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Human-in-the-Loop: Awaiting Approvals
              </h2>
              <div class="flex items-center gap-3">
                <span class="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{{ awaitingApprovals.length }} Pending Runbooks</span>
                <button (click)="approveAllTasks()" [disabled]="isApprovingAll" class="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5" [ngClass]="{'opacity-50 cursor-not-allowed': isApprovingAll}">
                  <span *ngIf="isApprovingAll" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <svg *ngIf="!isApprovingAll" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  Accept All
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
              <div *ngFor="let task of awaitingApprovals" class="bg-slate-950/50 border border-white/10 rounded-xl p-4 hover:border-yellow-500/50 transition-colors">
                <div class="text-xs text-yellow-400 font-bold mb-1 tracking-wider uppercase flex justify-between">
                  <span>For: {{ task.client_domain }}</span>
                  <span>Awaiting You</span>
                </div>
                <div class="font-bold text-white mb-2">{{ getTaskTitle(task.task_type) }}</div>
                <div class="text-xs text-blue-200 mb-3 leading-relaxed">{{ getTaskDescription(task.task_type, task.status) }}</div>
                <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2.5 mb-3 flex items-start gap-2">
                  <svg class="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <div>
                    <span class="text-[10px] uppercase font-black tracking-wider text-indigo-400 block mb-0.5">Core Benefit</span>
                    <span class="text-xs text-indigo-200/80 leading-relaxed font-medium">{{ getTaskBenefits(task.task_type, task.status) }}</span>
                  </div>
                </div>
                <div class="text-sm text-slate-400 mb-4 line-clamp-3 bg-[#0a0f18] p-2 rounded border border-white/5 font-mono">
                  <span *ngIf="task.result_payload">{{ task.result_payload | json }}</span>
                  <span *ngIf="!task.result_payload" class="italic opacity-50 flex items-center h-full">Neural payload committed directly to database or target node.</span>
                </div>
                <button (click)="openApprovalModal(task)" class="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  Review & Approve JSON
                </button>
              </div>
            </div>
          </div>

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
                <p class="text-xs text-slate-400 font-normal ml-1 mt-1 tracking-wide leading-relaxed">
                  Websites currently managed by your automated AI workforce. <br>
                  <strong class="text-blue-300">"Completed"</strong> means the AI has finished its task quota for the <i>current billing month</i>. It will automatically reactivate next month!
                </p>
              </div>
              <div class="p-5 space-y-4">
                <div *ngIf="campaigns.length === 0" class="text-center p-6 bg-slate-900 border border-dashed border-white/20 rounded-xl my-2">
                  <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <h3 class="text-white font-bold mb-1 text-sm">No Active Campaigns</h3>
                  <p class="text-slate-400 text-xs">To activate this War Room, you must deploy a Target Domain in the <span class="text-blue-400 font-bold">'Client Portfolio CRM'</span> tab.</p>
                </div>
                <div *ngFor="let cam of campaigns" class="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm hover:shadow-md group relative overflow-hidden" (click)="openHistoryModal(cam)">
                  <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                  <div class="flex justify-between items-start relative z-10">
                    <div class="font-bold text-white group-hover:text-blue-300 transition-colors">{{ cam.client_domain }}</div>
                    <div class="flex flex-col items-end gap-1">
                      <div class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 shadow-sm uppercase font-bold tracking-wider">{{ cam.status }}</div>
                    </div>
                  </div>
                  <div class="text-xs text-slate-400 mt-3 font-medium flex justify-between items-center relative z-10 border-t border-white/5 pt-3">
                    <span>Agency: <span class="text-slate-200">{{ cam.agency_name }}</span></span>
                    <span class="text-blue-400 opacity-80 group-hover:opacity-100 group-hover:-translate-x-1 transition-all flex items-center gap-1 font-bold">
                      View History
                      <svg class="w-3 h-3 group-hover:ml-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div class="p-5 border-b border-white/5 bg-slate-900/50">
                <h2 class="text-white font-bold flex items-center gap-2">
                  <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  Orchestration Tasks
                </h2>
                <p class="text-xs text-slate-400 font-normal ml-1 mt-2 tracking-wide leading-relaxed">
                  A high-level checklist showing what the Project Manager Agent is currently scheduling across all campaigns.
                </p>
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
              <div class="bg-blue-900/20 border-b border-blue-500/20 px-6 py-2 z-10">
                <span class="text-[11px] text-blue-300 font-mono leading-relaxed inline-block">☝️ <strong>Live Terminal:</strong> Read this scrolling black box to watch your autonomous agents "think", query databases, and build algorithms in real-time.</span>
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
              
              <div class="flex flex-col gap-4 bg-slate-950 p-4 rounded-xl border border-white/5 shadow-inner">
                <div class="flex flex-col lg:flex-row gap-3 items-center">
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
                  <select #newCampTerritory class="w-32 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary transition-colors">
                    <option value="us">USA</option>
                    <option value="za">South Africa</option>
                    <option value="uk">UK</option>
                    <option value="au">Australia</option>
                    <option value="ca">Canada</option>
                  </select>
                  <input #newCampGA type="text" placeholder="GA4 Property ID (Optional)" class="w-full lg:w-48 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors">
                </div>
                
                <div class="flex flex-col lg:flex-row gap-3 items-center border-t border-white/5 pt-4">
                  <input #newCampWPUrl type="text" placeholder="WordPress Domain (Optional)" class="w-full lg:flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none focus:border-blue-500 transition-colors">
                  <input #newCampWPUser type="text" placeholder="WP Username" class="w-full lg:flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none focus:border-blue-500 transition-colors">
                  <input #newCampWPPass type="password" placeholder="Application Password" class="w-full lg:flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none focus:border-blue-500 transition-colors">
                  <select #newCampWPStatus class="w-32 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="publish">Publish</option>
                    <option value="draft">Draft</option>
                  </select>
                  <button (click)="startCampaign(newCampDomain.value, newCampTier.value, newCampAgency.value, newCampTerritory.value, newCampGA.value, newCampWPUrl.value, newCampWPUser.value, newCampWPPass.value, newCampWPStatus.value); newCampDomain.value=''; newCampGA.value=''; newCampWPUrl.value=''; newCampWPUser.value=''; newCampWPPass.value=''" class="bg-primary hover:bg-blue-600 px-6 py-2 rounded-lg text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Deploy AI Campaign
                  </button>
                </div>
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
                            <p class="text-slate-400 text-xs leading-relaxed">Use the deployment bar above. Type in a URL like <strong class="text-slate-200">ishackaeo.com</strong>.</p>
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
        <div *ngIf="activeTab === 'urls'" class="animate-fade-in font-sans">
          <div *ngIf="inspectingCampaignId === null">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h1 class="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <svg class="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                Master Umbrella
              </h1>
              <div class="text-slate-400 font-medium">Domination Pro ($899)</div>
            </div>
            
            <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-2xl mb-8">
              <div class="flex flex-col gap-4 mb-6">
                <div class="flex flex-col md:flex-row gap-4">
                  <input #globalCampDomain type="text" placeholder="https://domain.com" class="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none focus:border-pink-500/50 text-white placeholder-slate-600 transition-colors">
                  <select #globalCampTier class="bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none text-white focus:border-pink-500/50 transition-colors">
                    <option value="enterprise">Enterprise Link Map</option>
                    <option value="pro">Pro Velocity</option>
                    <option value="basic">Standard Audit</option>
                  </select>
                  <select #globalCampAgency class="bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none text-white focus:border-pink-500/50 transition-colors min-w-[200px]">
                    <option value="" disabled selected>Link to CRM Parent...</option>
                    <option *ngFor="let ag of recentAgencies" [value]="ag.id">{{ ag.agency_name }}</option>
                  </select>
                  <select #globalCampTerritory class="bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none text-white focus:border-pink-500/50 transition-colors min-w-[120px]">
                    <option value="us">USA</option>
                    <option value="za">South Africa</option>
                    <option value="uk">UK</option>
                  </select>
                  <input #globalCampGA type="text" placeholder="GA Property ID (Optional)" class="w-full md:w-auto bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none text-emerald-400 placeholder-slate-600 focus:border-emerald-500/50 transition-colors max-w-[220px]">
                </div>
                
                <div class="flex flex-col md:flex-row gap-4">
                  <input #globalCampWPUrl type="text" placeholder="WordPress URL (Optional)" class="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none focus:border-pink-500/50 text-white placeholder-slate-600 transition-colors">
                  <input #globalCampWPUser type="text" placeholder="WP Username" class="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none focus:border-pink-500/50 text-white placeholder-slate-600 transition-colors">
                  <input #globalCampWPPass type="password" placeholder="App Password" class="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none focus:border-pink-500/50 text-white placeholder-slate-600 transition-colors">
                  <select #globalCampWPStatus class="bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm tracking-wide focus:outline-none text-white focus:border-pink-500/50 transition-colors min-w-[120px]">
                    <option value="publish">Auto-Publish</option>
                    <option value="draft">Auto-Draft</option>
                  </select>
                  
                  <button (click)="startCampaign(globalCampDomain.value, globalCampTier.value, globalCampAgency.value, globalCampTerritory.value, globalCampGA.value, globalCampWPUrl.value, globalCampWPUser.value, globalCampWPPass.value, globalCampWPStatus.value); globalCampDomain.value=''; globalCampGA.value=''; globalCampWPUrl.value=''; globalCampWPUser.value=''; globalCampWPPass.value=''" class="w-full md:w-auto bg-pink-600 hover:bg-pink-500 px-8 py-2.5 rounded-lg text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                    <svg class="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    Track Target URL
                  </button>
                </div>
              </div>
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
                      <select [ngModel]="target.package_tier" (ngModelChange)="updateTargetPackage(target.campaign_id, $event)" class="bg-slate-800 text-xs font-bold capitalize border border-white/10 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-emerald-500 hover:border-white/20 transition-colors cursor-pointer">
                        <option *ngFor="let p of packages" [value]="p.tier_name">{{ p.tier_name }}</option>
                      </select>
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
                    <td class="px-6 py-5 flex items-center justify-end gap-3 border-none h-full mt-2">
                      <span class="font-mono text-pink-400 font-bold bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20 mr-2">{{ target.active_hooks || 0 }} hooked</span>
                      <button (click)="loadDeepDive(target.campaign_id)" title="Inspect Campaign Deep Dive" class="text-blue-400 p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex items-center justify-center font-bold text-xs mr-2">
                        Inspect
                      </button>
                      <button (click)="deleteTargetUrl(target.campaign_id, target.url)" title="Wipe Database Records" class="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="targetedUrls.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 font-medium italic">No active domains mapped.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SEO Campaign Deep Dive UI Layer -->
          <div *ngIf="inspectingCampaignId !== null && deepDiveData" class="animate-fade-in font-sans pb-12">
             <!-- Deep Dive Header -->
             <div class="flex items-center gap-4 mb-6">
               <button (click)="closeDeepDive()" class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
               </button>
               <div>
                 <h1 class="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                   {{ deepDiveData.campaign.client_domain }}
                   <span class="px-2.5 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-400 font-bold uppercase tracking-wider">Deep Dive</span>
                 </h1>
                 <div class="text-slate-500 text-sm font-medium mt-1">Agency Parent: {{ deepDiveData.campaign.agency_name }}</div>
               </div>
             </div>

             <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
               <!-- 1. Keyword Matrix -->
               <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl relative group/section">
                  <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
                    Keyword Research Matrix
                    <span class="group relative cursor-help text-indigo-500 hover:text-indigo-300 ml-1 z-50">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-56 p-2.5 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 font-normal tracking-wide text-center z-50">
                        Displays the active semantic search vectors prioritized by the AI.
                      </span>
                    </span>
                  </h2>
                  <div class="bg-slate-950 border border-white/5 rounded-lg p-3 text-sm text-slate-400 font-mono mb-4 h-48 overflow-y-auto space-y-3">
                     <div *ngIf="parsedKeywords.length === 0" class="italic text-slate-600">No keyword map generated by PM Agent yet.</div>
                     <div *ngFor="let t of parsedKeywords" class="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-xs flex flex-col gap-2 relative shadow-inner">
                       <div class="flex justify-between items-center font-bold mb-1" [ngClass]="t.task_type.includes('Force') ? 'text-emerald-400' : 'text-indigo-400'">
                          <span>{{ t.task_type }}</span>
                          <span class="text-[10px] text-slate-500 font-mono font-medium">{{ t.created_at | date:'MMM d, h:mm a' }}</span>
                       </div>
                       <div class="text-slate-300 overflow-auto text-xs whitespace-pre-wrap leading-relaxed mt-2 space-y-2">
                          <ng-container *ngIf="formatPayload(t) as pl">
                             <ng-container *ngIf="pl.isArray">
                                <div *ngFor="let item of pl.items" class="bg-indigo-950/50 p-2.5 rounded border border-indigo-500/20 shadow-sm relative pl-8">
                                   <div class="absolute left-3 top-3"><svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
                                   <div class="font-bold text-indigo-100">{{ item.keyword || item.trackedCompetitor || item.suggestedKeyword }}</div>
                                   <div class="text-[11px] text-indigo-300 mt-1" *ngIf="item.intent_mapping || item.notes">{{ item.intent_mapping || item.notes }}</div>
                                </div>
                             </ng-container>
                             <ng-container *ngIf="!pl.isArray">
                                <div class="bg-indigo-950/50 p-2.5 rounded border border-indigo-500/20 shadow-sm relative pl-8">
                                   <div class="absolute left-3 top-3"><svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
                                   <div class="font-bold text-indigo-100">{{ pl.data.keyword || pl.data.trackedCompetitor || pl.data.suggestedKeyword || pl.data.raw || 'Custom Directive' }}</div>
                                   <div *ngIf="pl.data.intent_mapping || pl.data.notes" class="text-[11px] text-indigo-300 mt-1">{{ pl.data.intent_mapping || pl.data.notes }}</div>
                                </div>
                             </ng-container>
                          </ng-container>
                       </div>
                     </div>
                  </div>
                  <div class="flex gap-2">
                     <input #injectKw type="text" placeholder="Suggest new Keyword (ex: 'B2B Software')..." class="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500">
                     <button (click)="deepDiveAction('add_keyword', injectKw.value); injectKw.value=''" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm">Force Inject</button>
                  </div>
               </div>

               <!-- 2. Competitor War Room -->
               <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl relative group/section">
                  <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Competitor War Room
                    <span class="group relative cursor-help text-red-500 hover:text-red-300 ml-1 z-50">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-56 p-2.5 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 font-normal tracking-wide text-center z-50">
                        Live tracking of competitor domain strategies and forced AI competitor hooks.
                      </span>
                    </span>
                  </h2>
                  <div class="bg-slate-950 border border-white/5 rounded-lg p-3 text-sm text-slate-400 font-mono mb-4 h-48 overflow-y-auto space-y-3">
                     <div *ngIf="parsedCompetitors.length === 0" class="italic text-slate-600">No active competitor hooks.</div>
                     <div *ngFor="let t of parsedCompetitors" class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs flex flex-col gap-2 relative shadow-inner">
                       <div class="flex justify-between items-center font-bold mb-1" [ngClass]="t.task_type.includes('Force') ? 'text-orange-400' : 'text-red-400'">
                          <span>
                            <svg class="w-3 h-3 inline pb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"></path></svg> 
                            {{ t.task_type }}
                          </span>
                          <span class="text-[10px] text-slate-500 font-mono font-medium">{{ t.created_at | date:'MMM d, h:mm a' }}</span>
                       </div>
                       <div class="text-slate-300 overflow-auto text-xs whitespace-pre-wrap leading-relaxed mt-2 space-y-2">
                          <ng-container *ngIf="formatPayload(t) as pl">
                             <ng-container *ngIf="pl.isArray">
                                <div *ngFor="let item of pl.items" class="bg-red-950/50 p-2.5 rounded border border-red-500/30 shadow-sm relative pl-8">
                                   <div class="absolute left-3 top-3"><svg class="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
                                   <div class="font-bold text-red-100">{{ item.keyword || item.trackedCompetitor || item.suggestedKeyword }}</div>
                                </div>
                             </ng-container>
                             <ng-container *ngIf="!pl.isArray">
                                <div class="bg-red-950/50 p-2.5 rounded border border-red-500/30 shadow-sm relative pl-8">
                                   <div class="absolute left-3 top-3"><svg class="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
                                   <div class="font-bold text-red-100">{{ pl.data.keyword || pl.data.trackedCompetitor || pl.data.suggestedKeyword || pl.data.raw || 'Custom Directive' }}</div>
                                </div>
                             </ng-container>
                          </ng-container>
                       </div>
                     </div>
                  </div>
                  <div class="flex gap-2">
                     <input #injectComp type="text" placeholder="https://competitor.com..." class="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-red-500">
                     <button (click)="deepDiveAction('add_competitor', injectComp.value); injectComp.value=''" class="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm">Lock Target</button>
                  </div>
               </div>

               <!-- 3. Strategic Backlinking Core -->
               <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col relative group/section">
                  <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    Strategic Backlinking Core
                    <span class="group relative cursor-help text-blue-500 hover:text-blue-300 ml-1 z-50">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-56 p-2.5 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 font-normal tracking-wide text-center z-50">
                        Overrides the PM agent's link strategy with explicit user-defined anchoring priorities.
                      </span>
                    </span>
                  </h2>
                  <p class="text-xs text-slate-400 mb-4">Direct the automated Backlinking Agent by sharing specific keyword phrases to target for outbound acquisition.</p>
                  <div class="flex-1 mb-4">
                     <textarea [(ngModel)]="backlinkKeywords" class="w-full h-40 bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-slate-300 font-mono focus:border-blue-500 focus:outline-none resize-none" placeholder="e.g. CRM Software integration, Data warehousing solutions, Enterprise networking..."></textarea>
                  </div>
                  <button (click)="saveBacklinkDirectives()" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-lg transition-colors text-sm shadow-lg shadow-blue-500/20">Sync Directives to Core</button>
               </div>
             </div>

             <!-- NEW: Live SEMrush Keyword Rankings tracker -->
             <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl mb-8 relative group/section">
                <div class="flex justify-between items-center mb-6">
                   <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
                     <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                     Keyword Trend Analysis
                   </h2>
                   <button (click)="exportKeywordsCSV()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 border border-white/10 shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      CSV
                   </button>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <!-- Targeted Matrix -->
                   <div class="bg-slate-950 border border-indigo-500/20 rounded-xl overflow-hidden text-sm flex flex-col shadow-inner">
                      <div class="bg-indigo-900/40 border-b border-indigo-500/20 p-3 font-bold text-indigo-300 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"></path></svg>
                         Actively Targeted
                      </div>
                      <table class="w-full text-left">
                         <thead class="bg-slate-900 border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
                            <tr>
                               <th class="px-4 py-2 font-medium">Keyword</th>
                               <th class="px-4 py-2 font-medium text-center">Trend (6 Mo)</th>
                               <th class="px-4 py-2 font-medium text-center">Pos</th>
                               <th class="px-4 py-2 font-medium text-right">Vol</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-white/5 text-slate-300">
                            <tr *ngIf="categorizedRankings.targeted.length === 0">
                               <td colspan="4" class="px-4 py-8 text-center italic text-slate-600">No active targets ranking yet.</td>
                            </tr>
                            <tr *ngFor="let kw of categorizedRankings.targeted" class="hover:bg-indigo-500/5 transition-colors">
                               <td class="px-4 py-3 font-bold text-white w-2/5">{{ kw.keyword }}</td>
                               <td class="px-4 py-3 text-center w-1/4">
                                  <svg *ngIf="kw.history && kw.history.length > 1" class="w-16 h-5 overflow-visible mx-auto" [ngClass]="kw.change > 0 ? 'text-emerald-400' : (kw.change < 0 ? 'text-red-400' : 'text-slate-500')" viewBox="0 -2 60 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                     <polyline [attr.points]="getSparkPts(kw.history)"></polyline>
                                  </svg>
                               </td>
                               <td class="px-4 py-3 text-center">
                                  <div class="font-black text-sm" [ngClass]="kw.position <= 10 ? 'text-white' : 'text-slate-400'">{{ kw.position === 100 ? '-' : '#' + kw.position }}</div>
                                  <div class="text-[10px] font-bold mt-0.5" [ngClass]="kw.change > 0 ? 'text-emerald-500' : (kw.change < 0 ? 'text-red-500' : 'text-slate-600')">
                                     {{ kw.change !== 0 && kw.change !== 999 ? (kw.change > 0 ? '▲ ' + kw.change : '▼ ' + -kw.change) : (kw.change === 999 ? 'NEW' : '—') }}
                                  </div>
                               </td>
                               <td class="px-4 py-3 text-right font-mono text-slate-400 text-xs">{{ kw.volume | number }}</td>
                            </tr>
                         </tbody>
                      </table>
                   </div>

                   <!-- Organic Matrix -->
                   <div class="bg-slate-950 border border-white/5 rounded-xl overflow-hidden text-sm flex flex-col shadow-inner">
                      <div class="bg-slate-900 border-b border-white/5 p-3 font-bold text-slate-400 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                         Organic Peripherals (Top 20)
                      </div>
                      <table class="w-full text-left">
                         <thead class="bg-slate-900 border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
                            <tr>
                               <th class="px-4 py-2 font-medium">Keyword</th>
                               <th class="px-4 py-2 font-medium text-center">Trend (6 Mo)</th>
                               <th class="px-4 py-2 font-medium text-center">Pos</th>
                               <th class="px-4 py-2 font-medium text-right">Vol</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-white/5 text-slate-300">
                            <tr *ngIf="categorizedRankings.untargeted.length === 0">
                               <td colspan="4" class="px-4 py-8 text-center italic text-slate-600">No ambient rankings detected.</td>
                            </tr>
                            <tr *ngFor="let kw of categorizedRankings.untargeted" class="hover:bg-white/5 transition-colors">
                               <td class="px-4 py-3 font-bold text-white w-2/5">{{ kw.keyword }}</td>
                               <td class="px-4 py-3 text-center w-1/4">
                                  <svg *ngIf="kw.history && kw.history.length > 1" class="w-16 h-5 overflow-visible mx-auto" [ngClass]="kw.change > 0 ? 'text-emerald-400' : (kw.change < 0 ? 'text-red-400' : 'text-slate-500')" viewBox="0 -2 60 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                     <polyline [attr.points]="getSparkPts(kw.history)"></polyline>
                                  </svg>
                               </td>
                               <td class="px-4 py-3 text-center">
                                  <div class="font-black text-sm" [ngClass]="kw.position <= 10 ? 'text-white' : 'text-slate-400'">{{ kw.position === 100 ? '-' : '#' + kw.position }}</div>
                                  <div class="text-[10px] font-bold mt-0.5" [ngClass]="kw.change > 0 ? 'text-emerald-500' : (kw.change < 0 ? 'text-red-500' : 'text-slate-600')">
                                     {{ kw.change !== 0 && kw.change !== 999 ? (kw.change > 0 ? '▲ ' + kw.change : '▼ ' + -kw.change) : (kw.change === 999 ? 'NEW' : '—') }}
                                  </div>
                               </td>
                               <td class="px-4 py-3 text-right font-mono text-slate-400 text-xs">{{ kw.volume | number }}</td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             <!-- 3. Blog Content & Monthly Reporter Combo -->
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Content Editor -->
                <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col relative group/section">
                   <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> 
                     Onsite Content Drafting Pipeline
                     <span class="group relative cursor-help text-emerald-500 hover:text-emerald-300 ml-1 z-50">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-56 p-2.5 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 font-normal tracking-wide text-center z-50">
                         Live view into the local article generation buffer before CMS distribution.
                       </span>
                     </span>
                   </h2>
                   <div class="flex-1 mb-4">
                      <textarea [(ngModel)]="draftingContent" class="w-full h-48 bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-slate-300 font-mono focus:border-emerald-500 focus:outline-none resize-none" placeholder="Drafting area for SEO optimized blog posts. Auto-saves sync directly to the payload queue."></textarea>
                   </div>
                   <div class="flex items-center gap-3">
                      <select class="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-emerald-500 flex-1">
                        <option value="wp">Push to Custom Client WordPress CMS</option>
                        <option value="medium">Distribute to Medium/Substack</option>
                        <option value="draft">Save Locally as Final Draft</option>
                      </select>
                      <button (click)="deepDiveAction('draft_wordpress_blog', { targetTopic: draftingContent || 'General SGE Strategy' })" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-lg transition-colors text-sm shrink-0 shadow-lg shadow-emerald-500/20">Execute</button>
                   </div>
                </div>

                <!-- Monthly Client Reporter Engine -->
                <div class="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col group/section">
                   <div class="absolute top-0 right-0 p-3 opacity-10">
                     <svg class="w-32 h-32 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zM15 17H9v-2h6v2zm3-4H6v-2h12v2zm0-4H6V7h12v2z"/></svg>
                   </div>
                   <h2 class="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                     <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                     Automated Monthly Report Sync
                     <span class="group relative cursor-help text-yellow-500 hover:text-yellow-300 ml-1 z-50">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-56 p-2.5 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 font-normal tracking-wide text-center z-50">
                         Compiles a Dallmayr-style white-labeled PDF using active system telemetry.
                       </span>
                     </span>
                   </h2>
                   <p class="text-slate-400 text-sm mb-6 relative z-10">Generates a white-labeled, executive summary of all technical SEO metrics pulled securely from backend historic telemetry. Vera Sharp acts as your automated business development analyst.</p>
                   
                   <div class="flex-1 overflow-y-auto bg-slate-950/50 border border-white/5 rounded-xl p-4 text-sm text-slate-300 font-mono relative z-10 whitespace-pre-wrap">
                     <div *ngIf="!deepDiveReport" class="flex flex-col items-center justify-center h-full text-slate-500 opacity-50 space-y-3">
                       <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                       <span>Awaiting Vera's Compilation</span>
                     </div>
                     <span *ngIf="deepDiveReport">{{ deepDiveReport }}</span>
                   </div>
                   
                   <div class="mt-4 flex gap-3 relative z-10">
                     <button (click)="deepDiveAction('generate_report', deepDiveData.metrics)" class="flex-1 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-extrabold px-6 py-2.5 rounded-lg transition-transform hover:-translate-y-0.5 shadow-lg shadow-yellow-500/20 active:scale-95 text-sm flex justify-center items-center gap-2">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                       Synthesize
                     </button>
                     <button (click)="generateVeraPDF()" *ngIf="deepDiveReport" class="flex-1 bg-white hover:bg-slate-200 text-slate-900 font-extrabold px-6 py-2.5 rounded-lg transition-colors shadow-lg active:scale-95 text-sm flex justify-center items-center gap-2">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       Export High-Fidelity PDF
                     </button>
                   </div>
                </div>
             </div>

             <!-- 4. Project Intelligence Log -->
             <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl mt-6 group/section">
                <div class="flex justify-between items-center mb-4 relative z-10">
                   <h2 class="text-lg font-bold text-white flex items-center gap-2">
                     <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
                     Project Intelligence Log
                     <span class="group relative cursor-help text-cyan-500 hover:text-cyan-300 ml-1 z-50">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2.5 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 font-normal tracking-wide text-center z-50">
                         Complete forensic timeline of every AI agent action, thought-process, and exact chronological execution timestamps.
                       </span>
                     </span>
                   </h2>
                   <button (click)="exportLogsCSV()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 border border-white/10 shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Download CSV Log
                   </button>
                </div>
                <div class="bg-slate-950 border border-white/5 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto space-y-3">
                   <div *ngIf="!deepDiveData?.logs || deepDiveData.logs.length === 0" class="italic text-slate-600">No agent logs recorded yet.</div>
                   <div *ngFor="let log of deepDiveData?.logs" class="flex flex-col md:flex-row gap-2 md:gap-4 border-l-2 pl-4 py-1 hover:bg-slate-900/50 transition-colors" [ngClass]="{'border-emerald-500': log?.agent_name?.includes('Admin'), 'border-indigo-500': !log?.agent_name?.includes('Admin')}">
                     <div class="md:w-32 flex-shrink-0 text-slate-500 text-[10px] mt-0.5 uppercase tracking-wider">{{ log.created_at | date:'MMM d, h:mm a' }}</div>
                     <div class="flex-1">
                       <div class="flex items-center gap-2 flex-wrap">
                         <span class="text-white font-bold">{{ log.action_type }}</span>
                         <span class="text-slate-400 text-[10px] font-bold tracking-widest uppercase border border-white/10 bg-white/5 px-2 py-0.5 rounded">{{ log.agent_name }}</span>
                       </div>
                       <div class="text-slate-400 mt-1 whitespace-pre-wrap text-xs leading-relaxed text-opacity-80">{{ log.details }}</div>
                     </div>
                   </div>
                </div>
             </div>

             <!-- Hidden Target for HTML2Canvas PDF Export -->
             <div id="vera-pdf-report" class="hidden bg-white text-slate-900 absolute top-0 left-0 w-[800px] h-auto p-12 shadow-2xl z-50">
                <div class="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
                   <div>
                      <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Executive SEO Authority Report</h1>
                      <div class="text-xl text-slate-500 font-medium mt-1">{{ deepDiveData?.campaign?.client_domain }}</div>
                   </div>
                   <div class="text-right">
                      <div class="text-sm font-bold text-slate-400 uppercase tracking-widest">Prepared by</div>
                      <div class="font-extrabold text-lg">{{ deepDiveData?.campaign?.agency_name || 'Vera Sharp AI' }}</div>
                      <div class="text-sm text-slate-500 mt-1">{{ currentDate() | date:'longDate' }}</div>
                   </div>
                </div>
                
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 flex items-center justify-between">
                   <div>
                      <div class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Active Plan Structure</div>
                      <div class="text-2xl font-extrabold text-indigo-600 capitalize">{{ deepDiveData?.campaign?.package_tier }} Protocol</div>
                   </div>
                   <div class="text-right">
                      <div class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Current Implementation Phase</div>
                      <div class="text-2xl font-extrabold text-emerald-600">Phase {{ deepDiveData?.campaign?.current_phase || 1 }}</div>
                   </div>
                </div>

                <div class="mb-8">
                   <h2 class="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-200 pb-2">AI Tactical Synthesis</h2>
                   <div class="prose prose-sm text-slate-600 whitespace-pre-wrap font-medium">
                      {{ deepDiveReport || 'Synthesizing pipeline progression telemetry...' }}
                   </div>
                </div>

                <!-- 1. Advanced SEO Keyword Phrase Trend Diagrams -->
                <div class="mb-12">
                   <h2 class="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                     <svg class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                     Advanced SEO Keyword Phrase Trend Diagrams
                   </h2>
                   
                   <h3 class="text-lg font-bold text-slate-800 mb-2 mt-6 uppercase tracking-widest text-xs">Actively Targeted Frameworks</h3>
                   <table class="w-full text-left text-sm mb-6">
                      <thead class="bg-indigo-50 text-indigo-900 border-b border-indigo-200">
                         <tr>
                            <th class="p-3 font-bold border-b border-indigo-100">Keyword Target</th>
                            <th class="p-3 font-bold text-center border-b border-indigo-100">6 Mo Trend</th>
                            <th class="p-3 font-bold text-center border-b border-indigo-100">Current Rank</th>
                            <th class="p-3 font-bold text-right border-b border-indigo-100">Search Vol</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 bg-white border-b border-slate-200">
                         <tr *ngIf="categorizedRankings.targeted.length === 0"><td colspan="4" class="p-4 text-center italic text-slate-500 font-medium">Rankings synchronizing...</td></tr>
                         <tr *ngFor="let kw of categorizedRankings.targeted" class="hover:bg-slate-50">
                            <td class="p-3 font-bold text-slate-800 w-2/5">{{ kw.keyword }}</td>
                            <td class="p-3 text-center w-1/4">
                               <svg *ngIf="kw.history && kw.history.length > 1" class="w-16 h-5 overflow-visible mx-auto" [ngClass]="kw.change >= 0 ? 'text-emerald-500' : 'text-rose-500'" viewBox="0 -2 60 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                  <polyline [attr.points]="getSparkPts(kw.history)"></polyline>
                               </svg>
                            </td>
                            <td class="p-3 text-center font-bold">
                               <div [ngClass]="kw.position <= 10 ? 'text-indigo-600' : 'text-slate-600'">{{ kw.position === 100 ? '-' : '#' + kw.position }}</div>
                               <div class="text-[10px] font-bold mt-0.5" [ngClass]="kw.change > 0 ? 'text-emerald-500' : (kw.change < 0 ? 'text-rose-500' : 'text-slate-400')">
                                  {{ kw.change !== 0 && kw.change !== 999 ? (kw.change > 0 ? '▲ ' + kw.change : '▼ ' + -kw.change) : (kw.change === 999 ? 'NEW' : '') }}
                               </div>
                            </td>
                            <td class="p-3 text-right font-mono text-slate-500 text-xs">{{ kw.volume | number }}</td>
                         </tr>
                      </tbody>
                   </table>

                   <h3 class="text-lg font-bold text-slate-800 mb-2 mt-8 uppercase tracking-widest text-xs">Organic Peripheral Keywords (Top 20)</h3>
                   <table class="w-full text-left text-sm">
                      <thead class="bg-emerald-50 text-emerald-900 border-b border-emerald-200">
                         <tr>
                            <th class="p-3 font-bold border-b border-emerald-100">Keyword Found</th>
                            <th class="p-3 font-bold text-center border-b border-emerald-100">6 Mo Trend</th>
                            <th class="p-3 font-bold text-center border-b border-emerald-100">Current Rank</th>
                            <th class="p-3 font-bold text-right border-b border-emerald-100">Search Vol</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 bg-white border-b border-slate-200">
                         <tr *ngIf="categorizedRankings.untargeted.length === 0"><td colspan="4" class="p-4 text-center italic text-slate-500 font-medium">Ambient rankings synchronizing...</td></tr>
                         <tr *ngFor="let kw of categorizedRankings.untargeted" class="hover:bg-slate-50">
                            <td class="p-3 font-bold text-slate-800 w-2/5">{{ kw.keyword }}</td>
                            <td class="p-3 text-center w-1/4">
                               <svg *ngIf="kw.history && kw.history.length > 1" class="w-16 h-5 overflow-visible mx-auto" [ngClass]="kw.change >= 0 ? 'text-emerald-500' : 'text-rose-500'" viewBox="0 -2 60 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                  <polyline [attr.points]="getSparkPts(kw.history)"></polyline>
                               </svg>
                            </td>
                            <td class="p-3 text-center font-bold">
                               <div [ngClass]="kw.position <= 10 ? 'text-indigo-600' : 'text-slate-600'">{{ kw.position === 100 ? '-' : '#' + kw.position }}</div>
                               <div class="text-[10px] font-bold mt-0.5" [ngClass]="kw.change > 0 ? 'text-emerald-500' : (kw.change < 0 ? 'text-rose-500' : 'text-slate-400')">
                                  {{ kw.change !== 0 && kw.change !== 999 ? (kw.change > 0 ? '▲ ' + kw.change : '▼ ' + -kw.change) : (kw.change === 999 ? 'NEW' : '') }}
                               </div>
                            </td>
                            <td class="p-3 text-right font-mono text-slate-500 text-xs">{{ kw.volume | number }}</td>
                         </tr>
                      </tbody>
                   </table>
                </div>

                <!-- 2. true SEMrush Organic Analytics -->
                <div class="mb-4" style="page-break-inside: avoid;">
                   <h2 class="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                     <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                     SEMrush Executive Performance Dashboard
                   </h2>
                   <div class="bg-slate-900 rounded-2xl p-6 shadow-xl text-white flex justify-between items-center relative overflow-hidden">
                      <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-orange-500/10 to-transparent z-0"></div>
                      <div class="text-center w-1/2 border-r border-white/10 relative z-10">
                        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Estimated Monthly Traffic</div>
                        <div class="text-5xl font-extrabold text-emerald-400 font-mono tracking-tight">{{ realMetrics.organic_traffic | number }}</div>
                      </div>
                      <div class="text-center w-1/2 relative z-10">
                        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Indexed Keywords</div>
                        <div class="text-5xl font-extrabold text-orange-400 font-mono tracking-tight">{{ realMetrics.organic_keywords | number }}</div>
                      </div>
                   </div>
                   <p class="text-xs text-slate-500 mt-3 flex items-center justify-end">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Real-time organic metrics securely extracted via SEMrush domain analytics API.
                   </p>
                </div>

                <!-- 3. Google Analytics Optional Injection -->
                <div *ngIf="realMetrics.ga_users > 0" class="mb-4" style="page-break-inside: avoid;">
                   <h2 class="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                     <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                     Google Analytics Retention Pipeline
                   </h2>
                   <div class="bg-slate-900 rounded-2xl p-6 shadow-xl text-white grid grid-cols-4 gap-4 relative overflow-hidden">
                      <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-transparent z-0"></div>
                      <div class="text-center border-r border-white/10 relative z-10">
                        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Users</div>
                        <div class="text-3xl font-extrabold text-blue-400 font-mono tracking-tight">{{ realMetrics.ga_users | number }}</div>
                      </div>
                      <div class="text-center border-r border-white/10 relative z-10">
                        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Sessions</div>
                        <div class="text-3xl font-extrabold text-indigo-400 font-mono tracking-tight">{{ realMetrics.ga_sessions | number }}</div>
                      </div>
                      <div class="text-center border-r border-white/10 relative z-10">
                        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Bounce Rate</div>
                        <div class="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">{{ realMetrics.ga_bounce_rate }}%</div>
                      </div>
                      <div class="text-center relative z-10">
                        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Avg Session</div>
                        <div class="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">{{ realMetrics.ga_avg_duration }}s</div>
                      </div>
                   </div>
                   <p class="text-xs text-slate-500 mt-3 flex items-center justify-end">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Verified authenticated telemetry pipeline via Google Data API integration.
                   </p>
                </div>

                <div class="mt-12 pt-6 border-t font-mono border-slate-200 text-center text-xs text-slate-400">
                   Report autonomously generated by iShack Vera Sharp Intelligence.
                </div>
             </div>

           </div>
        </div>

        <div *ngIf="activeTab === 'crm'" class="animate-fade-in font-sans">
          <!-- Direct Platform CRM Leads Core -->
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-2xl mt-8">
            <h2 class="text-2xl font-extrabold text-white flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              Direct Platform SEO Leads
            </h2>
            <p class="text-sm text-slate-400 font-medium ml-13 mb-6">Top-of-funnel prospects captured directly from your primary iShack URL auditing tool.</p>

            <div class="overflow-x-auto rounded-xl border border-white/5">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="bg-slate-950 text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-white/5">
                  <tr>
                    <th class="px-6 py-4">Lead Email / Contact</th>
                    <th class="px-6 py-4">Target Domain</th>
                    <th class="px-6 py-4 text-center">Audit Score</th>
                    <th class="px-6 py-4">Status Pipeline</th>
                    <th class="px-6 py-4 text-right">Captured Origin</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr *ngFor="let lead of ishackLeads" class="hover:bg-white/[0.02] transition-colors">
                    <td class="px-6 py-4 font-bold text-slate-200">
                       <a [href]="'mailto:' + lead.email" class="hover:text-emerald-400 transition-colors">{{ lead.email }}</a>
                    </td>
                    <td class="px-6 py-4 font-mono text-xs text-slate-400">
                      <div class="flex flex-col gap-1">
                        <span class="text-slate-300 font-bold">{{ lead.target_domain }}</span>
                        <span class="text-[10px] uppercase text-emerald-500">{{ lead.target_keyword || 'No keyword' }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border"
                            [ngClass]="lead.seo_score < 40 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'">
                        {{ lead.seo_score }}/100 Deficit
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mx-auto block w-max">{{ lead.status }}</span>
                    </td>
                    <td class="px-6 py-4 text-right text-xs text-slate-500 font-mono">{{ lead.created_at | date:'MMM dd, HH:mm' }}</td>
                  </tr>
                  <tr *ngIf="ishackLeads.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 font-medium italic">Your direct CRM pipeline is extremely silent. Generate traffic to trigger OpenClaw.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- B2B Inbound Audit Leads Core -->
          <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-2xl mt-8">
            <h2 class="text-2xl font-extrabold text-white flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              B2B Embedded Audit Leads
            </h2>
            <p class="text-sm text-slate-400 font-medium ml-13 mb-6">Inbound lead capture stream generated directly from Agency-embedded Zero-Touch SEO Widgets.</p>

            <div class="overflow-x-auto rounded-xl border border-white/5">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="bg-slate-950 text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-white/5">
                  <tr>
                    <th class="px-6 py-4">Lead Email</th>
                    <th class="px-6 py-4">Target Domain</th>
                    <th class="px-6 py-4">Pipeline Agency Owner</th>
                    <th class="px-6 py-4 text-center">Audit Severity Proxy</th>
                    <th class="px-6 py-4 text-right">Captured Over Webhook</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr *ngFor="let lead of agencyLeads" class="hover:bg-white/[0.02] transition-colors">
                    <td class="px-6 py-4 font-bold text-slate-200">
                       <a [href]="'mailto:' + lead.client_email" class="hover:text-blue-400 transition-colors">{{ lead.client_email }}</a>
                    </td>
                    <td class="px-6 py-4 font-mono text-xs text-slate-400">{{ lead.client_domain }}</td>
                    <td class="px-6 py-4 text-slate-300 font-bold capitalize">{{ lead.agency_name }}</td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border"
                            [ngClass]="lead.audit_score < 40 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'">
                        {{ lead.audit_score }}/100 Deficit
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right text-xs text-slate-500 font-mono">{{ lead.created_at | date:'shortTime' }}</td>
                  </tr>
                  <tr *ngIf="agencyLeads.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 font-medium italic">Embed widget payloads awaiting structural initiation.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Packages Manager View -->
        <div *ngIf="activeTab === 'packages'" class="animate-fade-in space-y-8">
          <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-extrabold text-white flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  </div>
                  Dynamic Packages Engine
                  <span class="group relative cursor-help text-emerald-500 hover:text-emerald-300 ml-2 z-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-64 p-3 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-white/10 font-normal tracking-wide z-50">
                      <strong>How this works:</strong><br/>Create dynamic subscription tiers. The 'Max AI Phase Allowed' dictates exactly how far the PM AI will progress a campaign.
                    </span>
                  </span>
                </h2>
                <p class="text-sm text-slate-400 mt-1 font-medium ml-13">Create custom packages to limit AI pipelines and define MRR metrics.</p>
              </div>
            </div>
            
            <div class="p-6 bg-slate-950/30 grid grid-cols-1 md:grid-cols-5 gap-4">
               <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Tier Name</label>
                  <input #pkgName type="text" placeholder="e.g. Masterclass" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
               </div>
               <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Monthly Cost ($)</label>
                  <input #pkgPrice type="number" placeholder="1499" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
               </div>
               <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Max AI Phase Allowed</label>
                  <input #pkgPhase type="number" placeholder="6" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
               </div>
               <div class="col-span-1 md:col-span-2">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Detailed Features (comma separated)</label>
                  <div class="flex gap-2 items-end">
                     <input #pkgFeatures type="text" placeholder="e.g. Keyword Mapping, Content Syndication..." class="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                     <button (click)="createPackage(pkgName.value, pkgPrice.value, pkgPhase.value, pkgFeatures.value); pkgName.value=''; pkgPrice.value=''; pkgPhase.value=''; pkgFeatures.value=''" class="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl text-white font-bold transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap">Save Feature Tier</button>
                  </div>
                  <!-- AI Suggested Onboarding Features -->
                  <div class="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
                     <span class="text-slate-600 uppercase pt-1 mr-1 tracking-wider">AI Suggestions:</span>
                     <button (click)="pkgFeatures.value = pkgFeatures.value ? pkgFeatures.value + ', Keyword Mapping' : 'Keyword Mapping'" class="px-2 py-1 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded transition-colors duration-200">Keyword Mapping</button>
                     <button (click)="pkgFeatures.value = pkgFeatures.value ? pkgFeatures.value + ', Onsite Audit & Tags' : 'Onsite Audit & Tags'" class="px-2 py-1 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded transition-colors duration-200">Onsite Audit & Tags</button>
                     <button (click)="pkgFeatures.value = pkgFeatures.value ? pkgFeatures.value + ', Content Syndication' : 'Content Syndication'" class="px-2 py-1 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded transition-colors duration-200">Content Syndication</button>
                     <button (click)="pkgFeatures.value = pkgFeatures.value ? pkgFeatures.value + ', Base Auto-Backlinking' : 'Base Auto-Backlinking'" class="px-2 py-1 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded transition-colors duration-200">Base Auto-Backlinking</button>
                     <button (click)="pkgFeatures.value = pkgFeatures.value ? pkgFeatures.value + ', Expert RAG Audit' : 'Expert RAG Audit'" class="px-2 py-1 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded transition-colors duration-200">Expert RAG Audit</button>
                     <button (click)="pkgFeatures.value = pkgFeatures.value ? pkgFeatures.value + ', High-DR Anchor Outreach' : 'High-DR Anchor Outreach'" class="px-2 py-1 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded transition-colors duration-200">High-DR Anchor Outreach</button>
                     <button (click)="pkgFeatures.value = pkgFeatures.value ? pkgFeatures.value + ', Continuous ML Optimization' : 'Continuous ML Optimization'" class="px-2 py-1 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 rounded transition-colors duration-200">Continuous ML Optimization</button>
                  </div>
               </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-black/20 border-y border-white/5">
                    <th class="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tier Definition</th>
                    <th class="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">MRR Yield</th>
                    <th class="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Max AI Evolution</th>
                    <th class="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Client Deliverables</th>
                    <th class="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr *ngFor="let p of packages" class="hover:bg-white/[0.02] transition-colors">
                    <ng-container *ngIf="editPackageTierName !== p.tier_name">
                      <td class="px-6 py-4 font-bold text-white capitalize">{{ p.tier_name }}</td>
                      <td class="px-6 py-4 text-emerald-400 font-mono text-center cursor-default" title="Monthly Recurring Revenue via subscriptions">$ {{ p.mrr_price }}</td>
                      <td class="px-6 py-4 text-center cursor-default" title="Bounds the PM Agent. Higher = More automated tasks.">
                         <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border"
                               [ngClass]="p.max_ai_phase > 4 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'">
                           Phase {{ p.max_ai_phase }}
                         </span>
                      </td>
                      <td class="px-6 py-4">
                         <div class="flex flex-wrap gap-2 max-w-sm">
                            <span *ngIf="!p.features || p.features.length === 0" class="text-xs text-slate-500 italic">No features mapped</span>
                            <span *ngFor="let f of p.features" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/10 uppercase tracking-wider shadow-sm">{{ f }}</span>
                         </div>
                      </td>
                      <td class="px-6 py-4 text-right">
                         <div class="flex items-center justify-end gap-2">
                           <button (click)="editPackageTierName = p.tier_name; p.editFeatures = p.features ? p.features.join(', ') : ''" class="text-blue-400 hover:text-blue-300 font-bold text-sm bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors shadow">Edit</button>
                           <button (click)="deletePackage(p.tier_name)" class="text-red-400 hover:text-red-300 font-bold text-sm bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-lg transition-colors">Terminate</button>
                         </div>
                      </td>
                    </ng-container>

                    <ng-container *ngIf="editPackageTierName === p.tier_name">
                      <td class="px-6 py-4 font-bold text-slate-500 capitalize cursor-not-allowed" title="Tier Name cannot be modified">{{ p.tier_name }}</td>
                      <td class="px-6 py-4">
                        <input [(ngModel)]="p.mrr_price" type="number" class="w-full bg-slate-950 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 mx-auto block text-center shadow-inner">
                      </td>
                      <td class="px-6 py-4">
                        <input [(ngModel)]="p.max_ai_phase" type="number" class="w-full bg-slate-950 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 mx-auto block text-center shadow-inner">
                      </td>
                      <td class="px-6 py-4">
                        <input [(ngModel)]="p.editFeatures" placeholder="Comma separated features" class="w-full max-w-sm bg-slate-950 border border-white/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 shadow-inner">
                      </td>
                      <td class="px-6 py-4 text-right">
                         <div class="flex items-center justify-end gap-2">
                           <button (click)="savePackageEdit(p)" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow">Save</button>
                           <button (click)="editPackageTierName = null; fetchPackages()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded transition-colors shadow">Cancel</button>
                         </div>
                      </td>
                    </ng-container>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- System & Billing Settings View -->
        <div *ngIf="activeTab === 'settings'" class="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Promo Codes Engine -->
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
          
          <!-- Quality Assurance (QA) Engine Tracker -->
          <div class="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-extrabold text-white flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  Self-Healing QA Engine
                </h2>
                <p class="text-sm text-slate-400 mt-1 font-medium ml-13">Autonomous system checks monitoring frontend latency and UX degradation.</p>
              </div>
              <button (click)="forceQaHeartbeat()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-2 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider shadow-lg">Force Audit</button>
            </div>
            
            <div class="p-6">
              <div *ngIf="platformHealth.length === 0" class="text-center text-slate-500 py-8 font-medium">Awaiting initial QA structural telemetry hook...</div>
              
              <div *ngIf="platformHealth.length > 0" class="space-y-4">
                <div *ngFor="let check of platformHealth; let first = first" 
                     [ngClass]="first ? 'bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'bg-slate-950 border-white/5 opacity-70'"
                     class="border rounded-xl p-4 transition-all">
                  
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-slate-300 font-bold text-sm flex items-center gap-2">
                       <span class="w-2 h-2 rounded-full" [ngClass]="check.ux_score >= 90 ? 'bg-emerald-400' : 'bg-yellow-400'"></span>
                       Audit Run: {{ check.snapshot_date | date:'shortTime' }}
                    </span>
                    <span class="text-xs font-mono font-bold" [ngClass]="check.ux_score >= 90 ? 'text-emerald-400' : 'text-yellow-400'">UX: {{ check.ux_score }}/100</span>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-900 border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
                      <span class="text-xs text-slate-500 font-bold">Latency</span>
                      <span class="text-sm text-white font-mono">{{ check.latency_ms }}ms</span>
                    </div>
                    <div class="bg-slate-900 border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
                      <span class="text-xs text-slate-500 font-bold">404s/Fails</span>
                      <span class="text-sm text-white font-mono" [ngClass]="check.broken_links > 0 ? 'text-red-400' : 'text-emerald-400'">{{ check.broken_links }}</span>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

        </div>


        <!-- Approval Modal Target -->
        <div *ngIf="editingTask" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-4xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-2xl font-bold text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Reviewing: {{ editingTask.task_type }}
                </h3>
                <p class="text-sm text-slate-400 mt-1">Safely modify the Neural Array outputs produced by {{ editingTask.assigned_agent }} before approving execution onto the active database.</p>
              </div>
              <button (click)="closeApprovalModal()" class="text-slate-500 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div class="flex-1 overflow-hidden flex flex-col mb-6">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Editable JSON Neural Output String</label>
              <textarea [(ngModel)]="editedPayloadString" class="w-full flex-1 bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-green-400 font-mono focus:outline-none focus:border-yellow-500/50 resize-none shadow-inner leading-relaxed"></textarea>
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button (click)="closeApprovalModal()" class="px-6 py-2.5 rounded-lg font-bold text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
              <button (click)="submitApproval()" class="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-extrabold px-8 py-2.5 rounded-lg shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Confirm & Overwrite Core
              </button>
            </div>
          </div>
        </div>

        <!-- Campaign Task History Modal Overlay -->
        <div *ngIf="isHistoryModalOpen" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div class="bg-[#0A0D12] border border-white/10 rounded-2xl w-full max-w-5xl shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-slide-up flex flex-col h-[85vh]">
            <!-- Header -->
            <div class="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center rounded-t-2xl relative overflow-hidden">
              <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div class="relative z-10 w-full flex justify-between items-start">
                <div>
                  <h3 class="text-2xl font-black text-white flex items-center gap-3">
                    <svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Full AI Operational History
                  </h3>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-sm font-bold text-slate-300">{{ selectedCampaignHistory?.client_domain }}</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                    <span class="text-sm text-slate-500">{{ selectedCampaignHistory?.agency_name }}</span>
                    <span class="ml-3 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">{{ selectedCampaignTasks.length }} Tasks Logged</span>
                  </div>
                </div>
                <button (click)="closeHistoryModal()" class="text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            <!-- Loader -->
            <div *ngIf="isHistoryLoading" class="flex-1 flex flex-col items-center justify-center space-y-4">
              <div class="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p class="text-slate-400 text-sm font-mono tracking-wider animate-pulse">Accessing Neural Archives...</p>
            </div>

            <!-- Empty State -->
            <div *ngIf="!isHistoryLoading && selectedCampaignTasks.length === 0" class="flex-1 flex flex-col items-center justify-center p-8">
              <div class="w-20 h-20 bg-slate-900 rounded-full border border-white/5 flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <h4 class="text-white font-bold text-lg mb-2">No History Logged Yet</h4>
              <p class="text-slate-400 text-sm text-center max-w-md">The AI agents have not yet completed any tasks for this campaign. As the month progresses, tasks will be logged here.</p>
            </div>

            <!-- Data Table -->
            <div *ngIf="!isHistoryLoading && selectedCampaignTasks.length > 0" class="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950/30">
              <div class="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                
                <div *ngFor="let task of selectedCampaignTasks" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div class="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 text-slate-400 group-[.is-active]:bg-blue-900/20 group-[.is-active]:text-blue-400 group-[.is-active]:border-blue-500/30 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 font-bold text-xs uppercase tracking-wider">
                    {{ task.assigned_agent.substring(0, 2) }}
                  </div>
                  
                  <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 transition-colors shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                       <time class="text-xs font-mono text-slate-500 font-bold bg-black/30 px-2 py-1 rounded inline-block">{{ task.created_at | date:'short' }}</time>
                       <span class="text-[10px] uppercase font-bold tracking-wider" [ngClass]="{'text-green-400 bg-green-400/10 px-2 py-0.5 rounded': task.status === 'completed', 'text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded': task.status === 'pending'}">{{ task.status }}</span>
                    </div>
                    <div class="text-white font-bold mb-1">{{ getTaskTitle(task.task_type) }}</div>
                    <div class="text-sm text-slate-400 mb-3 line-clamp-2 leading-relaxed">{{ getTaskDescription(task.task_type, task.status) }}</div>
                    <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2.5 mb-4 flex items-start gap-2">
                      <svg class="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      <div>
                        <span class="text-[10px] uppercase font-black tracking-wider text-indigo-400 block mb-0.5">Core Benefit</span>
                        <span class="text-xs text-indigo-200/80 leading-relaxed font-medium">{{ getTaskBenefits(task.task_type, task.status) }}</span>
                      </div>
                    </div>
                    <div class="bg-black/50 border border-white/5 rounded-lg p-3 text-xs font-mono text-slate-500 h-24 overflow-y-auto custom-scrollbar break-all flex flex-col justify-center">
                      <span *ngIf="task.result_payload">{{ task.result_payload | json }}</span>
                      <span *ngIf="!task.result_payload" class="italic opacity-50 block text-center">Neural payload committed internally.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            <!-- Footer & Export -->
            <div class="p-6 border-t border-white/5 bg-slate-900 flex justify-between items-center rounded-b-2xl">
              <p class="text-xs text-slate-500 font-mono">End of Neural Log. Data is strictly internal.</p>
              <button *ngIf="selectedCampaignTasks.length > 0" (click)="exportCampaignHistoryCSV()" class="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export Core CSV Report
              </button>
            </div>
          </div>
        </div>

      </div>

    <!-- Floating AI Assistant Chat -->
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-fade-in font-sans">
      <!-- Chat Window -->
      <div *ngIf="isChatOpen" class="bg-slate-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(30,58,138,0.3)] w-[360px] sm:w-[420px] mb-4 flex flex-col overflow-hidden animate-slide-up h-[500px]">
         <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-white/10 flex justify-between items-center">
            <h3 class="text-white font-extrabold flex items-center gap-2">
               <span class="text-xl">✨</span> Vera Sharp AI Admin
            </h3>
            <button (click)="toggleChat()" class="text-white/70 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
         </div>
         <div class="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950 custom-scrollbar flex flex-col">
            <div *ngIf="chatMessages.length === 0" class="text-center text-slate-500 text-sm italic mt-8">I'm hooked into your live PostgreSQL databases. Ask me anything about your active campaigns, missing targets, or AI phases!</div>
            <div *ngFor="let msg of chatMessages" class="text-sm rounded-xl p-3 max-w-[85%]" [ngClass]="msg.role === 'user' ? 'bg-blue-600 text-white self-end rounded-tr-none' : 'bg-slate-800 text-slate-300 self-start rounded-tl-none border border-white/5'">
               <strong *ngIf="msg.role === 'assistant'" class="block mb-1 text-blue-400 font-extrabold text-[11px] uppercase tracking-wider">Vera Sharp</strong>
               <div [innerHTML]="msg.content" class="whitespace-pre-line leading-relaxed"></div>
            </div>
            <div *ngIf="isChatLoading" class="self-start bg-slate-800 text-slate-400 text-sm rounded-xl p-3 rounded-tl-none border border-white/5 flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
               <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
               <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
            </div>
         </div>
         <div class="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
            <input [(ngModel)]="chatInput" (keyup.enter)="sendChatMessage()" type="text" placeholder="Explain the active SEO hooks..." class="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
            <button (click)="sendChatMessage()" [disabled]="isChatLoading" class="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flexitems-center justify-center">
               <svg class="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
         </div>
      </div>
      <!-- Chat Toggle Button -->
      <button (click)="toggleChat()" class="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/20 transition-transform hover:scale-105 active:scale-95">
         <svg *ngIf="!isChatOpen" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
         <svg *ngIf="isChatOpen" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  `
})
export class AdminDashboard implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  metrics: any = null;
  recentAgencies: any[] = [];
  error = '';
  
  // Inactivity Timer State
  inactivityTimer: any;
  readonly TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
  
  private resetInactivityTimer = () => {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (typeof window !== 'undefined') {
      this.inactivityTimer = setTimeout(() => {
        this.logout();
      }, this.TIMEOUT_MS);
    }
  };
  
  // Observation Deck State
  activeTab: any = 'metrics';
  campaigns: any[] = [];
  agentTasks: any[] = [];
  agentLogs: any[] = [];
  targetedUrls: any[] = [];
  
  // Human-in-the-Loop State
  editingTask: any = null;
  editedPayloadString: string = '';
  
  // Settings & CRM State
  expandedCampaign: number | null = null;
  promoCodes: any[] = [];
  editAgencyId: number | null = null;
  platformHealth: any[] = [];
  packages: any[] = [];
  editPackageTierName: string | null = null;
  agencyLeads: any[] = [];
  ishackLeads: any[] = [];

  get awaitingApprovals() {
    return this.agentTasks.filter((t: any) => t.status === 'awaiting_approval');
  }

  // Insights State
  insights: any[] = [];
  isGeneratingInsights: boolean = false;

  generateInsights() {
    this.isGeneratingInsights = true;
    this.http.get<any>(`${environment.apiUrl}/admin/metrics/insights`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.insights = data.insights;
        this.isGeneratingInsights = false;
      },
      error: (err) => {
        alert('Failed to generate insights from Vera.');
        this.isGeneratingInsights = false;
      }
    });
  }

  // Chat State
  isChatOpen: boolean = false;
  chatMessages: {role: string, content: string}[] = [];
  chatInput: string = '';
  isChatLoading: boolean = false;

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendChatMessage() {
    if (!this.chatInput.trim()) return;
    const msg = this.chatInput;
    this.chatMessages.push({ role: 'user', content: msg });
    this.chatInput = '';
    this.isChatLoading = true;
    
    this.http.post<any>(`${environment.apiUrl}/admin/chat`, { message: msg }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.chatMessages.push({ role: 'assistant', content: res.reply });
        this.isChatLoading = false;
      },
      error: () => {
        this.chatMessages.push({ role: 'assistant', content: 'Connection to Vera disrupted.' });
        this.isChatLoading = false;
      }
    });
  }

  updateTargetPackage(id: number, tier: string) {
    if (confirm(`Are you sure you want to transition this URL to the ${tier.toUpperCase()} package tier?`)) {
      this.http.put(`${environment.apiUrl}/admin/targeted-urls/${id}/package`, { package_tier: tier }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Package assigned successfully.');
          this.fetchTargetedUrls(); // Refresh the grid
        },
        error: (err: any) => alert(err.error?.error || 'Failed to re-assign package')
      });
    } else {
      // Refresh to revert the dropdown visual change if user cancels
      this.fetchTargetedUrls();
    }
  }

  deleteTargetUrl(id: number, domain: string) {
    if (confirm(`CRITICAL WARNING: Are you remarkably sure you want to delete ${domain}? All AI history and telemetry will be wiped completely.`)) {
      this.http.delete(`${environment.apiUrl}/admin/targeted-urls/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchTargetedUrls(); // Refresh
        },
        error: () => alert("Failed to cleanly bypass safety protocols to wipe domain.")
      });
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => 
        window.addEventListener(evt, this.resetInactivityTimer)
      );
      this.resetInactivityTimer();
    }

    this.route.paramMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab) {
        let mappedTab = tab;
        if (tab === 'targetedurl' || tab === 'targeted-urls') mappedTab = 'urls';
        this.setActiveTab(mappedTab, false);
      } else {
        this.fetchMetrics();
      }
    });

    // Poll logs every 15s to make it feel alive
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.activeTab === 'agents' || this.activeTab === 'crm') {
          this.fetchAgentData();
        }
        if (this.activeTab === 'settings') {
          this.fetchPlatformHealth();
        }
      }, 15000);
    }
  }

  ngOnDestroy() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (typeof window !== 'undefined') {
      ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => 
        window.removeEventListener(evt, this.resetInactivityTimer)
      );
    }
  }

  setActiveTab(tab: string, updateUrl: boolean = true) {
    this.activeTab = tab;
    
    if (updateUrl && typeof window !== 'undefined') {
      let urlPath = tab;
      if (tab === 'urls') urlPath = 'targetedurl';
      this.location.replaceState(`/admin/${urlPath}`);
    }

    if (tab === 'metrics') {
      this.fetchMetrics();
    }
    if (tab === 'agents' || tab === 'crm') {
      this.fetchAgentData();
    }
    if (tab === 'packages') {
      this.fetchPackages();
    }
    if (tab === 'settings') {
      this.fetchPromoCodes();
      this.fetchPlatformHealth();
    }
    if (tab === 'urls') {
      this.fetchTargetedUrls();
      this.fetchPackages();
      this.fetchAgencyLeads();
      this.fetchiShackLeads();
    }
  }

  fetchPlatformHealth() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/platform-health`, { headers: this.getHeaders() })
      .subscribe(data => this.platformHealth = data);
  }

  forceQaHeartbeat() {
    if (confirm("Force an aggressive headless health check via Puppeteer?")) {
      this.http.post(`${environment.apiUrl}/admin/sandbox/trigger-qa`, {}, { headers: this.getHeaders() }).subscribe({
         next: (res: any) => {
           alert("QA Initialization verified. Process running asynchronously.");
           setTimeout(() => this.fetchPlatformHealth(), 4000);
         },
         error: () => alert("QA Heartbeat Trigger Failed.")
      });
    }
  }

  fetchTargetedUrls() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/targeted-urls`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.targetedUrls = data,
      error: (err) => console.error(err)
    });
  }

  fetchAgencyLeads() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/agency-leads`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.agencyLeads = data,
      error: (err) => console.error(err)
    });
  }

  fetchiShackLeads() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/leads`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.ishackLeads = data,
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

  fetchPackages() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/sandbox/packages`, { headers: this.getHeaders() })
      .subscribe(data => this.packages = data);
  }

  createPackage(tierName: string, mrrPrice: string, maxPhase: string, featuresStr: string) {
    if (!tierName || !maxPhase) return alert('Tier Name and Max Phase required');
    const features = featuresStr.split(',').map(f => f.trim()).filter(f => f.length > 0);
    this.http.post(`${environment.apiUrl}/admin/sandbox/packages`, { tier_name: tierName, mrr_price: parseInt(mrrPrice) || 0, max_ai_phase: parseInt(maxPhase), features }, { headers: this.getHeaders() })
      .subscribe({
         next: () => {
           alert('Package registered successfully');
           this.fetchPackages();
         },
         error: (err: any) => alert(err.error?.error || 'Failed to update package')
      });
  }

  savePackageEdit(p: any) {
    if (!p.tier_name || !p.max_ai_phase) return alert('Tier Name and Max Phase required');
    const features = p.editFeatures ? p.editFeatures.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0) : [];
    this.http.post(`${environment.apiUrl}/admin/sandbox/packages`, { tier_name: p.tier_name, mrr_price: parseInt(p.mrr_price) || 0, max_ai_phase: parseInt(p.max_ai_phase), features }, { headers: this.getHeaders() })
      .subscribe({
         next: () => {
           this.editPackageTierName = null;
           this.fetchPackages();
         },
         error: (err: any) => alert(err.error?.error || 'Failed to update package')
      });
  }

  deletePackage(tierName: string) {
    if (confirm(`Are you extremely certain you want to delete the ${tierName} package? Make sure no active campaigns rely on it.`)) {
      this.http.delete(`${environment.apiUrl}/admin/sandbox/packages/${tierName}`, { headers: this.getHeaders() })
        .subscribe({
           next: () => this.fetchPackages(),
           error: (err: any) => alert(err.error?.error || 'Failed to delete package')
        });
    }
  }
  
  openApprovalModal(task: any) {
    this.editingTask = task;
    this.editedPayloadString = JSON.stringify(task.result_payload, null, 2);
  }
  
  closeApprovalModal() {
    this.editingTask = null;
    this.editedPayloadString = '';
  }
  
  // Task Orchestration Engine
  submitApproval() {
    if (!this.editingTask) return;
    try {
      const parsed = JSON.parse(this.editedPayloadString);
      this.http.post(`${environment.apiUrl}/admin/tasks/${this.editingTask.id}/approve`, { edited_payload: parsed }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Core Neural String saved. AI agents are progressing...');
          this.closeApprovalModal();
          this.fetchAgentData();
        },
        error: (err) => alert('Save failed')
      });
    } catch {
      alert("Invalid JSON strictly. Provide a proper JSON structure string.");
    }
  }

  isApprovingAll = false;

  async approveAllTasks() {
    if (this.awaitingApprovals.length === 0) return;
    if (!confirm(`Are you sure you want to officially accept and execute all ${this.awaitingApprovals.length} pending runbooks?`)) return;
    
    this.isApprovingAll = true;
    
    // Process sequentially to be safe with DB connections & upstream Mailgun/Asana triggers
    for (const task of this.awaitingApprovals) {
      try {
        await new Promise((resolve, reject) => {
          this.http.post(`${environment.apiUrl}/admin/tasks/${task.id}/approve`, { edited_payload: task.result_payload }, { headers: this.getHeaders() })
            .subscribe({ next: resolve, error: reject });
        });
      } catch (err) {
        console.error(`Failed to approve task ${task.id}:`, err);
      }
    }
    
    this.isApprovingAll = false;
    alert("Success! All pending AI runbooks have been accepted and dispatched to their respective pipelines.");
    this.fetchAgentData();
  }

  getTaskTitle(type: string) {
    if (type === 'Phase 1: Keyword Research' || type === 'Ad-Hoc: Force Keyword Target') return '🔍 Keyword Research';
    if (type === 'backlink_outreach') return '💌 Guest Post Outreach';
    return type;
  }

  getTaskDescription(type: string, status: string = 'pending') {
    if (status === 'completed') {
       if (type === 'Phase 1: Keyword Research' || type === 'Ad-Hoc: Force Keyword Target') return 'The AI successfully evaluated the domain and aggregated optimal target keywords. Parameters are locked in the active database.';
       if (type === 'backlink_outreach' || type.includes('Phase 3')) return 'The AI successfully identified high DR targets and dispatched the outreach campaign.';
       if (type.includes('Phase 2')) return 'The AI successfully generated optimized onsite meta tags and content structures.';
       if (type.includes('Phase 4')) return 'The Expert RAG Audit was successfully processed against the dataset.';
       if (type.includes('Phase 5')) return 'The Autonomous ML iteration processed parameter adjustments.';
       if (type.includes('Phase 6')) return 'Live data telemetry hook was successfully verified with SEMrush active connection.';
       if (type.includes('Phase 7')) return 'Continuous optimization advisory completed for the recurring cycle.';
       if (type.includes('Phase 8')) return 'Continuous action pipeline successfully deployed algorithmic patches.';
       return 'The AI successfully executed this task and committed the resulting neural structures directly to the database.';
    }

    if (type === 'Phase 1: Keyword Research' || type === 'Ad-Hoc: Force Keyword Target') return 'The AI found these keywords. If they look good for the client, approve them so the AI can start writing content using them!';
    if (type === 'backlink_outreach') return 'The AI wrote an email to ask a big website for a backlink. Read the email, and if it sounds polite and good, approve it so the AI can send it!';
    return 'The AI prepared this data. Please review and approve to let the AI continue its background work.';
  }

  getTaskBenefits(type: string, status: string = 'pending') {
    if (status === 'completed') {
       if (type === 'Phase 1: Keyword Research' || type === 'Ad-Hoc: Force Keyword Target') return 'Establishes the foundational traffic map, ensuring the client targets high-volume, low-competition queries that drive qualified leads directly to their funnel.';
       if (type === 'backlink_outreach' || type.includes('Phase 3')) return 'Procures high Domain Authority (DR) backlinks, massively boosting the website\'s overall trust score and off-page SEO ranking power.';
       if (type.includes('Phase 2')) return 'Directly injects optimized keywords into the site\'s meta layer, pushing the core pages higher up the Google SERP rankings.';
       if (type.includes('Phase 4')) return 'Validates historical work against enterprise algorithmic guidelines, preventing catastrophic ranking drops caused by spam penalties or technical rot.';
       if (type.includes('Phase 5')) return 'Uses machine learning to find micro-opportunities in search behavior, squeezing out competitive advantages that human analysts might miss.';
       if (type.includes('Phase 6')) return 'Feeds live ranking telemetry back into the system, allowing the AI to prove real ROI and adapt strategies in real-time.';
       if (type.includes('Phase 7')) return 'Identifies proactive growth vectors, ensuring the campaign scales indefinitely instead of plateauing after initial setup.';
       if (type.includes('Phase 8')) return 'Instantly deploys discovered growth vectors without requiring manual human developer time.';
       return 'This neural execution autonomously handled an infrastructural task, saving approximately 3-5 hours of manual agency labor while strictly adhering to best-in-class algorithmic guidelines.';
    }

    if (type === 'Phase 1: Keyword Research' || type === 'Ad-Hoc: Force Keyword Target') return 'By approving these parameters, the AI will lock in the semantic roadmap necessary to command high-traffic Google search verticals.';
    if (type === 'backlink_outreach' || type.includes('Phase 3')) return 'Authorizing this outreach will autonomously initiate digital PR workflows, acquiring powerful backlinks without human labor.';
    return 'By green-lighting this neural execution, you are progressing the campaign pipeline to automatically deploy SEO deliverables without manual intervention.';
  }

  // Campaign History Task State
  isHistoryModalOpen = false;
  selectedCampaignHistory: any = null;
  selectedCampaignTasks: any[] = [];
  isHistoryLoading = false;

  openHistoryModal(campaign: any) {
    this.selectedCampaignHistory = campaign;
    this.isHistoryModalOpen = true;
    this.isHistoryLoading = true;
    this.selectedCampaignTasks = [];
    
    this.http.get<any[]>(`${environment.apiUrl}/admin/campaigns/${campaign.id}/tasks`, { headers: this.getHeaders() }).subscribe({
      next: (tasks) => {
        this.selectedCampaignTasks = tasks;
        this.isHistoryLoading = false;
      },
      error: () => {
        alert("Failed to load historical tasks.");
        this.isHistoryLoading = false;
      }
    });
  }

  closeHistoryModal() {
    this.isHistoryModalOpen = false;
    this.selectedCampaignHistory = null;
    this.selectedCampaignTasks = [];
  }

  exportCampaignHistoryCSV() {
    if (!this.selectedCampaignTasks || this.selectedCampaignTasks.length === 0) {
      return alert("No tasks to export!");
    }
    
    const headers = ["Date Completed", "Phase / Task Type", "Assigned Agent", "Status", "Payload Summary"];
    const rows = this.selectedCampaignTasks.map(task => {
      const date = new Date(task.created_at).toLocaleString();
      const type = task.task_type;
      const agent = task.assigned_agent;
      const status = task.status;
      
      // Clean JSON for CSV
      let payload = "{}";
      try {
        payload = JSON.stringify(task.result_payload || {});
      } catch (e) {}
      payload = payload.replace(/"/g, '""'); // escape quotes for CSV
      
      return `"${date}","${type}","${agent}","${status}","${payload}"`;
    });
    
    const csvContent = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ai_summary_${this.selectedCampaignHistory.client_domain.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Deep Dive State
  inspectingCampaignId: number | null = null;
  deepDiveData: any = null;
  deepDiveReport: string = '';
  draftingContent: string = '';
  backlinkKeywords: string = '';

  currentDate() { return new Date(); }

  saveBacklinkDirectives() {
    if (!this.inspectingCampaignId) return;
    this.http.post<any>(`${environment.apiUrl}/admin/sandbox/campaigns/${this.inspectingCampaignId}/backlinks`, { backlinkKeywords: this.backlinkKeywords }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        alert(res.message);
        this.loadDeepDive(this.inspectingCampaignId!); // refresh state
      },
      error: () => alert('Failed to save strategic backlinking directives.')
    });
  }

  exportLogsCSV() {
    if (!this.deepDiveData || !this.deepDiveData.logs || this.deepDiveData.logs.length === 0) {
      return alert('No project logs to export.');
    }
    
    let csvContent = 'Date,Agent,Action,Thought Process\n';
    for (const log of this.deepDiveData.logs) {
      const date = new Date(log.created_at).toLocaleString().replace(/,/g, '');
      const agent = (log.agent_name || '').replace(/"/g, '""');
      const logicalAction = log.action_taken || log.action_type || '';
      const action = logicalAction.replace(/"/g, '""');
      const logicalProcess = log.thought_process || log.details || '';
      const process = logicalProcess.replace(/"/g, '""');
      csvContent += `"${date}","${agent}","${action}","${process}"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Project_Log_${this.deepDiveData.campaign.client_domain}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generateVeraPDF() {
    // Generate Executive Report PDF based on Dallmayr layouts via HTML capture
    const el = document.getElementById('vera-pdf-report');
    if (!el) return alert('Cannot locate report generation UI.');
    
    // Unhide the report element momentarily to capture it
    el.classList.remove('hidden');
    el.style.display = 'block';

    html2canvas(el, { scale: 2, useCORS: true }).then(canvas => {
      el.classList.add('hidden');
      el.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`Vera_AI_Monthly_Report_${this.deepDiveData.campaign.client_domain}.pdf`);
    }).catch(err => {
      console.error(err);
      el.classList.add('hidden');
      el.style.display = 'none';
      alert('Failed to generate PDF.');
    });
  }

  get parsedKeywords() {
    if (!this.deepDiveData || !this.deepDiveData.tasks) return [];
    return this.deepDiveData.tasks.filter((t:any) => t.assigned_agent === 'ResearchAgent' || t.task_type.includes('Keyword'));
  }

  get parsedCompetitors() {
    if (!this.deepDiveData || !this.deepDiveData.tasks) return [];
    return this.deepDiveData.tasks.filter((t:any) => t.assigned_agent === 'AutoResearchAgent' || t.task_type.includes('Competitor'));
  }

  get categorizedRankings() {
    if (!this.deepDiveData || !this.deepDiveData.metrics || this.deepDiveData.metrics.length === 0) {
      return { targeted: [], untargeted: [], allForCsv: [] };
    }
    
    const latest = this.deepDiveData.metrics[0];
    const previous = this.deepDiveData.metrics.length > 1 ? this.deepDiveData.metrics[1] : null;
    
    let currentKeywords: any[] = [];
    try {
      currentKeywords = typeof latest.top_keywords === 'string' ? JSON.parse(latest.top_keywords) : (latest.top_keywords || []);
    } catch(e) {}

    // Deduplicate current keywords to keep only the highest ranking URL occurrence
    const uniqueKwMap = new Map<string, any>();
    currentKeywords.forEach(ck => {
      if (!ck.keyword) return;
      const kw = ck.keyword.toLowerCase();
      if (!uniqueKwMap.has(kw) || uniqueKwMap.get(kw).position > ck.position) {
         uniqueKwMap.set(kw, ck);
      }
    });
    currentKeywords = Array.from(uniqueKwMap.values());
    
    // Build Target Set
    const targetSet = new Set<string>();
    this.parsedKeywords.forEach((t:any) => {
      let pl = t.result_payload || t.payload;
      if (typeof pl === 'string') try { pl = JSON.parse(pl); } catch(e){}
      if (Array.isArray(pl)) {
        pl.forEach((p:any) => p.keyword && targetSet.add(p.keyword.toLowerCase()));
      } else if (pl && pl.keyword) {
        targetSet.add(pl.keyword.toLowerCase());
      }
    });
    if (this.backlinkKeywords) {
      this.backlinkKeywords.split(',').forEach(k => {
        if(k.trim()) targetSet.add(k.trim().toLowerCase());
      });
    }

    // Build History Map for Sparklines
    let historyMap = new Map<string, number[]>();
    for (let i = this.deepDiveData.metrics.length - 1; i >= 0; i--) {
       let m = this.deepDiveData.metrics[i];
       let kwData:any[] = [];
       try { kwData = typeof m.top_keywords === 'string' ? JSON.parse(m.top_keywords) : (m.top_keywords || []); } catch(e){}
       kwData.forEach((k: any) => {
          if (!k.keyword) return;
          if (!historyMap.has(k.keyword.toLowerCase())) historyMap.set(k.keyword.toLowerCase(), []);
       });
       historyMap.forEach((arr, kwString) => {
         let found = kwData.find((k:any) => k.keyword?.toLowerCase() === kwString);
         let pos = found ? found.position : 100; // unranked
         arr.push(pos);
       });
    }

    let results = currentKeywords.map((ck: any) => {
      const kwKey = ck.keyword.toLowerCase();
      const hist = historyMap.get(kwKey) || [ck.position];
      
      let change = 0;
      if (hist.length > 1) {
         let prev = hist[hist.length - 2];
         if (prev !== 100) change = prev - ck.position;
         else if (prev === 100 && ck.position < 100) change = 999; // new entry
      }
      
      return {
        keyword: ck.keyword,
        volume: ck.search_volume || ck.volume || 0,
        position: ck.position,
        change: change,
        isTargeted: targetSet.has(kwKey),
        history: hist
      };
    });

    return {
       targeted: results.filter(r => r.isTargeted).sort((a,b)=>a.position - b.position),
       untargeted: results.filter(r => !r.isTargeted).sort((a,b)=>a.position - b.position).slice(0, 20),
       allForCsv: results
    };
  }

  getSparkPts(history: number[]): string {
      if (!history || history.length < 2) return '';
      const w = 60;
      const h = 20;
      const minP = Math.min(...history);
      const maxP = Math.max(...history);
      const range = (maxP - minP) || 1;
      
      const pts = history.map((p, i) => {
         const x = (i / (history.length - 1)) * w;
         const y = h - (((maxP - p) / range) * h);
         return `${x},${y}`;
      });
      return pts.join(' ');
  }

  exportKeywordsCSV() {
    const data = this.categorizedRankings.allForCsv;
    if (!data.length) return alert('No keywords to export');
    
    const rows = ['Keyword,Targeted,Volume,Position,Change'];
    data.forEach((d:any) => {
      rows.push(`"${d.keyword}",${d.isTargeted ? 'Yes' : 'No'},${d.volume},${d.position},${d.change === 999 ? 'NEW' : d.change}`);
    });
    
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ishack_seo_keywords_${this.deepDiveData?.campaign?.client_domain || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  get realMetrics() {
    return this.deepDiveData?.metrics?.[0] || { organic_traffic: 0, organic_keywords: 0, domain_rating: 0 };
  }

  loadDeepDive(id: number) {
    this.http.get<any>(`${environment.apiUrl}/admin/campaigns/${id}/deepdive`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.deepDiveData = res;
        this.inspectingCampaignId = id;
        this.deepDiveReport = ''; // clear any old report
        
        this.draftingContent = '';
        this.backlinkKeywords = res.campaign?.backlink_keywords || '';
        
        if (res.tasks) {
           const draftTask = [...res.tasks].reverse().find((t:any) => t.assigned_agent === 'ImplementationAgent' || t.task_type.includes('Draft'));
           if (draftTask) {
             let payloadSrc = draftTask.result_payload || draftTask.payload;
             if (typeof payloadSrc === 'string') {
               try { payloadSrc = JSON.parse(payloadSrc); } catch(e){}
             }
             // Best UX for SEO manager: Just extract the suggested writing topic strings directly if available
             if (payloadSrc && payloadSrc.suggestedKeyword) {
               this.draftingContent = 'Recommended Content Strategy generated for SEO Topic:\n\n' + payloadSrc.suggestedKeyword + '\n\n... Agent writing pipeline is active.';
             } else {
               this.draftingContent = typeof payloadSrc === 'string' ? payloadSrc : JSON.stringify(payloadSrc, null, 2);
             }
           }
        }
      },
      error: () => alert('Failed to launch Deep Dive environment.')
    });
  }

  closeDeepDive() {
    this.inspectingCampaignId = null;
    this.deepDiveData = null;
  }

  formatPayload(task: any): any {
    try {
      const src = task.result_payload || task.payload;
      let parsed = typeof src === 'string' ? JSON.parse(src) : src;
      if (Array.isArray(parsed)) {
        return { isArray: true, items: parsed };
      }
      return { isArray: false, data: parsed || {} };
    } catch (e) {
      return { isArray: false, data: { raw: task.result_payload || task.payload } };
    }
  }


  deepDiveAction(actionType: string, payload: any) {
    if (!this.inspectingCampaignId) return;
    if (actionType !== 'generate_report' && !payload) return alert('Input required.');

    if (actionType === 'generate_report') {
       this.deepDiveReport = "Synthesizing executive report...\nInitializing Vera Sharp...\nParsing historical node telemetry...";
    }

    this.http.post<any>(`${environment.apiUrl}/admin/campaigns/${this.inspectingCampaignId}/action`, { actionType, payload }, { headers: this.getHeaders() }).subscribe({
       next: (res) => {
         if (actionType === 'generate_report') {
            this.deepDiveReport = res.report;
         } else {
            alert(res.message);
            this.loadDeepDive(this.inspectingCampaignId!); // refresh state
         }
       },
       error: (err) => {
         alert('Deep dive neural directive failed.');
         if (actionType === 'generate_report') this.deepDiveReport = 'Report synthesis failed.';
       }
    });
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

  startCampaign(domain: string, tier: string, agencyId: string = '', territory: string = 'us', gaPropertyId: string = '', wpUrl: string = '', wpUsername: string = '', wpPassword: string = '', wpStatus: string = 'publish') {
    if (!domain) return alert("Please enter a domain");
    
    this.http.post(`${environment.apiUrl}/admin/sandbox/start-campaign`, { domain, tier, agencyId, territory, gaPropertyId, wpUrl, wpUsername, wpPassword, wpStatus }, { headers: this.getHeaders() }).subscribe({
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
