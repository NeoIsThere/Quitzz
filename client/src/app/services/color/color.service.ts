import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { THEMES } from 'src/app/themes';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  currentTheme: string;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  setTheme(value: string) {
    this.currentTheme = value;
    let theme = THEMES[value];
    if (theme) {
      this.currentTheme = value;
      Object.keys(theme).forEach((key) => {
        this.document.documentElement.style.setProperty(
          `--${key}`,
          `${theme[key]}`
        );
      });
    }
  }
}
