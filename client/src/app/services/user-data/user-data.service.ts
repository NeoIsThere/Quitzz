import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { RANKING } from 'src/app/constants';
import {
  Rank,
  RankData,
  UserCount,
  RankingData,
  Username,
  Statistics,
  RankingPosition,
  SearchByUserResult,
} from 'src/app/interfaces/interface';
import { HttpClientService } from '../server-communication/http-client/http-client.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(private httpClient: HttpClientService) {}

  userCount: BehaviorSubject<UserCount | undefined> = new BehaviorSubject(
    undefined
  );

  rankingData: Subject<RankingData | SearchByUserResult> = new Subject();

  rankingPosition: BehaviorSubject<RankingPosition | undefined> =
    new BehaviorSubject(undefined);

  rankingStats: BehaviorSubject<Statistics | undefined> = new BehaviorSubject(
    undefined
  );

  username: BehaviorSubject<string | undefined> = new BehaviorSubject(
    undefined
  );

  commitSubject: Subject<any> = new Subject();

  closeInboxSubject: Subject<any> = new Subject();

  relapseSubject:  Subject<any> = new Subject();

  onCommit() {
    this.commitSubject.next();
  }

  onRelapse() {
    this.relapseSubject.next();
  }

  fetchCounts(): void {
    this.httpClient.get('/counts/committed').subscribe(
      (userCount: UserCount) => {
        let NFcount = userCount.NFcount;
        let NPcount = userCount.NPcount;
        let NFrank: RankData;
        let NPrank: RankData;

        if (NFcount < 0 || NPcount < 0) {
          this.userCount.next(undefined);
          return;
        } else {
          NFrank = this.computeRank(NFcount);
          NPrank = this.computeRank(NPcount);
        }

        const count: UserCount = { ...userCount, NFrank, NPrank };
        this.userCount.next(count);
      },
      (err) => {}
    );
  }

  fetchRankingData(category: string, pageIndex: number) {
    this.httpClient
      .get(`/users/category/${category}/page/${pageIndex}`)
      .subscribe(
        (rankingData: RankingData) => {
          this.rankingData.next(rankingData);
        },
        (err: HttpErrorResponse) => {
          console.log(err);
        }
      );
  }

  fetchRankingDataByUser(category: string, pageIndex: number, query: string) {
    this.httpClient
      .get(`/users/category/${category}/query/${query}/page/${pageIndex}`)
      .subscribe(
        (rankingData: SearchByUserResult) => {
          this.rankingData.next(rankingData);
        },
        (err: HttpErrorResponse) => {
          console.log(err);
        }
      );
  }

  fetchRankingPosition(category: string) {
    this.httpClient.get(`/account/rank/category/${category}`).subscribe(
      (rank: RankingPosition) => {
        this.rankingPosition.next(rank);
      },
      (err: HttpErrorResponse) => {
        console.log(err);
      }
    );
  }

  fetchStats(category: string) {
    this.httpClient
      .get(`/users/category/${category}/statistics`)
      .subscribe((statistics: Statistics) => {
        this.rankingStats.next(statistics);
      });
  }

  fetchUsername(): void {
    this.httpClient.get('/account/username').subscribe((username: Username) => {
      this.username.next(username.username);
    });
  }

  private computeRank(count: number): RankData {
    const ranks = RANKING;

    let currentRank: Rank;
    let nextRank: Rank;
    let completion: number = 0;
    let nDaysTillNext: number = 0;

    for (let i = 0; i < ranks.length; i++) {
      let rank: Rank = ranks[i];
      if (rank.min > count) {
        currentRank = ranks[i - 1];
        nextRank = ranks[i];
        if (nextRank.min == Number.MAX_SAFE_INTEGER) {
          return {
            currentRank: currentRank.label,
            nextRank: nextRank.label,
            completion: 1,
            nDaysTillNext: -1,
          };
        }
        const currentRankDuration = nextRank.min - currentRank.min;
        completion = (count - currentRank.min) / currentRankDuration;
        nDaysTillNext = nextRank.min - count;
        return {
          currentRank: currentRank.label,
          nextRank: nextRank.label,
          completion,
          nDaysTillNext,
        };
      }
    }

    return null as any;
  }
}
