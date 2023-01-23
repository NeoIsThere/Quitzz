import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { navigateTo, openDialog } from 'src/app/services/utils/utils';
import { Friend } from 'src/app/interfaces/interface';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { FriendsDialogComponent } from './friends-dialog.component';
import { REFRESH_PERIOD_MS } from 'src/app/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent implements OnInit, OnDestroy {
  nFriendRequests = 0;
  notifPooling: NodeJS.Timeout;

  constructor(
    private dialog: MatDialog,
    private httpClient: HttpClientService,
  ) {}

  ngOnInit(): void {
    this.fetchFriendRequests();
    this.notifPooling = setInterval(
      () => this.fetchFriendRequests(),
      REFRESH_PERIOD_MS
    );
  }

  openFriendsDialog() {
    const dialogRef = openDialog(this.dialog, FriendsDialogComponent);
    dialogRef.afterClosed().subscribe(() => this.fetchFriendRequests());
  }

  fetchFriendRequests() {
    this.httpClient
      .get('/friends/requests/incoming')
      .subscribe((friends: Friend[]) => {
        this.nFriendRequests = friends.length;
      });
  }

  ngOnDestroy(): void {
    clearInterval(this.notifPooling);
  }
}
