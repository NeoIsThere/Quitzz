import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleMetadata, ArticlesData } from 'src/app/interfaces/interface';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.css'],
})
export class TipsComponent implements OnInit {
  currentPageIndex = 0;
  maxPageIndex = 0;
  articlesMetadata: ArticleMetadata[] = [];

  constructor(private httpClient: HttpClientService) {}

  ngOnInit(): void {
    this.fetchArticlesMetadata();
  }

  fetchArticlesMetadata() {
    this.httpClient
      .get(`/articles/page/${this.currentPageIndex}`)
      .subscribe((data: ArticlesData) => {
        this.articlesMetadata = data.metadatas;
        this.maxPageIndex = data.maxPageIndex;
      });
  }

  onPageChange(isIncrement: boolean) {
    this.currentPageIndex += isIncrement ? +1 : -1;
    this.fetchArticlesMetadata();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  get isIncrementPageButtonVisible() {
    return this.currentPageIndex < this.maxPageIndex;
  }

  get isDecrementPageButtonVisible() {
    return this.currentPageIndex > 0;
  }
}
