import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  navigateTo,
  openDialog,
  openLoginDialog,
} from 'src/app/services/utils/utils';
import {
  Friend,
  FriendDialogData,
  FRIENDS_DIALOG_MODE,
} from 'src/app/interfaces/interface';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { InboxDialogComponent } from '../inbox/inbox.component';
import { HttpStatusCode } from '@angular/common/http';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends-dialog',
  templateUrl: './friends-dialog.html',
  styleUrls: ['./friends-dialog.css'],
})
export class FriendsDialogComponent implements OnInit {
  friends: Friend[] = [];

  nSelectedFriends: number = 0;

  nMaxSelectableFriends: number = 0;

  nFriendRequests: number = 0;

  conversationIdFilter: string = '';

  mode: FRIENDS_DIALOG_MODE = FRIENDS_DIALOG_MODE.DEFAULT;

  isLoading: boolean = false;

  areButtonsDisabled: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FriendDialogData,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FriendsDialogComponent>,
    private httpClient: HttpClientService,
    private snackbar: SnackbarService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.data) {
      if (this.data.mode) {
        this.mode = this.data.mode;
      }
      if (this.data.selectionLimit) {
        this.nMaxSelectableFriends = this.data.selectionLimit;
      }
      if (this.data.conversationId) {
        this.conversationIdFilter = this.data.conversationId;
      }
    }

    this.isLoading = true;
    await this.fetchFriends();
    await this.fetchNumberOfFriendRequests();
    this.isLoading = false;
  }

  fetchFriends() {
    this.friends = [];
    return new Promise((resolve, reject) => {
      const url = this.conversationIdFilter
        ? '/friends/not-in-conversation/' + this.conversationIdFilter
        : '/friends';
      this.httpClient.get(url).subscribe(
        (friends: Friend[]) => {
          this.friends = friends;
          resolve('');
        },
        (err) => {
          if (err == HttpStatusCode.Unauthorized) {
            openLoginDialog(this.dialog, {
              onLoginSuccess: async () => {
                await this.fetchFriends();
                resolve('');
              },
              onCloseWithoutLogin: () => this.dialogRef.close(),
            });
          }
        }
      );
    });
  }

  fetchNumberOfFriendRequests() {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get('/friends/requests/incoming/count')
        .subscribe((response: { numberOfRequests: number }) => {
          this.nFriendRequests = response.numberOfRequests;
          resolve('');
        });
    });
  }

  fetchRequests() {
    this.friends = [];
    return new Promise((resolve, reject) => {
      this.httpClient
        .get('/friends/requests/incoming')
        .subscribe((friends: Friend[]) => {
          this.friends = friends;
          resolve('');
        });
    });
  }

  toggleFriend(event: MatCheckboxChange, friend: Friend) {
    friend.isSelected = event.checked;
    this.nSelectedFriends += event.checked ? 1 : -1;
  }

  navigateToProfile(username: string) {
    this.dialogRef.close();
    navigateTo(this.router, '/profile/' + username);
  }

  async switchToDefault() {
    this.isLoading = true;
    this.mode = FRIENDS_DIALOG_MODE.DEFAULT;
    await this.fetchFriends();
    this.isLoading = false;
  }

  async switchToRequests() {
    this.isLoading = true;
    this.mode = FRIENDS_DIALOG_MODE.REQUESTS;
    await this.fetchRequests();
    this.isLoading = false;
  }

  onSelectionConfirm() {
    const selectedFriends: string[] = [];
    this.friends.forEach((friend) => {
      if (friend.isSelected) {
        selectedFriends.push(friend.username);
      }
    });
    this.friends.forEach((friend) => (friend.isSelected = false));
    this.dialogRef.close(selectedFriends);
  }

  onSendMessage(username: string) {
    this.isLoading = true;
    this.httpClient.post('/conversations', { members: [username] }).subscribe(
      (conversationID) => {
        this.isLoading = false;
        openDialog(this.dialog, InboxDialogComponent, conversationID);
        this.dialogRef.close();
      },
      (err) => {
        if (err == HttpStatusCode.Forbidden) {
          this.snackbar.openSnackBar('Conversations limit reached.', true);
        }
      }
    );
  }

  onRemove(username: string) {
    this.areButtonsDisabled = true;
    const isConfirmed = window.confirm(
      'Remove from ' + username + ' your friends?'
    );
    if (isConfirmed) {
      this.httpClient.delete('/friends/' + username).subscribe(() => {
        this.fetchFriends();
        this.areButtonsDisabled = false;
      });
    }
  }

  onAccept(username: string) {
    this.areButtonsDisabled = true;
    this.httpClient.post('/friends/requests/accept/' + username, {}).subscribe(
      () => {
        this.fetchRequests();
        this.fetchNumberOfFriendRequests();
        this.areButtonsDisabled = false;
      },
      (err) => {
        if (err == HttpStatusCode.Forbidden) {
          this.snackbar.openSnackBar('Friends limit reached.', true);
        }
      }
    );
  }

  onIgnore(username: string) {
    this.areButtonsDisabled = true;
    this.httpClient
      .post('/friends/requests/reject/' + username, {})
      .subscribe(() => {
        this.fetchRequests();
        this.fetchNumberOfFriendRequests();
        this.areButtonsDisabled = false;
      });
  }

  get isDefaultMode() {
    return this.mode == FRIENDS_DIALOG_MODE.DEFAULT;
  }

  get isRequestsMode() {
    return this.mode == FRIENDS_DIALOG_MODE.REQUESTS;
  }

  get isSelectorMode() {
    return this.mode == FRIENDS_DIALOG_MODE.SELECTOR;
  }

  get isSelectionLimitReached() {
    return this.nSelectedFriends >= this.nMaxSelectableFriends;
  }
}
