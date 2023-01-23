import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernameDisplayerComponent } from './username-displayer.component';

describe('UsernameDisplayerComponent', () => {
  let component: UsernameDisplayerComponent;
  let fixture: ComponentFixture<UsernameDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsernameDisplayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsernameDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
