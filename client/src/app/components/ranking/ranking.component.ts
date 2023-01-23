import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, RankingData } from 'src/app/interfaces/interface';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import { openDialog } from 'src/app/services/utils/utils';
import { SimpleDialogComponent } from '../simple-dialog/simple-dialog.component';
import { body, title } from './dialog-content';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
})
export class RankingComponent implements OnInit, OnDestroy {
  @Input()
  category: string = 'NP';
  @Input()
  sizePx: number = 100;
  @Input()
  positionFontSizePx: number = 40;

  users: User[];

  nTotalActivelUsers: number = 0;
  nTotalUsers: number = 0;

  maxPageIndex: number = 0;
  currentPageIndex: number = -1;

  isSearchFieldDisplayed: boolean = false;

  constructor(
    private router: Router,
    private userData: UserDataService,
    private dialog: MatDialog
  ) {}

  rankingDataSubscription: Subscription;

  searchByUserForm: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.pattern(/^([0-9]|[a-zA-Z]|_)*$/)]),
  });

  ngOnInit(): void {
    this.rankingDataSubscription = this.userData.rankingData.subscribe(
      (rankingData: RankingData) => {
        if (rankingData) {
          /*first value will be undefined (current default value of the BehaviorSubject)*/
          this.users = rankingData.users;
          this.currentPageIndex = rankingData.page;
          this.maxPageIndex = rankingData.maxPageIndex;

          if (
            rankingData.nTotalActiveUsers >= 0 &&
            rankingData.nTotalUsers >= 0
          ) {
            //in case rankingData is SearchByUserResult
            this.nTotalActivelUsers = rankingData.nTotalActiveUsers;
            this.nTotalUsers = rankingData.nTotalUsers;
          }
        }
      }
    );
    this.userData.fetchRankingData(this.category, this.currentPageIndex);
    this.userData.fetchRankingPosition(this.category);
    this.userData.fetchStats(this.category);
  }

  ngOnDestroy(): void {
    this.rankingDataSubscription.unsubscribe();
  }

  get rankingPosition() {
    const rankingPosition = this.userData.rankingPosition.getValue();

    if (rankingPosition) {
      return (rankingPosition.position + 1).toString();
    }

    return '0';
  }

  get average() {
    const stats = this.userData.rankingStats.getValue();

    if (stats) {
      return Math.round(stats.average).toString();
    }

    return '0';
  }

  get median() {
    const stats = this.userData.rankingStats.getValue();

    if (stats) {
      return stats.median.toString();
    }

    return '0';
  }

  displaySearchField() {
    this.isSearchFieldDisplayed = true;
  }

  openExplanationDialog() {
    const dialogRef = this.dialog.open(SimpleDialogComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.body = body;
  }

  onPageChange(isIncrement: boolean) {
    this.currentPageIndex += isIncrement ? +1 : -1;
    if (this.isSearchFieldDisplayed) {
      const query = this.searchByUserForm.value.search;
      this.userData.fetchRankingDataByUser(
        this.category,
        this.currentPageIndex,
        query
      );
      return;
    }
    this.userData.fetchRankingData(this.category, this.currentPageIndex);
    this.userData.fetchStats(this.category);
  }

  navigateTo(relativeUrl: string) {
    this.router.navigateByUrl(relativeUrl);
  }

  onSearchByUser() {
    this.currentPageIndex = 0;
    const query = this.searchByUserForm.value.search;
    if (!query) {
      this.userData.fetchRankingData(this.category, this.currentPageIndex);
      return;
    }
    this.userData.fetchRankingDataByUser(
      this.category,
      this.currentPageIndex,
      query
    );
  }

  get isIncrementPageButtonVisible() {
    return this.currentPageIndex < this.maxPageIndex;
  }

  get isDecrementPageButtonVisible() {
    return this.currentPageIndex > 0;
  }
}
