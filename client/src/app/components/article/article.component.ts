import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ARTICLES_URL } from 'src/app/constants';
import { ArticleMetadata } from 'src/app/interfaces/interface';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';

const MILLION = 1000000;

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
})
export class ArticleComponent implements OnInit {
  constructor(
    private httpClient: HttpClientService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  articleAuthor: string;
  imageCreditAuthor: string;
  imageCreditLink: string;
  articleId: string;
  name: string;
  linkToImage: string;
  linkToArticle: string;
  _nViews: number;

  htmlContent: SafeHtml;

  ngOnInit(): void {
    const url: string[] = this.router.url.split('/');
    this.articleId = url[3];

    this.fetchArticleMetadata(() => this.fetchArticleContent());
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  fetchArticleMetadata(callback: () => void) {
    this.httpClient
      .get('/articles/id/' + this.articleId + '/metadata')
      .subscribe((metadata: ArticleMetadata) => {
        this.name = metadata.name;
        this.articleAuthor = metadata.author;
        this.imageCreditAuthor = metadata.imageCreditAuthor;
        this.imageCreditLink = '//' + metadata.imageCreditLink;
        this.linkToArticle = metadata.linkToArticle;
        this.linkToImage = metadata.linkToImage;
        this._nViews = metadata.nViews;
        callback();
      });
  }

  fetchArticleContent() {
    this.httpClient
      .getAbsoluteURL(this.linkToArticle, true)
      .subscribe((data) => {
        this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(data);
      });
  }

  copyLinkToClipboard() {
    navigator.clipboard
      .writeText(window.location.href)
      .then()
      .catch((err) => {});
  }

  navigateTo(relativeUrl: string) {
    this.router.navigateByUrl(relativeUrl);
  }

  get nViews(): string {
    if(!this._nViews){
      return "";
    }
    if (this._nViews < 1000) {
      return this._nViews.toString();
    }
    if (this._nViews < MILLION) {
      return Math.round(this._nViews / 100) / 10 + 'k';
    }
    return Math.round(this._nViews / (MILLION / 10)) / 10 + 'M';
  }
}
