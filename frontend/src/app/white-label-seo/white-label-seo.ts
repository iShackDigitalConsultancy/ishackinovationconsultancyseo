import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-white-label-seo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './white-label-seo.html'
})
export class WhiteLabelSeo implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.titleService.setTitle('White Label SEO Services for Digital Marketing Agencies');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Outsource your SEO to our autonomous AI agency. We provide premium, fully automated white-label search engine optimization software that lets you scale retainers.' 
    });
  }
}
