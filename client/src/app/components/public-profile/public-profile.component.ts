import { HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountData } from 'src/app/interfaces/interface';
import { InternalCommunicationsService } from 'src/app/services/internal-communications/internal-communications.service';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import {
  convertUTCToLocal,
  openLoginDialog,
  UTCToLocalConversionMode,
} from 'src/app/services/utils/utils';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css'],
})
export class PublicProfileComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private httpClient: HttpClientService,
    private snackbar: SnackbarService
  ) {}

  isReady: boolean = false;

  username: string = '';
  motto: string = '';
  joinedSince: string = '';
  NPrecord: number = 0;
  NFrecord: number = 0;

  isMyFriend: boolean = false;
  isRequestAlreadySent: boolean = false;
  isRequestAlreadyReceived: boolean = false;

  isAddFriendButtonDisabled: boolean = false;

  ngOnInit(): void {
    const url: string[] = this.router.url.split('/');
    this.username = url[2];
    this.refresh();
  }

  fetchWhetherRequestAlreadyReceived() {
    this.httpClient
      .get('/friends/requests/incoming/includes/' + this.username)
      .subscribe((response: { isIncluded: boolean }) => {
        this.isRequestAlreadyReceived = response.isIncluded;
      });
  }

  fetchWhetherRequestAlreadySent() {
    this.httpClient
      .get('/friends/requests/outgoing/includes/' + this.username)
      .subscribe((response: { isIncluded: boolean }) => {
        this.isRequestAlreadySent = response.isIncluded;
      });
  }

  fetchWhetherIsFriend() {
    this.httpClient
      .get('/friends/includes/' + this.username)
      .subscribe((response: { isIncluded: boolean }) => {
        this.isMyFriend = response.isIncluded;
      });
  }

  refresh() {
    const onSuccess = () => {
      this.refresh();
    };

    this.isReady = false;
    this.fetchWhetherIsFriend();
    this.fetchWhetherRequestAlreadySent();
    this.fetchWhetherRequestAlreadyReceived();

    this.httpClient.get('/account/' + this.username).subscribe(
      (accountData: AccountData) => {
        this.username = accountData.username;
        this.motto = accountData.motto;
        this.NFrecord = accountData.NFrecordCount;
        this.NPrecord = accountData.NPrecordCount;
        this.joinedSince = convertUTCToLocal(
          accountData.joinedSince,
          UTCToLocalConversionMode.dayOnly
        );
        this.isReady = true;
      },
      (err) => {
        if (err == HttpStatusCode.Unauthorized) {
          openLoginDialog(this.dialog, { onLoginSuccess: onSuccess });
        }
      }
    );
  }

  addFriend() {
    this.isAddFriendButtonDisabled = true;

    this.httpClient.put('/friends/requests/' + this.username, {}).subscribe(
      () => {
        this.snackbar.openSnackBar('Friend request sent.');
      },
      (err) => {
        if (err == HttpStatusCode.Forbidden) {
          this.snackbar.openSnackBar('Friends limit reached.', true);
        }
      }
    );
  }

  formatFromUtc(utc: string) {
    return utc.substring(0, utc.indexOf('T'));
  }

  get isFriendRequestSendable() {
    return (
      !this.isMyFriend &&
      !this.isRequestAlreadyReceived &&
      !this.isRequestAlreadySent
    );
  }
}
