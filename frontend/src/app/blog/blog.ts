import { Component, signal, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './blog.html',
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
  `]
})
export class BlogComponent implements OnInit {
  posts = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Selected Post for Expansion/Modal view
  selectedPost = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchPosts();
  }

  fetchPosts() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/blog/posts`).subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load blog posts', err);
        this.error.set('Failed to connect to the AEO matrix.');
        this.loading.set(false);
      }
    });
  }

  viewPost(post: any) {
    this.selectedPost.set(post);
  }

  closePost() {
    this.selectedPost.set(null);
  }
}
