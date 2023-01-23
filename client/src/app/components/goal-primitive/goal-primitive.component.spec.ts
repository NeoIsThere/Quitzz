import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalPrimitiveComponent } from './goal-primitive.component';

describe('GoalPrimitiveComponent', () => {
  let component: GoalPrimitiveComponent;
  let fixture: ComponentFixture<GoalPrimitiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoalPrimitiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalPrimitiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
