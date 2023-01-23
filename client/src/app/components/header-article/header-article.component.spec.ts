import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderArticleComponent } from './header-article.component';

describe('HeaderArticleComponent', () => {
  let component: HeaderArticleComponent;
  let fixture: ComponentFixture<HeaderArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderArticleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
