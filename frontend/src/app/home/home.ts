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
  
  websiteUrl = signal('');
  email = signal('');
  
  mockReport = signal<any>(null);

  startAnalysis() {
    if (!this.websiteUrl()) return;
    
    this.funnelState.set('analyzing');
    
    // Trigger OpenClaw agents in the backend
    this.http.post(`${environment.apiUrl}/openclaw/trigger`, {
      eventType: 'seo_analysis_request',
      payload: { website: this.websiteUrl() }
    }).subscribe({
      next: () => {
        // Mock a 3-second analysis delay
        setTimeout(() => {
          this.mockReport.set({
            score: 64,
            issuesFound: 12,
            criticalErrors: 3,
            suggestions: [
              "Missing meta descriptions on 14 pages.",
              "Canonical tags are incorrectly configured.",
              "Images lack alt-text attributes.",
              "H1 tags are duplicated on the homepage."
            ]
          });
          this.funnelState.set('report');
        }, 3000);
      },
      error: () => {
        // Fallback to mock even if server fails for demo
        setTimeout(() => {
          this.mockReport.set({ score: 64, issuesFound: 12, criticalErrors: 3, suggestions: ["Missing meta descriptions on 14 pages."] });
          this.funnelState.set('report');
        }, 2000);
      }
    });
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
