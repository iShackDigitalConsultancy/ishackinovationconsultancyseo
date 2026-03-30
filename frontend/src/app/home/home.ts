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
  
  mockReport = signal<any>(null);

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
          this.mockReport.set(res.report);
        } else {
          this.mockReport.set({ score: 0, issuesFound: 1, criticalErrors: 1, suggestions: ["Failed to generate valid report."] });
        }
        this.funnelState.set('report');
      },
      error: (err) => {
        this.mockReport.set({ score: 0, issuesFound: 1, criticalErrors: 1, suggestions: [`API Error: ${err.message}`] });
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
    this.mockReport.set(null);
  }
}
