import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { isOverflown } from 'src/app/services/utils/utils';

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.css'],
})
export class CircleProgressComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  @ViewChild('innerCircle')
  valueElement: ElementRef;

  @Input()
  sizePx: number = 130;
  @Input()
  supFontSizePx: number = 130;
  @Input()
  progressRadiusPx: number = 20;
  @Input()
  fontSizePx: number = 50;
  @Input()
  labelFontSizePx: number = 12;
  @Input()
  completionRatio: number = 0.8;
  @Input()
  backgroundColor: string = 'var(--light-background-color';
  @Input()
  progressCircleColor: string = 'var(--purple)';
  @Input()
  remainingProgressColor: string = 'var(--very-light-background-color)';
  @Input()
  value: string = '86';
  @Input()
  label: string = '';
  @Input()
  isPosition: boolean = false;

  get outerCircleStyle() {
    const deg = 365 * this.completionRatio;
    return {
      width: this.sizePx + 'px',
      height: this.sizePx + 'px',
      background:
        'conic-gradient(' +
        this.progressCircleColor +
        ', ' +
        deg +
        'deg, ' +
        this.remainingProgressColor +
        ' 0)',
    };
  }

  get innerCircleStyle() {
    return {
      width: this.sizePx - this.progressRadiusPx + 'px',
      height: this.sizePx - this.progressRadiusPx + 'px',
      'background-color': this.backgroundColor,
    };
  }

  get valueStyle() {
    let fontSizeToUse = this.fontSizePx;

    if (this.valueElement) {
      const element = this.valueElement.nativeElement;
      if (isOverflown(element)) {
        this.fontSizePx = this.fontSizePx - 1;
      }
    }

    return {
      'font-size': fontSizeToUse + 'px',
    };
  }

  get labelStyle() {
    return {
      'font-size': this.labelFontSizePx + 'px',
    };
  }
}
