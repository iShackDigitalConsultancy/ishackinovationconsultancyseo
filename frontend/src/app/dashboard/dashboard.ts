import { Component, OnInit, inject, AfterViewChecked } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

Chart.register(...registerables);

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
              <div *ngFor="let cam of campaigns" [id]="'client_report_' + cam.id" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
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
                  <div class="text-right flex items-center gap-3">
                    <button (click)="generateClientReport(cam, 'client_report_' + cam.id)" class="bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5" title="Download Executive PDF">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       Save Report
                    </button>
                    <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">{{ cam.completed_tasks?.length || 0 }} Operations Complete</span>
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
                      <div class="grid grid-cols-2 gap-4">
                        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                           <div class="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1">Organic Traffic</div>
                           <div class="text-2xl font-black text-indigo-900">{{ cam.live_metrics.organic_traffic | number }}</div>
                        </div>
                        <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                           <div class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">Ranked Keywords</div>
                           <div class="text-2xl font-black text-emerald-900">{{ cam.live_metrics.organic_keywords | number }}</div>
                        </div>
                      </div>
                      <div class="flex justify-between items-center border border-slate-100 rounded-lg p-3 bg-white shadow-sm">
                        <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">Domain Authority</span>
                        <span class="text-lg font-bold text-slate-900">{{ cam.live_metrics.domain_rating }} <span class="text-[10px] text-slate-400 font-normal">DR</span></span>
                      </div>
                      
                      <!-- Chart Canvas -->
                      <div class="mt-6 pt-6 border-t border-slate-100">
                        <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Traffic Velocity (30 Days)</h5>
                        <div class="relative h-48 w-full bg-white rounded-xl">
                          <canvas [id]="'trafficChart_' + cam.id"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Right: Finalized Agent Payloads (Proof of Work & Output) -->
                  <div class="col-span-1 lg:col-span-2 space-y-4">
                    
                    <!-- Human in the Loop (Pending Approvals) -->
                    <div *ngIf="cam.pending_approvals?.length > 0" class="mb-8">
                       <h4 class="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                         Awaiting Your Approval
                       </h4>
                       <div class="space-y-4">
                          <div *ngFor="let task of cam.pending_approvals" class="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                             <div class="flex justify-between items-start mb-3">
                                <div>
                                   <span class="font-extrabold text-amber-900 drop-shadow-sm">{{ task.task_type }}</span>
                                   <span class="text-[10px] text-amber-600 font-mono font-bold uppercase tracking-widest block mt-0.5">Assigned Agent: {{ task.assigned_agent }}</span>
                                </div>
                             </div>
                             
                             <div class="text-sm text-slate-800 leading-relaxed font-medium bg-white p-4 rounded-lg shadow-inner mb-4 max-h-48 overflow-y-auto">
                                <ng-container *ngIf="formatPayload(task) as parsed">
                                  <div *ngIf="parsed.data?.suggestedKeyword" class="font-bold text-slate-800 mb-1">Target Topic: {{ parsed.data.suggestedKeyword }}</div>
                                  <div *ngIf="parsed.data?.seoTitle" class="font-bold text-slate-800 mb-1">Proposed Title: {{ parsed.data.seoTitle }}</div>
                                  <div *ngIf="parsed.data?.notes" class="text-slate-600 italic border-l-2 border-amber-200 pl-2 mt-2">{{ parsed.data.notes }}</div>
                                  <div *ngIf="!parsed.data?.suggestedKeyword && !parsed.data?.seoTitle" class="whitespace-pre-wrap text-slate-600 font-mono text-xs">{{ parsed.data | json }}</div>
                                </ng-container>
                             </div>
                             
                             <div class="flex gap-3 justify-end border-t border-amber-200/50 pt-3">
                                <button (click)="submitApproval(task.id, false, cam)" class="px-4 py-2 rounded-lg font-bold text-slate-500 hover:bg-white hover:text-red-500 transition-colors text-sm">Reject & Rework</button>
                                <button (click)="submitApproval(task.id, true, cam)" class="bg-amber-500 hover:bg-amber-600 text-white shadow-md font-bold px-6 py-2 rounded-lg transition-all text-sm flex items-center gap-2">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                   Approve Directive
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>

                    <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider">SEO Execution Timeline</h4>
                    
                    <div *ngIf="cam.completed_tasks?.length === 0" class="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-inner">
                      <svg class="w-8 h-8 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      Agents are currently formulating semantic mapping. Operational log will output here when executions conclude.
                    </div>
                    
                    <div class="relative border-l-2 ml-4 border-slate-200 space-y-6 pb-4 pt-2 mt-4" *ngIf="cam.completed_tasks?.length > 0">
                      <div *ngFor="let task of cam.completed_tasks; let i = index" class="relative pl-6 group">
                        <!-- Timeline Dot -->
                        <div class="absolute w-4 h-4 rounded-full bg-white border-2 -left-[9px] top-1" [style.border-color]="branding.brand_color">
                          <div class="w-1.5 h-1.5 rounded-full m-[3px] animate-pulse" [style.background-color]="branding.brand_color"></div>
                        </div>
                        
                        <div class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all group-hover:border-slate-300 cursor-default">
                          <div class="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                            <div>
                               <span class="text-sm font-extrabold text-slate-900 drop-shadow-sm flex items-center gap-2" [style.color]="branding.brand_color">
                                 <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                 {{ task.task_type }}
                               </span>
                               <span class="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5 block ml-6">{{ task.assigned_agent }}</span>
                            </div>
                            <span class="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 shadow-sm">{{ task.completed_at | date:'MMM d, h:mm a' }}</span>
                          </div>
                          
                          <div class="text-sm text-slate-600 leading-relaxed font-medium">
                             <!-- Human-Readable Translation -->
                             <ng-container *ngIf="formatPayload(task) as parsed">
                               <div *ngIf="parsed.summary" class="mb-3 text-slate-700">{{ parsed.summary }}</div>
                               
                               <!-- Map structured data into pills/tags -->
                               <div *ngIf="parsed.isArray" class="flex flex-wrap gap-2">
                                  <div *ngFor="let item of parsed.items" class="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    {{ item.keyword || item.topic || item.url || item.trackedCompetitor || 'Optimized Asset' }}
                                  </div>
                               </div>
                               
                               <div *ngIf="!parsed.isArray && parsed.data && (parsed.data | json) !== '{}'" class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs shadow-inner">
                                 <div *ngIf="parsed.data.suggestedKeyword" class="font-bold text-slate-800 mb-1">Target Topic / Keyword: <span class="text-indigo-600">{{ parsed.data.suggestedKeyword }}</span></div>
                                 <div *ngIf="parsed.data.seoTitle" class="font-bold text-slate-800 mb-1">Content Title Generated: <span class="text-slate-600 font-normal">{{ parsed.data.seoTitle }}</span></div>
                                 <div *ngIf="parsed.data.notes" class="text-slate-500 italic border-l-2 border-slate-300 pl-2 mt-2">{{ parsed.data.notes }}</div>
                                 
                                 <!-- Fallback for other standard objects -->
                                 <div *ngIf="!parsed.data.suggestedKeyword && !parsed.data.seoTitle && !parsed.data.notes && !parsed.data.raw" class="whitespace-pre-wrap text-slate-400 font-mono mt-1 text-[10px] break-all leading-snug">{{ parsed.data | json }}</div>
                               </div>
                             </ng-container>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

     <!-- Floating AI Concierge Chat -->
     <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-fade-in font-sans">
       <!-- Chat Window -->
       <div *ngIf="isChatOpen" class="bg-white border border-slate-200 rounded-2xl shadow-2xl w-[360px] sm:w-[420px] mb-4 flex flex-col overflow-hidden animate-slide-up h-[500px]">
          <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex justify-between items-center" [style.border-bottom]="'4px solid ' + (branding.brand_color || '#4f46e5')">
             <h3 class="text-white font-extrabold flex items-center gap-2">
                <span class="text-xl">✨</span> Vera Sharp Concierge
             </h3>
             <button (click)="toggleChat()" class="text-white/70 hover:text-white transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
          </div>
          <div class="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 flex flex-col">
             <div *ngIf="chatMessages.length === 0" class="text-center text-slate-500 text-sm italic mt-8 font-medium">Hello! I'm the AI driving your SEO campaign. Ask me anything about your current traffic or active executions.</div>
             <div *ngFor="let msg of chatMessages" class="text-sm rounded-xl p-4 max-w-[85%] shadow-sm" [ngClass]="msg.role === 'user' ? 'text-white self-end rounded-tr-none' : 'bg-white text-slate-700 self-start rounded-tl-none border border-slate-200'" [style.background-color]="msg.role === 'user' ? (branding.brand_color || '#007bff') : ''">
                <strong *ngIf="msg.role === 'assistant'" class="block mb-1 text-xs uppercase tracking-widest" [style.color]="branding.brand_color || '#007bff'">Vera Sharp</strong>
                <div [innerHTML]="msg.content" class="whitespace-pre-line leading-relaxed font-medium"></div>
             </div>
             <div *ngIf="isChatLoading" class="self-start bg-white border border-slate-200 text-slate-400 text-sm rounded-xl p-4 rounded-tl-none flex items-center gap-2 shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full animate-bounce" [style.background-color]="branding.brand_color || '#007bff'"></span>
                <span class="w-1.5 h-1.5 rounded-full animate-bounce" [style.background-color]="branding.brand_color || '#007bff'" style="animation-delay: 0.2s"></span>
                <span class="w-1.5 h-1.5 rounded-full animate-bounce" [style.background-color]="branding.brand_color || '#007bff'" style="animation-delay: 0.4s"></span>
             </div>
          </div>
          <div class="p-3 bg-white border-t border-slate-200 flex gap-2">
             <input [(ngModel)]="chatInput" (keyup.enter)="sendChatMessage()" type="text" placeholder="Why did our DR increase?" class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all" [style.focus.ring-color]="branding.brand_color">
             <button (click)="sendChatMessage()" [disabled]="isChatLoading" class="text-white p-2.5 rounded-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-md disabled:opacity-50" [style.background-color]="branding.brand_color || '#007bff'">
                <svg class="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
             </button>
          </div>
       </div>
       <!-- Chat Toggle Button -->
       <button (click)="toggleChat()" class="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/20 border-2 border-white transition-all hover:scale-105 active:scale-95 hover:shadow-2xl z-50 bg-slate-900 hover:bg-slate-800" [style.background-color]="branding.brand_color">
          <svg *ngIf="!isChatOpen" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          <svg *ngIf="isChatOpen" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
     </div>
    </div>
  `
})
export class Dashboard implements OnInit, AfterViewChecked {
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
  
  chartsRendered = false;
  chartInstances: { [key: string]: Chart } = {};

  // Chat State
  isChatOpen: boolean = false;
  chatMessages: {role: string, content: string}[] = [];
  chatInput: string = '';
  isChatLoading: boolean = false;

  ngOnInit() {
    this.fetchPortalData();
  }

  ngAfterViewChecked() {
    if (!this.chartsRendered && this.campaigns && this.campaigns.length > 0) {
      if (typeof window !== 'undefined') {
        setTimeout(() => this.renderCharts(), 100);
      }
      this.chartsRendered = true;
    }
  }

  renderCharts() {
    if (typeof window === 'undefined') return;
    
    this.campaigns.forEach(cam => {
      const canvasId = `trafficChart_${cam.id}`;
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      
      if (!canvas) return;
      if (this.chartInstances[canvasId]) this.chartInstances[canvasId].destroy();

      const history = cam.historical_metrics || [];
      if (history.length === 0) return;

      const labels = history.map((m: any) => new Date(m.snapshot_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      const trafficData = history.map((m: any) => m.organic_traffic);
      
      this.chartInstances[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Organic Traffic',
            data: trafficData,
            borderColor: this.branding.brand_color || '#4f46e5',
            backgroundColor: (this.branding.brand_color || '#4f46e5') + '20', // Add 20 hex opacity
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#1e293b',
              titleFont: { size: 11 },
              bodyFont: { size: 13, weight: 'bold' },
              padding: 10,
              cornerRadius: 8,
              displayColors: false
            }
          },
          scales: {
            x: {
              display: false, // Hide x-axis to keep clean look
              grid: { display: false }
            },
            y: {
              display: true,
              position: 'left',
              border: { display: false },
              grid: { color: '#f1f5f9' },
              ticks: { color: '#94a3b8', font: { size: 10, family: 'monospace' }, maxTicksLimit: 5 }
            }
          },
          interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
      });
    });
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
        this.chartsRendered = false; // Trigger re-render of charts on fresh data
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

  formatPayload(task: any): { isArray: boolean, items: any[], data: any, summary: string } {
    let payloadStr = task.result_payload || task.payload || '{}';
    let parsed: any = {};
    try {
      parsed = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr;
    } catch (e) {
      return { isArray: false, items: [], data: { raw: payloadStr }, summary: 'Executed raw operational directive.' };
    }

    let summary = '';
    const typeUpper = (task.task_type || '').toUpperCase();
    if (typeUpper.includes('SYNC') || typeUpper.includes('MAPPING') || typeUpper.includes('KEYWORD')) summary = 'Algorithmic semantic mapping formulated and saved to memory index.';
    else if (typeUpper.includes('COMPETITOR') || typeUpper.includes('AUTORESEARCH')) summary = 'Analyzed competitor domain architecture and extracted organic weak points.';
    else if (typeUpper.includes('DRAFT') || typeUpper.includes('CONTENT')) summary = 'Drafted High-converting SEO semantic content clustering payload.';
    else if (typeUpper.includes('AUDIT') || typeUpper.includes('SCHEMA')) summary = 'Crawled and catalogued structural on-page technical factors.';
    else if (typeUpper.includes('BACKLINK') || typeUpper.includes('LINK')) summary = 'Outreach algorithm initiated for high-DR anchor text acquisitions.';
    else if (typeUpper.includes('CMS') || typeUpper.includes('WORDPRESS')) summary = 'Payload securely integrated and published to active CMS architecture.';

    if (Array.isArray(parsed)) {
      return { isArray: true, items: parsed, data: null, summary };
    }
    return { isArray: false, items: [], data: parsed, summary };
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

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendChatMessage() {
    if (!this.chatInput.trim()) return;
    const msg = this.chatInput;
    this.chatMessages.push({ role: 'user', content: msg });
    this.chatInput = '';
    this.isChatLoading = true;
    
    this.http.post<any>(`${environment.apiUrl}/client/chat`, { message: msg }, { headers: this.getHeaders() }).subscribe({
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

  submitApproval(taskId: number, isApproved: boolean, cam: any) {
    let feedback = '';
    if (!isApproved) {
      feedback = prompt("Provide precise rationale for rejecting this payload so Vera Sharp can rework the thesis:") || 'No reason provided.';
      if (!feedback) return; // User cancelled
    }

    this.http.post<any>(`${environment.apiUrl}/client/approve-task`, { taskId, isApproved, feedback }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        alert(res.message);
        this.fetchPortalData(); // Refresh UI pipeline
      },
      error: () => alert('Neural link disruption. Failed to submit approval.')
    });
  }

  generateClientReport(cam: any, elementId: string) {
    const el = document.getElementById(elementId);
    if (!el) return alert('Cannot locate report UI.');
    
    // Briefly adjust styling of element for PDF rendering
    const originalMaxHeight = el.style.maxHeight;
    const scrollContainers = el.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach((e: any) => e.classList.remove('overflow-y-auto', 'max-h-48'));
    
    // Add a temporary branded watermark
    const watermark = document.createElement('div');
    watermark.innerHTML = `This report was automatically synthesized by Vera Sharp on ${new Date().toLocaleDateString()}`;
    watermark.style.cssText = 'position: absolute; bottom: 10px; right: 20px; font-size: 10px; color: #94a3b8; font-family: monospace; z-index: 50;';
    el.appendChild(watermark);

    html2canvas(el, { scale: 2, useCORS: true }).then(canvas => {
      // Revert styles
      scrollContainers.forEach((e: any) => e.classList.add('overflow-y-auto', 'max-h-48'));
      if (el.contains(watermark)) el.removeChild(watermark);

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

      pdf.save(`Executive_Report_${cam.client_domain.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    }).catch(err => {
      scrollContainers.forEach((e: any) => e.classList.add('overflow-y-auto', 'max-h-48'));
      if (el.contains(watermark)) el.removeChild(watermark);
      alert('Failed to generate PDF snapshot.');
    });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    this.router.navigate(['/']);
  }
}
