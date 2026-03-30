import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-slate-50 min-h-screen pb-24 pt-16">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        
        <div class="mb-12">
          <a routerLink="/" class="inline-flex items-center text-sm font-medium text-primary hover:text-blue-600 transition-colors mb-6">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </a>
          <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service & Liability Shield</h1>
          <p class="text-slate-500 font-medium">Last Updated: March 2026</p>
        </div>

        <div class="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-xl prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-primary">
          
          <p class="lead text-xl text-slate-600 font-medium mb-10">
            Welcome to iShack AEO and SEO Partner Services. The following terms constitute a legally binding agreement detailing the fair-use, liability frameworks, and operational constraints required to protect all parties utilizing our AI-driven Search Engine Marketing software.
          </p>

          <h2 class="text-2xl font-bold mt-10 mb-4 pb-2 border-b border-slate-100">1. Execution Disclaimers & "As-Is" Provision</h2>
          <h3 class="text-lg font-semibold mt-6 mb-2">1.1 Algorithmic Volatility</h3>
          <p>
            The iShack platform relies on third-party search engine algorithms (e.g., Google, Bing, Perplexity) which are highly volatile. While we utilize state-of-the-art Artificial Engine Optimization (AEO), we inherently cannot guarantee specific Search Engine Results Page (SERP) rankings, organic traffic volume, or monetary yields. The software is provided on an "as-is" and "as-available" basis.
          </p>

          <h3 class="text-lg font-semibold mt-6 mb-2">1.2 Probabilistic AI Outputs</h3>
          <p>
            The platform utilizes Generative AI models. AI outputs are probabilistic and may occasionally produce imperfect text or code ("hallucinations"). It is a strict condition of use that all AI-generated content (including SEO audits, schema markup, and blog generation) must be manually reviewed and verified by your organization before being deployed to a live production environment.
          </p>

          <h2 class="text-2xl font-bold mt-10 mb-4 pb-2 border-b border-slate-100">2. Limitation of Liability & Fair Financial Caps</h2>
          <h3 class="text-lg font-semibold mt-6 mb-2">2.1 Aggregate Liability Mutual Cap</h3>
          <p>
            To maintain a fair, long-term B2B partnership, under no circumstances shall iShack, its directors, or its autonomous agents be liable for cumulative damages exceeding the total amount of subscription fees paid by you to iShack in the <strong>three (3) months</strong> immediately preceding the event giving rise to the claim.
          </p>

          <h3 class="text-lg font-semibold mt-6 mb-2">2.2 Exclusion of Consequential Damages</h3>
          <p>
            Neither party shall be liable for indirect, incidental, special, punitive, or consequential damages. This explicitly includes loss of business profits due to search engine algorithmic penalties (e.g., Google Core Updates) or data overwrites resulting from unverified autonomous code injections.
          </p>

          <h2 class="text-2xl font-bold mt-10 mb-4 pb-2 border-b border-slate-100">3. White-Label Flow-Down Legalities</h2>
          <h3 class="text-lg font-semibold mt-6 mb-2">3.1 Agency Interface</h3>
          <p>
            For users subscribed to the <strong>Agency Tier ($299/mo)</strong>, iShack operates strictly as a background technology vendor. There is no direct legal relationship between iShack and the Agency’s end-clients.
          </p>

          <h3 class="text-lg font-semibold mt-6 mb-2">3.2 Flow-Down Shield</h3>
          <p>
            The Agency agrees to include Terms of Service in their own end-client contracts that are protective and no less restrictive than these Terms. The Agency must act as the liability buffer for any claims advanced by their direct clients regarding the deployment of iShack's AI tools.
          </p>

          <h2 class="text-2xl font-bold mt-10 mb-4 pb-2 border-b border-slate-100">4. Platform Acceptable Use Policy (AUP)</h2>
          <h3 class="text-lg font-semibold mt-6 mb-2">4.1 Black-Hat Restrictions</h3>
          <p>
            Users are strictly prohibited from utilizing the iShack platform to orchestrate illegal or abusive "Black-Hat" SEO methodologies, including: Automated Private Blog Network (PBN) spin-ups, malicious scraping, or intentional Keyword Spamming that explicitly violates Search Engine Quality Guidelines.
          </p>

          <h3 class="text-lg font-semibold mt-6 mb-2">4.2 Account Suspension</h3>
          <p>
            iShack deploys local QAAgents to monitor API integrity. We reserve the right to pause or throttle SaaS access if catastrophic rate limits are breached or if the targeted domain is flagged for categorically illegal global content.
          </p>

          <h2 class="text-2xl font-bold mt-10 mb-4 pb-2 border-b border-slate-100">5. Intellectual Property (IP) Dynamics</h2>
          <h3 class="text-lg font-semibold mt-6 mb-2">5.1 Output Ownership</h3>
          <p>
            You own 100% of the final exported PDF reports, the deployed Schema markup, and the raw text generated by the platform during your active subscription. You are free to monetize this data fully.
          </p>

          <h3 class="text-lg font-semibold mt-6 mb-2">5.2 Infrastructure Ownership</h3>
          <p>
            iShack retains exclusive ownership of the underlying proprietary AI orchestration logic, the AutoResearch self-healing grid, and all core platform source code.
          </p>

        </div>
      </div>
    </div>
  `
})
export class TermsComponent implements OnInit {
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }
}
