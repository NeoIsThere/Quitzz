import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Goal } from 'src/app/interfaces/interface';
import { MOCK_GOALS } from 'src/app/mock-data';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import {
  convertUTCToLocal,
  UTCToLocalConversionMode,
} from 'src/app/services/utils/utils';
import { SimpleDialogComponent } from '../simple-dialog/simple-dialog.component';
import { body, title } from './dialog-content';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
})
export class StatsComponent implements OnInit {
  @Input()
  category: string;

  completedGoals: Goal[];

  constructor(
    private userData: UserDataService,
    private httpClient: HttpClientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.httpClient
      .get('/goals/validated/' + this.category)
      .subscribe((goals) => {
        this.completedGoals = goals;
      });
  }

  getDate(goal: Goal) {
    return convertUTCToLocal(goal.endDate, UTCToLocalConversionMode.dayOnly);
  }

  openExplanationDialog() {
    const dialogRef = this.dialog.open(SimpleDialogComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.body = body;
  }

  get streakAvg(): string {
    const userCount = this.userData.userCount.getValue();
    if (userCount) {
      let avg =
        this.category == 'NF'
          ? userCount.NFstreakAverage
          : userCount.NPstreakAverage;
      return avg.toString();
    }
    return '0';
  }
}
