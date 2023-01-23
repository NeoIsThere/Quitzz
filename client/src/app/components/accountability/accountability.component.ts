import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  FriendDialogData,
  FRIENDS_DIALOG_MODE,
  Goal,
} from 'src/app/interfaces/interface';
import { openDialog } from 'src/app/services/utils/utils';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import { Subscription } from 'rxjs';
import { FriendsDialogComponent } from '../friends/friends-dialog.component';
import { MAX_GOALS, MAX_PEOPLE_IN_GOAL } from 'src/app/constants';
import { SimpleDialogComponent } from '../simple-dialog/simple-dialog.component';
import { body, title } from './dialog-content';
import { MOCK_GOALS } from 'src/app/mock-data';

enum MODE {
  DEFAULT,
  GOAL_REACHED,
  RELAPSE,
  CREATION,
  INVITATION,
}

const DEFAULT_GOAL = {
  id: '-1',
  objective: 0,
  creator: '',
  isMine: false,
  category: 'x',
  endDate: '2021-05-07T22:38:05Z',
  status: 'inprogress',
  relapser: '',
  progress: [],
};

@Component({
  selector: 'app-accountability',
  templateUrl: './accountability.component.html',
  styleUrls: ['./accountability.component.css'],
})
export class AccountabilityComponent implements OnInit, OnDestroy {
  constructor(
    private dialog: MatDialog,
    private httpClient: HttpClientService,
    private userData: UserDataService
  ) {}

  mode: MODE = MODE.DEFAULT;

  goals: Goal[] = [];

  currentIndex: number = 0;

  @Input()
  sizePx: number = 100;

  @Input()
  fontSizePx: number = 27;

  @Input()
  category: string;

  areButtonsDisabled: boolean = true;

  notifPooling: NodeJS.Timeout;

  commitSubjectSubscribtion: Subscription;
  relapseSubjectSubscribtion: Subscription;
  closeInboxSubscribtion: Subscription;

  ngOnInit(): void {
    this.areButtonsDisabled = true;
    this.fetchGoals(() => (this.areButtonsDisabled = false));
    this.commitSubjectSubscribtion = this.userData.commitSubject.subscribe(
      () => {
        this.areButtonsDisabled = true;
        this.fetchGoals(() => (this.areButtonsDisabled = false));
      }
    );
    this.relapseSubjectSubscribtion = this.userData.relapseSubject.subscribe(
      () => {
        this.areButtonsDisabled = true;
        this.fetchGoals(() => (this.areButtonsDisabled = false));
      }
    );
    this.closeInboxSubscribtion = this.userData.closeInboxSubject.subscribe(
      () => {
        this.areButtonsDisabled = true;
        this.fetchGoals(() => (this.areButtonsDisabled = false));
      }
    );
  }

  fetchGoals(callback?: () => void) {
    this.httpClient
      .get('/goals/' + this.category)
      .subscribe((goals: Goal[]) => {
        this.goals = goals;
        this.setMode();
        if (callback) {
          callback();
        }
      });
  }

  onEditValue(value: any) {
    const friendsDialogData: FriendDialogData = {
      mode: FRIENDS_DIALOG_MODE.SELECTOR,
      selectionLimit: MAX_PEOPLE_IN_GOAL,
    };

    const dialogRef = openDialog(
      this.dialog,
      FriendsDialogComponent,
      friendsDialogData
    );
    dialogRef.afterClosed().subscribe((participants) => {
      this.mode = MODE.DEFAULT;
      if (!participants) {
        return;
      }
      this.areButtonsDisabled = true;
      this.httpClient
        .post('/goals/' + this.category, { participants, objective: value })
        .subscribe(() => {
          this.fetchGoals(() => (this.areButtonsDisabled = false));
        });
    });
  }

  onCancelEditValue() {
    this.mode = MODE.DEFAULT;
    this.areButtonsDisabled = false;
  }

  onDeleteGoal() {
    if (window.confirm('Delete this goal?')) {
      this.areButtonsDisabled = true;
      this.httpClient.delete('/goals/' + this.currentGoal.id).subscribe(() => {
        this.fetchGoals(() => (this.areButtonsDisabled = false));
      });
    }
  }

  fetchDataForCurrentGoal() {
    const goalID = this.goals[this.currentIndex].id;
    //fetch data
  }

  get isDecrementPageButtonVisible() {
    return this.goals.length > 0 && this.currentIndex > 0;
  }

  get isIncrementPageButtonVisible() {
    return this.currentIndex < this.goals.length - 1;
  }

  onPageChange(isIncrement: boolean) {
    this.currentIndex += isIncrement ? 1 : -1;
    this.setMode();
  }

  onCreate() {
    this.mode = MODE.CREATION;
  }

  showDefault() {
    this.mode = MODE.DEFAULT;
  }

  setMode() {
    switch (this.currentGoal.status) {
      case 'ongoing':
        this.mode = MODE.DEFAULT;
        break;
      case 'success':
        this.mode = MODE.GOAL_REACHED;
        break;
      case 'relapse':
        this.mode = MODE.RELAPSE;
        break;
      case 'invitation':
        this.mode = MODE.INVITATION;
        break;
      default:
        this.mode = MODE.DEFAULT;
    }
  }

  confirm() {
    this.areButtonsDisabled = true;
    this.httpClient
      .post('/goals/' + this.currentGoal.id + '/acknowledge', {})
      .subscribe(() => {
        this.fetchGoals();
        this.areButtonsDisabled = false;
      });
  }

  acceptInvitation() {
    this.areButtonsDisabled = true;
    this.httpClient
      .post('/goals/invitations/accept/' + this.currentGoal.id, {})
      .subscribe(() => {
        this.fetchGoals();
        this.areButtonsDisabled = false;
      });
  }

  rejectInvitation() {
    this.areButtonsDisabled = true;
    this.httpClient
      .post('/goals/invitations/reject/' + this.currentGoal.id, {})
      .subscribe(() => {
        this.fetchGoals();
        this.areButtonsDisabled = false;
      });
  }

  openExplanationDialog() {
    const dialogRef = this.dialog.open(SimpleDialogComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.body = body;
  }

  ngOnDestroy(): void {
    this.commitSubjectSubscribtion.unsubscribe();
    this.relapseSubjectSubscribtion.unsubscribe();
    this.closeInboxSubscribtion.unsubscribe();
  }

  get maxGoalsReached() {
    return this.goals.length >= MAX_GOALS;
  }

  get currentProgress(): number {
    const username = this.userData.username.value;

    const progress = this.currentGoal.progress.find(
      (progress) => progress.username == username
    )?.count;

    return progress ? progress : 0;
  }

  get currentMembers(): string {
    let members = '';
    this.currentGoal.progress.forEach((progress, index) => {
      if (index == this.currentGoal.progress.length - 1) {
        members += progress.username;
        return;
      }
      members += progress.username + ', ';
    });
    return members;
  }

  get currentObjective(): number {
    return this.currentGoal.objective;
  }

  get currentGoal(): Goal {
    if (this.currentIndex >= this.goals.length) {
      return DEFAULT_GOAL;
    }
    //return MOCK_GOALS[0];

    return this.goals[this.currentIndex];
  }

  get countsOfCurrentGoal(): string[] {
    return Object.keys(this.currentGoal);
  }

  get isModeDefault() {
    return this.mode == MODE.DEFAULT;
  }

  get isModeGoalReached() {
    return this.mode == MODE.GOAL_REACHED;
  }

  get isModeRelapse() {
    return this.mode == MODE.RELAPSE;
  }

  get isModeCreation() {
    return this.mode == MODE.CREATION;
  }

  get isModeInvitation() {
    return this.mode == MODE.INVITATION;
  }
}
