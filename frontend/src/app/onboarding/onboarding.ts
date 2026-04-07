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
         <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 tracking-tight">AutoSEO</h1>
         <!-- Progress Bar (Steps 2-5) -->
         <div *ngIf="currentStep > 1 && currentStep <= 5" class="flex items-center justify-center gap-2 mt-6">
           <ng-container *ngFor="let step of [2,3,3.5,4,5]; let i = index">
             <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  [ngClass]="getStepClass(i + 2)">
               <svg *ngIf="currentStep > (i + 2)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
               <span *ngIf="currentStep <= (i + 2)">{{ i + 1 }}</span>
             </div>
             <div *ngIf="i < 4" class="h-1 w-12 rounded-full transition-all" [ngClass]="currentStep > (i + 2) ? 'bg-green-500' : 'bg-slate-200'"></div>
           </ng-container>
         </div>
      </div>

      <!-- Main Interactive Container -->
      <div class="max-w-xl mx-auto w-full px-4">
        
        <!-- STEP 1: Search Query -->
        <div *ngIf="currentStep === 1" class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 mt-12 animate-fade-in text-center">
          <div class="mb-8">
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" class="h-10 mx-auto drop-shadow-sm">
          </div>
          <p class="text-slate-400 text-sm mb-6 uppercase tracking-wider font-bold">Initiate Automated Growth</p>
          <form (ngSubmit)="startOnboarding()">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="text" [(ngModel)]="searchQuery" name="query" required
                     class="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-lg transition-all" 
                     placeholder="estate management software South Africa">
            </div>
            <p class="text-slate-400 text-xs mt-4">Your articles could show up right here</p>
            <button type="submit" [disabled]="isLoading || !searchQuery" 
                    class="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2"
                    [ngClass]="{'opacity-75 cursor-not-allowed': isLoading || !searchQuery}">
              <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isLoading ? 'Analyzing Market...' : 'Generate SEO Strategy &rarr;' }}
            </button>
          </form>
        </div>

        <!-- STEP 2: Keywords -->
        <div *ngIf="currentStep === 2" class="animate-slide-up">
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
             <span class="text-slate-400 text-xs font-bold uppercase tracking-wider pl-4">Step 2 of 5</span>
             <button (click)="submitKeywords()" [disabled]="isLoading" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all w-[240px] flex justify-center items-center">
               <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               <span *ngIf="!isLoading">Looks good, let's go! &rarr;</span>
             </button>
          </div>
        </div>

        <!-- STEP 3: Articles -->
        <div *ngIf="currentStep === 3" class="animate-slide-up">
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
                       <span *ngIf="editingArticleIndex !== i" class="font-extrabold text-[15px] leading-snug cursor-pointer group-hover:text-blue-600 transition-colors" (click)="editArticle(i)">{{ art.title }}</span>
                       <input *ngIf="editingArticleIndex === i" type="text" [(ngModel)]="articles[i].title" (blur)="stopEditing()" (keyup.enter)="stopEditing()" class="flex-1 w-full border-b border-blue-500 pb-1 focus:outline-none font-extrabold text-[15px] leading-snug bg-transparent text-blue-800" autofocus>
                       
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
                   <button (click)="editingArticleIndex === i ? stopEditing() : editArticle(i)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors border border-transparent hover:border-blue-200 shadow-sm bg-white">
                     <svg *ngIf="editingArticleIndex !== i" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     <svg *ngIf="editingArticleIndex === i" class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                   </button>
                   <button (click)="removeArticle(i)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-200 shadow-sm bg-white">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                   </button>
                 </div>
               </div>
             </div>
          </div>
          
          <div class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-8 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
             <button (click)="currentStep = 2" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg ml-2">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
             </button>
             <button (click)="goToOffer()" [disabled]="isLoading" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all w-[240px] flex justify-center items-center">
               <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               <span *ngIf="!isLoading">Looks good, let's go! &rarr;</span>
             </button>
          </div>
        </div>

        <!-- STEP 4: The Offer -->
        <div *ngIf="currentStep === 4" class="animate-slide-up pb-20">
          <div class="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
             <div class="flex items-center gap-2">
               <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
               <span class="font-extrabold text-blue-600 text-lg">AutoSEO</span>
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
            
            <button (click)="currentStep = 5" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 mb-4">
              Get {{ articles.length }} articles for $1 now &rarr;
            </button>
            <button (click)="currentStep = 5" class="text-slate-400 text-sm font-bold underline mb-6 hover:text-slate-600">Skip for now</button>
            
            <div class="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 mb-4">
               <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
               Cancel anytime. No questions asked.
            </div>
            
            <div class="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-sm font-bold">
               You don't like it? We'll refund the $1 in 24 hours
            </div>
          </div>
        </div>

        <!-- STEP 5: Account Completion -->
        <div *ngIf="currentStep === 5" class="animate-slide-up pb-20">
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
             <button (click)="currentStep = 4" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg ml-2">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
             </button>
             <button (click)="completeAccount()" disabled class="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all w-[240px] flex justify-between items-center opacity-75">
               <span>Step 5 of 5</span>
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
  
  keywords: string[] = [];
  articles: any[] = [];
  editingArticleIndex: number | null = null;
  
  completionMessage = '';

  ngOnInit() {
    this.titleService.setTitle('Start Growth - AutoSEO');
  }

  getStepClass(stepNum: number) {
    if (this.currentStep > stepNum) return 'bg-green-500 text-white shadow-md shadow-green-500/30';
    if (this.currentStep === stepNum || (this.currentStep === 4 && stepNum === 4)) return 'bg-slate-800 text-white shadow-md';
    return 'bg-slate-200 text-slate-500';
  }

  startOnboarding() {
    if (!this.searchQuery) return;
    this.isLoading = true;
    
    // Step 1: Hit API to register lead
    this.http.post<any>(`${environment.apiUrl}/onboarding/start`, { searchQuery: this.searchQuery }).subscribe(res => {
      this.leadId = res.leadId;
      
      // Immediately request keywords
      this.http.post<any>(`${environment.apiUrl}/onboarding/keywords`, { leadId: this.leadId, searchQuery: this.searchQuery }).subscribe(kRes => {
        this.keywords = kRes.keywords;
        this.currentStep = 2;
        this.isLoading = false;
      });
    });
  }

  removeKeyword(idx: number) {
    this.keywords.splice(idx, 1);
  }

  submitKeywords() {
    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/onboarding/articles`, { leadId: this.leadId, approvedKeywords: this.keywords }).subscribe(res => {
      this.articles = res.articles;
      this.currentStep = 3;
      this.isLoading = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  removeArticle(idx: number) {
    this.articles.splice(idx, 1);
  }

  editArticle(idx: number) {
    this.editingArticleIndex = idx;
  }

  stopEditing() {
    this.editingArticleIndex = null;
  }

  goToOffer() {
    this.currentStep = 4;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      // Fallback redirect after 3s
      setTimeout(() => {
        window.location.href = '/';
      }, 4000);
    });
  }
}
