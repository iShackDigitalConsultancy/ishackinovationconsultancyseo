import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col pt-12 pb-24">
      
      <!-- Top Navigation & Progress -->
      <div class="max-w-2xl mx-auto w-full px-6 mb-8 text-center relative">
         <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 tracking-tight">iShackAEO</h1>
         <!-- Progress Bar (Steps 2-5) -->
         <div *ngIf="currentStep > 1 && currentStep <= 5.5" class="flex items-center justify-center gap-2 mt-6">
           <ng-container *ngFor="let step of [2,3,4,5]; let i = index">
             <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  [ngClass]="getStepClass(i + 2)">
               <svg *ngIf="currentStep > (i + 2)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
               <span *ngIf="currentStep <= (i + 2)">{{ i + 1 }}</span>
             </div>
             <div *ngIf="i < 3" class="h-1 w-12 rounded-full transition-all" [ngClass]="currentStep > (i + 2) ? 'bg-green-500' : 'bg-slate-200'"></div>
           </ng-container>
         </div>
      </div>

      <!-- Main Interactive Container -->
      <div class="max-w-xl mx-auto w-full px-4">
        
        <!-- STEP 1: Search Query -->
        <div *ngIf="currentStep === 1" class="mt-8 mb-12 animate-fade-in text-left">
          
          <h1 class="text-[32px] md:text-5xl font-black text-slate-900 leading-[1.1] md:leading-tight mb-6 tracking-tight">
            Rank & Get<br class="hidden md:block"/> Recommended by<br/>
            <span class="text-blue-600">Google</span>, <span class="text-blue-600">ChatGPT</span><br/>
            AND <span class="text-blue-600">Perplexity</span>
          </h1>
          
          <div class="space-y-3 text-[15px] md:text-base text-slate-800 font-medium mb-6">
            <p>
              You're 1.8 months behind competitors who do SEO.
            </p>
            <p>
              We catch you up with 1 expert article daily + building trust (backlinks).
            </p>
            <p class="font-bold text-slate-900 mt-4 mb-2">
              Get more customers from ChatGPT & Google on autopilot
            </p>
          </div>

          <form (ngSubmit)="startOnboarding()" class="w-full">
            <div class="flex items-center w-full border-2 border-blue-500 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/20 transition-all bg-white mb-4">
              <div class="bg-slate-50 text-slate-400 font-medium px-4 py-4 border-r border-slate-200 shrink-0">
                https://
              </div>
              <input type="text" [(ngModel)]="searchQuery" name="query" required
                     class="w-full flex-1 px-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-lg bg-transparent" 
                     placeholder="yourwebsite.com">
            </div>
            
            <button type="submit" [disabled]="isLoading || !searchQuery" 
                    class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[17px] py-4 rounded-xl shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-all flex justify-center items-center gap-2"
                    [ngClass]="{'opacity-70 cursor-not-allowed': isLoading || !searchQuery}">
              <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isLoading ? 'Analyzing Architecture...' : 'Get 5 Articles + 30-Day Content Plan &rarr;' }}
            </button>
          </form>

          <div class="mt-8 space-y-3 font-medium text-slate-600 text-[15px]">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              267% Avg Traffic Increase
            </div>
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              180+ Businesses Growing
            </div>
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              Zero Technical Skills Needed
            </div>
          </div>

        </div>

        <!-- NEW STEP 2: Business Information -->
        <div *ngIf="currentStep === 2" class="animate-slide-up text-left">
          
          <div class="text-center mb-8">
            <h1 class="text-3xl font-black text-slate-900 mb-2">Your Business Information</h1>
            <p class="text-slate-500">We use this to write articles tailored to your business</p>
          </div>

          <div class="space-y-6 mb-24">
            
            <!-- Brand & Language -->
            <div class="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 pb-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg></div>
                <h3 class="font-bold text-slate-700">Brand & Language</h3>
              </div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">Brand Name</label>
              <input type="text" [(ngModel)]="businessContext.brandName" class="w-full border border-slate-300 rounded-lg px-4 py-3 font-semibold text-slate-900 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-bold mb-5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg> Compatible with iShackAEO
              </div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">Article Language</label>
              <select [(ngModel)]="businessContext.language" class="w-full border border-slate-300 rounded-lg px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="English">🇺🇸 English</option>
                <option value="Spanish">🇪🇸 Spanish</option>
                <option value="French">🇫🇷 French</option>
              </select>
            </div>

            <!-- Target Market -->
            <div class="bg-white rounded-2xl border border-green-100 shadow-sm p-5 pb-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
                <h3 class="font-bold text-slate-700">Target Market</h3>
              </div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">Country</label>
              <select [(ngModel)]="businessContext.country" class="w-full border border-slate-300 rounded-lg px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white mb-5">
                <option value="United States">🇺🇸 United States</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="South Africa">🇿🇦 South Africa</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Australia">🇦🇺 Australia</option>
              </select>
              <label class="block text-sm font-semibold text-slate-600 mb-2">Customer Reach</label>
              <div class="space-y-2">
                <label class="flex items-center border border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-slate-50" [class.border-emerald-500]="businessContext.customerReach === 'Nationwide or wide area'">
                  <input type="radio" name="reach" [(ngModel)]="businessContext.customerReach" value="Nationwide or wide area" class="w-5 h-5 text-emerald-500 focus:ring-emerald-500">
                  <span class="ml-3 font-medium text-slate-700">Nationwide or wide area</span>
                </label>
                <label class="flex items-center border border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-slate-50" [class.border-emerald-500]="businessContext.customerReach === 'Local to a specific city or area'">
                  <input type="radio" name="reach" [(ngModel)]="businessContext.customerReach" value="Local to a specific city or area" class="w-5 h-5 text-emerald-500 focus:ring-emerald-500">
                  <span class="ml-3 font-medium text-slate-700">Local to a specific city or area</span>
                </label>
              </div>
            </div>

            <!-- Business Description -->
            <div class="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 pb-6 text-left">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded bg-purple-500 text-white flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></div>
                <h3 class="font-bold text-slate-700">Business Description</h3>
              </div>
              <p class="text-sm text-slate-500 mb-3">Review and edit to match your business perfectly</p>
              <textarea [(ngModel)]="businessContext.description" rows="3" class="w-full border border-slate-300 rounded-lg px-4 py-3 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
            </div>

            <!-- What You Sell -->
            <div class="bg-white rounded-2xl border border-green-200 shadow-sm p-5 pb-6">
              <div class="flex items-start gap-4 mb-4">
                 <div class="w-10 h-10 shrink-0 rounded-xl bg-green-500 text-white flex items-center justify-center">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                 </div>
                 <div>
                   <h3 class="font-black text-xl text-slate-800">What You Sell</h3>
                   <p class="text-sm text-slate-500 mt-1">Products or services you offer to customers</p>
                 </div>
              </div>
              
              <div class="space-y-3 mb-4">
                <div *ngFor="let item of businessContext.whatYouSell; let i = index" class="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                  <span class="font-bold text-slate-800">{{item}}</span>
                  <button (click)="removeSellItem(i)" class="text-slate-400 hover:text-red-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <input type="text" [(ngModel)]="newSellItem" (keyup.enter)="addSellItem()" placeholder="Add Product or Service..." class="flex-1 border border-slate-300 rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none">
                <button (click)="addSellItem()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">+ Add</button>
              </div>
            </div>

            <!-- What You Don't Sell -->
            <div class="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-5 pb-6">
              <div class="flex items-start gap-4 mb-4">
                 <div class="w-10 h-10 shrink-0 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </div>
                 <div>
                   <h3 class="font-black text-xl text-slate-800">What You Don't Sell</h3>
                   <p class="text-sm text-slate-500 mt-1">Related items or services you don't offer (helps clarify your business scope)</p>
                 </div>
              </div>
              
              <div class="space-y-3 mb-4">
                <div *ngFor="let item of businessContext.whatYouDontSell; let i = index" class="border border-red-200 bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <span class="font-bold text-slate-800">{{item}}</span>
                  <button (click)="removeDontSellItem(i)" class="text-slate-400 hover:text-red-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <input type="text" [(ngModel)]="newDontSellItem" (keyup.enter)="addDontSellItem()" placeholder="Add exclusionary term..." class="flex-1 border border-slate-300 rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none">
                <button (click)="addDontSellItem()" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg">+ Add</button>
              </div>
            </div>

            <!-- Priority Product Selection -->
            <div class="bg-white rounded-2xl border border-blue-200 shadow-lg p-6 text-center mt-12 mb-8">
              <h2 class="text-2xl font-black text-slate-900 mb-2">Which Product Should We Focus On First?</h2>
              <p class="text-slate-500 mb-6">Choose one product or service for your first article. We'll create content for the others too.</p>
              
              <div class="space-y-3 max-w-md mx-auto">
                <div *ngFor="let item of businessContext.whatYouSell; let i = index" 
                     (click)="setPriorityProduct(item)"
                     class="border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all"
                     [ngClass]="priorityProduct === item ? 'border-green-500 bg-green-50 shadow-md' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'">
                  <div class="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold"
                       [ngClass]="priorityProduct === item ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'">
                    {{i + 1}}
                  </div>
                  <span class="font-bold text-lg text-slate-800 text-left">{{item}}</span>
                </div>
              </div>
            </div>

          </div>

          <div class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-8 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
             <span class="text-slate-400 text-xs font-bold uppercase tracking-wider pl-4">Step 2 of 6</span>
             <button (click)="generateKeywords()" [disabled]="isLoading || !priorityProduct" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all w-[240px] flex justify-center items-center disabled:opacity-50">
               <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               <span *ngIf="!isLoading">Confirm & Continue &rarr;</span>
             </button>
          </div>
        </div>

        <!-- STEP 3: Keywords -->
        <div *ngIf="currentStep === 3" class="animate-slide-up">
          <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 flex gap-4 items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-slate-800">Here's the 5 best search terms we've found</h2>
              <p class="text-slate-500 text-sm mt-1">Remove any that don't fit your business.</p>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-3 mb-10">
             <div *ngFor="let kw of keywords; let i = index" class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-2xl flex items-center justify-between gap-4 w-full cursor-pointer hover:bg-blue-100 transition-colors shadow-sm">
               <span class="font-bold text-[15px]">{{ kw }}</span>
               <div class="flex items-center gap-2 text-blue-400">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                 <button (click)="removeKeyword(i)" class="hover:text-blue-600 transition-colors">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
               </div>
             </div>
          </div>
          
          <div class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-8 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
             <span class="text-slate-400 text-xs font-bold uppercase tracking-wider pl-4">Step 3 of 6</span>
             <button (click)="submitKeywords()" [disabled]="isLoading" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all w-[240px] flex justify-center items-center">
               <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               <span *ngIf="!isLoading">Looks good, let's go! &rarr;</span>
             </button>
          </div>
        </div>

        <!-- STEP 4: Articles -->
        <div *ngIf="currentStep === 4" class="animate-slide-up">
          <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 flex gap-4 items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-slate-800">Your first {{ articles.length }} articles</h2>
              <p class="text-slate-500 text-sm mt-1 leading-relaxed">We'll write and publish these to your website automatically. Click a title to edit it, or remove any you don't want.</p>
            </div>
          </div>
          
          <div class="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 mb-24 shadow-sm">
             <div *ngFor="let art of articles; let i = index" class="border border-slate-100 text-slate-800 p-5 rounded-2xl flex flex-col gap-4 w-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative group hover:shadow-md transition-shadow">
               <div class="flex items-start justify-between gap-4 w-full overflow-hidden">
                 <div class="flex gap-3 w-full">
                   <div class="mt-0.5">
                     <svg class="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                   </div>
                   <div class="flex-1">
                     <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                       <span class="font-extrabold text-[15px] leading-snug cursor-pointer group-hover:text-blue-600 transition-colors" (click)="editArticleContent(i)">{{ art.title }}</span>
                       <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                         {{ art.intent }} 
                       </span>
                     </div>
                     <p class="text-sm text-slate-500 font-medium leading-relaxed mb-3">
                       {{ art.synopsis }}
                     </p>
                     <div class="flex items-center gap-4 text-xs font-bold text-slate-400">
                       <div class="flex items-center gap-1.5">
                         <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                         WC: {{ art.target_wc }}
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 <div class="flex flex-col items-center gap-1 shrink-0 bg-white/80 backdrop-blur top-4 right-4 absolute opacity-0 group-hover:opacity-100 transition-opacity">
                   <button (click)="removeArticle(i)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-200 shadow-sm bg-white">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                   </button>
                 </div>
               </div>
             </div>
          </div>
          
          <div class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-8 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
             <button (click)="currentStep = 3" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg ml-2">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
             </button>
             <button (click)="currentStep = 5" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all w-[240px] flex justify-center items-center">
               <span>Looks good, let's go! &rarr;</span>
             </button>
          </div>
        </div>

        <!-- STEP 4.5: Article Editing -->
        <div *ngIf="currentStep === 4.5" class="animate-fade-in">
          <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 flex gap-4 items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div class="w-full">
              <h2 class="text-xl font-extrabold text-slate-800">Edit Article</h2>
              <input type="text" [(ngModel)]="articles[editingArticleIndex!].title" class="w-full mt-4 border-b-2 border-blue-500 pb-2 text-lg font-bold text-slate-900 focus:outline-none">
              <textarea [(ngModel)]="articles[editingArticleIndex!].synopsis" class="w-full mt-4 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" rows="6"></textarea>
              
              <!-- Action Buttons -->
              <div class="flex gap-3 mt-6">
                <button (click)="saveFullArticleContent()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors">Save Content</button>
                <button (click)="currentStep = 4" class="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 5: The Offer -->
        <div *ngIf="currentStep === 5" class="animate-slide-up pb-20">
          <div class="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
             <div class="flex items-center gap-2">
               <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
               <span class="font-extrabold text-blue-600 text-lg">iShackAEO</span>
             </div>
             <div class="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-200">
               <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               Offer expires in 9:44
             </div>
          </div>
          
          <h1 class="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">Get {{ articles.length }} SEO articles in 5 minutes for <span class="text-blue-600">{{ searchQuery }}</span></h1>
          <p class="text-slate-500 mb-8 font-medium">Plus a 30-day content plan based on your search terms.</p>
          
          <div class="space-y-4 mb-8">
            <div class="bg-white border text-center relative border-slate-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
              <div class="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <div class="text-left w-full">
                <div class="font-extrabold text-slate-800 text-base flex justify-between">{{ articles.length }} SEO Articles <svg class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
                <div class="text-xs text-slate-500 mt-1">Hero images & infographics included</div>
              </div>
            </div>
            
            <div class="bg-white border text-center relative border-slate-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
              <div class="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div class="text-left w-full">
                <div class="font-extrabold text-slate-800 text-base flex justify-between">30-Day Content Plan <svg class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
                <div class="text-xs text-slate-500 mt-1">Based on your winning search terms</div>
              </div>
            </div>
            
            <div class="bg-white border text-center relative border-slate-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
              <div class="w-10 h-10 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div class="text-left w-full">
                <div class="font-extrabold text-slate-800 text-base flex justify-between">Auto-Publish <svg class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
                <div class="text-xs text-slate-500 mt-1">WordPress, Shopify, Webflow, API. Set up once, publish automatically</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100 p-8 text-center relative overflow-hidden mb-8">
            <p class="text-sm font-medium text-slate-500 mb-2">3-day full access trial</p>
            <div class="flex items-baseline justify-center gap-2 mb-2">
              <span class="text-6xl font-black text-slate-900 tracking-tighter">$1</span>
              <span class="text-slate-400 line-through font-bold text-xl">$149/month</span>
            </div>
            <p class="text-slate-500 text-sm mb-6 font-medium">No contracts, no setup fees</p>
            
            <button (click)="currentStep = 6" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 mb-4">
              Get {{ articles.length }} articles for $1 now &rarr;
            </button>
            <button (click)="currentStep = 6" class="text-slate-400 text-sm font-bold underline mb-6 hover:text-slate-600">Skip for now</button>
            
            <div class="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 mb-4">
               <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
               Cancel anytime. No questions asked.
            </div>
            
            <div class="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-sm font-bold">
               You don't like it? We'll refund the $1 in 24 hours
            </div>
          </div>
        </div>

        <!-- STEP 6: Account Completion -->
        <div *ngIf="currentStep === 6" class="animate-slide-up pb-20">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-extrabold text-slate-900 mb-4">Almost Done!</h1>
            <p class="text-slate-500 font-medium">Enter your email to create your account and access your personalized content calendar.</p>
          </div>
          
          <div class="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100 p-6 md:p-8">
            <div class="flex items-center gap-3 mb-6">
               <div class="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center text-white shadow-md">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
               </div>
               <span class="font-bold text-slate-800 text-lg">Email Address</span>
            </div>
            
            <input type="email" [(ngModel)]="email" required
                   class="w-full border border-slate-200 rounded-xl px-5 py-4 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium mb-6 text-lg" 
                   placeholder="your@email.com">
                   
            <label class="flex items-start gap-3 cursor-pointer mb-8 group">
              <input type="checkbox" [(ngModel)]="agreedToTerms" class="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
              <span class="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">I agree to the <a href="#" class="text-blue-600 underline">Terms of Service</a> and <a href="#" class="text-blue-600 underline">Privacy Policy</a></span>
            </label>
            
            <button (click)="completeAccount()" [disabled]="isLoading || !email || !agreedToTerms" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-5 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 mb-6"
                    [ngClass]="{'opacity-50 cursor-not-allowed': isLoading || !email || !agreedToTerms}">
               <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               <span *ngIf="!isLoading">Create My Account & Get Started &rarr;</span>
            </button>
            
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <p class="text-sm font-bold text-blue-900 mb-0.5">Secure Login</p>
                <p class="text-xs text-blue-700/80 leading-relaxed font-medium">We'll send you a secure login link via email. No passwords needed!</p>
              </div>
            </div>
            
            <div *ngIf="completionMessage" class="mt-4 bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-200 text-center animate-fade-in shadow-sm">
               {{ completionMessage }}
            </div>
          </div>
          
          <div class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-8 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
             <button (click)="currentStep = 5" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg ml-2">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
             </button>
             <button (click)="completeAccount()" disabled class="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all w-[240px] flex justify-between items-center opacity-75">
               <span>Step 6 of 6</span>
               <span>Complete &check;</span>
             </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class OnboardingFunnel implements OnInit {
  private http = inject(HttpClient);
  private titleService = inject(Title);

  currentStep = 1;
  isLoading = false;
  
  leadId: number | null = null;
  searchQuery = '';
  email = '';
  agreedToTerms = false;
  
  businessContext: any = {
    brandName: '',
    language: 'English',
    country: 'South Africa',
    customerReach: 'Nationwide or wide area',
    description: '',
    whatYouSell: [],
    whatYouDontSell: []
  };
  priorityProduct = '';
  newSellItem = '';
  newDontSellItem = '';

  keywords: string[] = [];
  articles: any[] = [];
  editingArticleIndex: number | null = null;
  
  completionMessage = '';

  ngOnInit() {
    this.titleService.setTitle('Start Growth - iShackAEO');
  }

  getStepClass(stepNum: number) {
    if (this.currentStep > stepNum) return 'bg-green-500 text-white shadow-md shadow-green-500/30';
    if (this.currentStep === stepNum) return 'bg-slate-800 text-white shadow-md';
    return 'bg-slate-200 text-slate-500';
  }

  startOnboarding() {
    if (!this.searchQuery) return;
    this.isLoading = true;
    
    this.http.post<any>(`${environment.apiUrl}/onboarding/start`, { searchQuery: this.searchQuery }).subscribe(res => {
      this.leadId = res.leadId;
      
      this.http.post<any>(`${environment.apiUrl}/onboarding/analyze-site`, { leadId: this.leadId, url: this.searchQuery }).subscribe({
        next: (analysisRes) => {
          this.businessContext = analysisRes.businessContext;
          this.currentStep = 2;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.currentStep = 2;
        }
      });
    });
  }

  removeSellItem(i: number) { this.businessContext.whatYouSell.splice(i, 1); }
  removeDontSellItem(i: number) { this.businessContext.whatYouDontSell.splice(i, 1); }
  
  addSellItem() { 
    if (this.newSellItem.trim()) {
      this.businessContext.whatYouSell.push(this.newSellItem.trim());
      this.newSellItem = '';
    }
  }
  
  addDontSellItem() {
    if (this.newDontSellItem.trim()) {
      this.businessContext.whatYouDontSell.push(this.newDontSellItem.trim());
      this.newDontSellItem = '';
    }
  }

  setPriorityProduct(prod: string) {
    this.priorityProduct = prod;
  }

  generateKeywords() {
    if (!this.priorityProduct) return;
    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/onboarding/keywords`, { leadId: this.leadId, businessContext: this.businessContext, priorityProduct: this.priorityProduct }).subscribe(res => {
      this.keywords = res.keywords;
      this.currentStep = 3;
      this.isLoading = false;
    });
  }

  removeKeyword(idx: number) {
    this.keywords.splice(idx, 1);
  }

  submitKeywords() {
    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/onboarding/articles`, { leadId: this.leadId, approvedKeywords: this.keywords }).subscribe(res => {
      this.articles = res.articles;
      this.currentStep = 4;
      this.isLoading = false;
    });
  }

  removeArticle(idx: number) {
    this.articles.splice(idx, 1);
  }

  editArticleContent(idx: number) {
    this.editingArticleIndex = idx;
    this.currentStep = 4.5;
  }

  saveFullArticleContent() {
    this.currentStep = 4;
    this.editingArticleIndex = null;
  }

  completeAccount() {
    if (!this.email || !this.agreedToTerms) return;
    this.isLoading = true;
    
    this.http.post<any>(`${environment.apiUrl}/onboarding/complete`, { 
      leadId: this.leadId, 
      email: this.email,
      approvedArticles: this.articles
    }).subscribe(res => {
      this.isLoading = false;
      this.completionMessage = 'Account created successfully! We will generate your Magic Login link and email it to you shortly. You skip paying the $1 today!';
      
      setTimeout(() => {
        window.location.href = '/';
      }, 4000);
    });
  }
}
