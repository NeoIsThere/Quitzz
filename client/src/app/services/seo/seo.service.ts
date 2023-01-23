import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  updateTitle(title: string) {
    if (title) {
      this.title.setTitle(title);
    }
  }

  updateDescription(desc: string) {
    if (desc) {
      this.meta.updateTag({ name: 'description', content: desc });
    }
  }
}
