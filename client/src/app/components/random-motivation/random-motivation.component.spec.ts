import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomMotivationComponent } from './random-motivation.component';

describe('RandomMotivationComponent', () => {
  let component: RandomMotivationComponent;
  let fixture: ComponentFixture<RandomMotivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RandomMotivationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomMotivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
