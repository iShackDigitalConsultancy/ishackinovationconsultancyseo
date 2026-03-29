import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-ai-seo-software',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ai-seo-software.html'
})
export class AiSeoSoftware implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.titleService.setTitle('Replace My SEO Agency with AI | Autonomous SEO Software');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Replace your expensive SEO agency with an autonomous programmatic SEO generator. iShack Innovation Consultancy provides self-optimizing AI SEO software.' 
    });
  }
}
