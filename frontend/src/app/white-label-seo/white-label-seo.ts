import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-white-label-seo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './white-label-seo.html'
})
export class WhiteLabelSeo implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private http = inject(HttpClient);

  formData = {
    name: '',
    company: '',
    email: '',
    size: '',
    goal: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  ngOnInit() {
    this.titleService.setTitle('White Label SEO Services for Digital Marketing Agencies');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Outsource your SEO to our autonomous AI agency. We provide premium, fully automated white-label search engine optimization software that lets you scale retainers.' 
    });
  }

  submitPartnerForm() {
    if (!this.formData.name || !this.formData.email) {
      this.submitError = 'Name and email are required to explore partnership options.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    this.http.post(`${environment.apiUrl}/contact/partner`, this.formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.formData = { name: '', company: '', email: '', size: '', goal: '', message: '' };
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.error || 'An error occurred while submitting your inquiry. Please contact wayne@ishack.co.za directly.';
      }
    });
  }
}
