import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-bar-progress',
  templateUrl: './bar-progress.component.html',
  styleUrls: ['./bar-progress.component.css'],
})
export class BarProgressComponent implements OnInit {
  @Input()
  labelAbove: string = 'Rank: Professional';
  @Input()
  labelBelow: string = '3 days until next';

  @Input()
  fontSizeAbovePx: number = 15;
  @Input()
  fontSizeBelowPx: number = 11;

  @Input()
  completionRatio: number = 0.4;
  @Input()
  widthPx: number = 200;
  @Input()
  heightPx: number = 10;

  progressColor: string = 'var(--purple)';
  remainingProgressColor: string = 'var(--very-light-background-color)';

  constructor() {}

  ngOnInit(): void {}

  get outerContainerStyle() {
    return { width: this.widthPx + 'px', height: this.heightPx + 'px' };
  }

  get innerContainerStyle() {
    return {
      background:
        'linear-gradient(to right,' +
        this.progressColor +
        ' ' +
        this.completionRatio * 100 +
        '% , ' +
        this.remainingProgressColor +
        ' ' +
        this.completionRatio * 100 +
        '%',
    };
  }
}
