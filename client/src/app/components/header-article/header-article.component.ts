import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TAG_COLORS } from 'src/app/constants';
import { ArticleMetadata } from 'src/app/interfaces/interface';
import { uglify } from 'src/app/services/utils/utils';

@Component({
  selector: 'app-header-article',
  templateUrl: './header-article.component.html',
  styleUrls: ['./header-article.component.css'],
})
export class HeaderArticleComponent implements OnInit {
  constructor(private router: Router) {}

  @Input()
  metadata: ArticleMetadata;

  ngOnInit(): void {}

  get tagStyle() {
    const tagColors = TAG_COLORS;

    const tagColor = tagColors.find((t) => this.metadata.tag == t.label);

    return tagColor
      ? { backgroundColor: tagColor.color }
      : { backgroundColor: 'grey' };
  }

  get link() {
    return '/articles/' +  uglify(this.metadata.name) + '/' + this.metadata.id;
  }

  navigateToArticle() {
    this.router.navigateByUrl(this.link);
  }
}
