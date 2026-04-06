import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private http = inject(HttpClient);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  
  // Funnel State: 'input' | 'analyzing' | 'report' | 'upgrade'
  funnelState = signal<'input' | 'analyzing' | 'report' | 'upgrade'>('input');
  
  isLoggedIn = signal(false);
  agencyData = signal<any>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      this.isLoggedIn.set(!!localStorage.getItem('auth_token'));
      const agencyStr = localStorage.getItem('agency_data');
      if (agencyStr) {
        try {
          const agency = JSON.parse(agencyStr);
          this.agencyData.set(agency);
          
          if (agency.brandColor && agency.brandColor !== '#007bff') {
            const color = agency.brandColor;
            const style = document.createElement('style');
            style.innerHTML = `
              .bg-primary { background-color: ${color} !important; }
              .text-primary { color: ${color} !important; }
              .border-primary { border-color: ${color} !important; }
              .ring-primary { --tw-ring-color: ${color} !important; }
              .from-primary { --tw-gradient-from: ${color} !important; }
              .to-primary { --tw-gradient-to: ${color} !important; }
            `;
            document.head.appendChild(style);
          }
        } catch(e) {
          console.error("Failed to parse agency data", e);
        }
      }
    }
  }

  // Factual SEO Case Studies (Extracted from Google Drive PDFs)
  caseStudies = [
    {
      id: 1,
      client: 'Dallmayr',
      industry: 'Commercial Coffee Solutions',
      summary: 'Drove massive enterprise visibility for high-ticket coffee/vending machine rentals.',
      trafficSessions: '21,247',
      pageOneKeywords: 3,
      topKeywords: [
        { phrase: 'coffee vending machine', rank: 3 },
        { phrase: 'commercial coffee machine for sale', rank: 5 },
        { phrase: 'coffee machine rental', rank: 10 }
      ],
      timeframe: 'Dec 2025 - Feb 2026'
    },
    {
      id: 2,
      client: 'Jpak',
      industry: 'Industrial Food Packaging',
      summary: 'Dominated the SERPs for highly-niche B2B industrial printing machinery queries.',
      trafficSessions: '22,107',
      pageOneKeywords: 12,
      topKeywords: [
        { phrase: 'Food Packaging printer', rank: 1 },
        { phrase: 'Industrial Metal Detector', rank: 1 },
        { phrase: 'Thermal Inkjet printer', rank: 2 },
        { phrase: 'Continuous inkjet printer', rank: 3 }
      ],
      timeframe: 'Dec 2025 - Feb 2026'
    },
    {
      id: 3,
      client: 'Propacademy',
      industry: 'Real Estate Education',
      summary: 'Captured the exact national search intent for South African real estate compliance and course certification.',
      trafficSessions: '43,851',
      pageOneKeywords: 15,
      topKeywords: [
        { phrase: 'real estate courses', rank: 1 },
        { phrase: 'property agent course', rank: 1 },
        { phrase: 'property management courses', rank: 2 },
        { phrase: 'become a real estate agent', rank: 8 }
      ],
      timeframe: 'Dec 2025 - Feb 2026'
    }
  ];

  // Accordion State tracking
  expandedCaseId = signal<number | null>(null);

  toggleCaseStudy(id: number) {
    this.expandedCaseId.update(current => current === id ? null : id);
  }

  ngOnInit() {
    this.titleService.setTitle('White-Label AI SEO Software & Technical Automation Agency | iShack');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'iShack AEO and SEO partner services partners with digital agencies and businesses to handle the heavy technical lifting. We provide autonomous white label search engine optimization software.' 
    });
  }

  websiteUrl = signal('');
  competitorUrl = signal('');
  email = signal('');
  region = signal('us');
  targetKeyword = signal('');
  promoCode = signal('');
  
  seoReport = signal<any>(null);

  canViewPremium(): boolean {
    return this.isLoggedIn() || this.promoCode().toLowerCase() === 'evertonfc';
  }

  startAnalysis() {
    if (!this.websiteUrl()) return;
    
    this.funnelState.set('analyzing');
    
    // Trigger real backend analysis (SEMRush + OpenClaw/Cheerio)
    this.http.post(`${environment.apiUrl}/openclaw/trigger`, {
      eventType: 'seo_analysis_request',
      payload: { 
        website: this.websiteUrl(),
        competitor: this.competitorUrl(),
        email: this.email(),
        region: this.region(),
        targetKeyword: this.targetKeyword()
      }
    }).subscribe({
      next: (res: any) => {
        if (res && res.success && res.report) {
          this.seoReport.set(res.report);
        } else {
          this.seoReport.set({ score: 0, issuesFound: 1, criticalErrors: 1, suggestions: ["Failed to generate valid report."] });
        }
        this.funnelState.set('report');
      },
      error: (err) => {
        this.seoReport.set({ score: 0, issuesFound: 1, criticalErrors: 1, suggestions: [`API Error: ${err.message}`] });
        this.funnelState.set('report');
      }
    });
  }

  printPDF() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  showUpgradePackages() {
    this.funnelState.set('upgrade');
  }

  reset() {
    this.funnelState.set('input');
    this.websiteUrl.set('');
    this.seoReport.set(null);
  }
}
