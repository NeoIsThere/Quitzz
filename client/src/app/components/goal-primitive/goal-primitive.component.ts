import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-goal-primitive',
  templateUrl: './goal-primitive.component.html',
  styleUrls: ['./goal-primitive.component.css'],
})
export class GoalPrimitiveComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  @Input()
  category: string;

  @Input()
  sizePx: number = 100;
  @Input()
  fontSizePx: number = 20;

  @Input()
  currentProgress: number;

  @Input()
  currentObjective: number;

  @Input()
  isEditMode: boolean = false;

  @Input()
  editMessage: string = '';

  @Output()
  editValue: EventEmitter<number> = new EventEmitter();

  @Output()
  cancelEdit: EventEmitter<number> = new EventEmitter();

  isObjectiveReached: boolean = false;

  goalForm: FormGroup = new FormGroup({
    goal: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(999),
    ]),
  });

  onSubmitEdit() {
    const value = this.goalForm.value.goal;
    this.editValue.emit(value);
  }

  onCancelEdit() {
    this.cancelEdit.emit();
  }

  onEdit() {
    this.isEditMode = true;
  }

  get presentableProgress(): string {
    if (this.currentObjective <= 0) {
      return '0/0';
    }
    return this.currentProgress + '/' + this.currentObjective;
  }

  get completionRatio() {
    if (!this.currentObjective) {
      return 0;
    }
    return this.currentProgress / this.currentObjective;
  }

  get message(): string {
    if (this.currentObjective <= 0) {
      return 'No goal set';
    }

    if (this.isObjectiveReached) {
      return 'Completed ! 💯';
    }

    const nRemainingDays = this.currentObjective - this.currentProgress;
    return '⏱ ' + nRemainingDays + ' days left';
  }
}
