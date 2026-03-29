import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  templateUrl: './home.html'
})
export class Home {
  private http = inject(HttpClient);
  
  // Funnel State: 'input' | 'analyzing' | 'report' | 'upgrade'
  funnelState = signal<'input' | 'analyzing' | 'report' | 'upgrade'>('input');
  
  isLoggedIn = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.isLoggedIn.set(!!localStorage.getItem('auth_token'));
    }
  }

  websiteUrl = signal('');
  email = signal('');
  
  mockReport = signal<any>(null);

  startAnalysis() {
    if (!this.websiteUrl()) return;
    
    this.funnelState.set('analyzing');
    
    // Trigger real backend analysis (SEMRush + OpenClaw/Cheerio)
    this.http.post(`${environment.apiUrl}/openclaw/trigger`, {
      eventType: 'seo_analysis_request',
      payload: { website: this.websiteUrl() }
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
