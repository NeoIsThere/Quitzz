import { HttpStatusCode } from '@angular/common/http';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  CHRISTMAS_CONTAINER_DECO_1,
  CHRISTMAS_CONTAINER_DECO_2,
  CHRISTMAS_CONTAINER_DECO_3,
  CURRENT_THEME,
  LOGO_PATH,
  RANKING,
  SPECIAL_THEME,
} from 'src/app/constants';
import { DaysToCommit } from 'src/app/interfaces/interface';
import { InternalCommunicationsService } from 'src/app/services/internal-communications/internal-communications.service';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import { openDialog, openLoginDialog } from 'src/app/services/utils/utils';
import { RankingComponent } from '../ranking/ranking.component';

const MOBILE_WIDTH = 800;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private userData: UserDataService,
    private httpClient: HttpClientService,
    private router: Router,
    private internalCommunications: InternalCommunicationsService
  ) {}

  isCommitButtonActive: boolean = false;
  isRelapseButtonActive: boolean = true;
  daysToCommit: number = 0;

  onSuccess = () => {
    //userCount will be refetched see @DialogContentLogin
    this.fetchDaysToCommit();
    this.userData.fetchRankingData(this.category, -1);
    this.userData.fetchRankingPosition(this.category);
    this.userData.fetchStats(this.category);
  };

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.userData.fetchCounts();
    this.fetchDaysToCommit();
  }

  fetchDaysToCommit() {
    this.httpClient
      .get(`/counts/uncommitted/category/${this.category}`)
      .subscribe((nDaysToCommit: DaysToCommit) => {
        if (nDaysToCommit.nDays >= 0) {
          this.daysToCommit = nDaysToCommit.nDays;
          if (this.daysToCommit === 0) {
            this.isCommitButtonActive = false;
            return;
          }
          this.isCommitButtonActive = true;
          return;
        }
      });
  }

  onCommit() {
    this.isCommitButtonActive = false;
    this.httpClient.post('/commit/category/' + this.category, {}).subscribe(
      () => {
        this.refresh();
        this.userData.onCommit();
        this.userData.fetchRankingData(this.category, -1);
        this.userData.fetchRankingPosition(this.category);
        this.userData.fetchStats(this.category);
      },
      (err: number) => {
        if (err == HttpStatusCode.Unauthorized) {
          openLoginDialog(this.dialog,{onLoginSuccess: this.onSuccess});

        }
      }
    );
  }

  onRelapse() {
    if (confirm('Do you confirm you have relapsed? \nAll participants of your goals will be notified.')) {
      this.isRelapseButtonActive = false;
      this.httpClient
        .post('/relapse/category/' + this.category, null)
        .subscribe(
          () => {
            this.refresh();
            this.userData.onRelapse();
            this.userData.fetchRankingData(this.category, -1);
            this.userData.fetchRankingPosition(this.category);
            this.userData.fetchStats(this.category);
          },
          (err: number) => {
            if (err == HttpStatusCode.Unauthorized) {
              openLoginDialog(this.dialog,{onLoginSuccess: this.onSuccess});

            }
          }
        );
    }
  }

  isActive(link: string) {
    return this.router.url === link;
  }

  get firstContainerBackgroundImg() {
    const specialTheme: number = CURRENT_THEME;

    switch (specialTheme) {
      case SPECIAL_THEME.CHRISTMAS:
        if (this.isMobile) {
          return { 'background-image': `url(${CHRISTMAS_CONTAINER_DECO_3})` };
        }
        return { 'background-image': `url(${CHRISTMAS_CONTAINER_DECO_2})` };
      case SPECIAL_THEME.HALLOWEEN:
        return {};
      default:
        return {};
    }
  }

  get containerBackgroundImg() {
    const specialTheme: number = CURRENT_THEME;

    switch (specialTheme) {
      case SPECIAL_THEME.CHRISTMAS:
        return { 'background-image': `url(${CHRISTMAS_CONTAINER_DECO_1})` };

      case SPECIAL_THEME.HALLOWEEN:
        return {};
      default:
        return {};
    }
  }

  get username(): string {
    const username = this.userData.username.getValue();

    if (username) {
      return username;
    }
    return '';
  }

  get currentStreak(): string {
    const userCount = this.userData.userCount.getValue();
    if (userCount) {
      let streak =
        this.category == 'NF' ? userCount.NFcount : userCount.NPcount;
      return streak.toString();
    }
    return '0';
  }

  get category(): string {
    return this.isActive('/p-ranking') ? 'NP' : 'NF';
  }

  get daysToCommitMessage() {
    if (this.daysToCommit > 0) {
      if (this.daysToCommit > 1) {
        return '(' + this.daysToCommit + ' days)';
      }
      return '(' + this.daysToCommit + ' day)';
    }
    return '';
  }

  get commitButtonToolTip() {
    return this.isCommitButtonActive
      ? ''
      : 'Stay strong till tomorrow!';
  }

  get progressBarLabelAbove() {
    return 'Rank: ' + this.currentRank;
  }

  get currentRank(): string {
    const userCount = this.userData.userCount.getValue();

    if (!userCount) {
      return RANKING[0].label;
    }

    return this.category === 'NF'
      ? userCount.NFrank.currentRank.toUpperCase()
      : userCount.NPrank.currentRank.toUpperCase();
  }

  get nextRank(): string {
    const userCount = this.userData.userCount.getValue();

    if (!userCount) {
      return '';
    }

    return this.category === 'NF'
      ? userCount.NFrank.nextRank.toUpperCase()
      : userCount.NPrank.nextRank.toUpperCase();
  }

  get currentRankCompletion(): number {
    const userCount = this.userData.userCount.getValue();

    if (!userCount) {
      return 0;
    }

    return this.category === 'NF'
      ? userCount.NFrank.completion
      : userCount.NPrank.completion;
  }

  get progressBarLabelBelow(): string {
    const userCount = this.userData.userCount.getValue();

    if (!userCount) {
      return ' ';
    }

    const rankData =
      this.category === 'NF' ? userCount.NFrank : userCount.NPrank;

    if (rankData.nDaysTillNext == -1) {
      return 'Legends last forever.';
    }

    return (
      rankData.nDaysTillNext +
      (rankData.nDaysTillNext > 1 ? ' days' : ' day') +
      ' till next'
    );
  }

  get isMobile() {
    return window.innerWidth < MOBILE_WIDTH;
  }
}
