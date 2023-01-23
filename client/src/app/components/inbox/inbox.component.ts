import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Route, Router } from '@angular/router';
import {
  MAX_PEOPLE_IN_CONVERSATION,
  REFRESH_PERIOD_MS,
  TABLET_MAX_WIDTH,
} from 'src/app/constants';
import {
  Conversation,
  FriendDialogData,
  FRIENDS_DIALOG_MODE,
  Message,
} from 'src/app/interfaces/interface';
import { MOCK_CONVERSATIONS } from 'src/app/mock-data';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import {
  convertUTCToLocal,
  navigateTo,
  openDialog,
  openLoginDialog,
  UTCToLocalConversionMode,
} from 'src/app/services/utils/utils';
import { HttpStatusCode } from '@angular/common/http';
import { FriendsDialogComponent } from '../friends/friends-dialog.component';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

enum MODE {
  LIST,
  MESSAGES,
  MEMBERS,
}

const DEFAULT_CONVERSATION: Conversation = {
  id: '',
  isUnread: false,
  members: [],
  messages: [],
};

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css'],
})
export class InboxComponent implements OnInit, OnDestroy {
  nUnreadMessages = 0;
  notifPooling: NodeJS.Timeout;

  constructor(
    private dialog: MatDialog,
    private httpClient: HttpClientService
  ) {}

  ngOnInit(): void {
    this.fetchUnreadConversations();
    this.notifPooling = setInterval(
      () => this.fetchUnreadConversations(),
      REFRESH_PERIOD_MS
    );
  }

  openInboxDialog() {
    const dialogRef = openDialog(this.dialog, InboxDialogComponent);
    dialogRef.afterClosed().subscribe(() => this.fetchUnreadConversations());
  }

  fetchUnreadConversations() {
    this.nUnreadMessages = 0;
    this.httpClient
      .get('/conversations/unread')
      .subscribe((unreadConversationIds) => {
        this.nUnreadMessages = unreadConversationIds.length;
      });
  }

  ngOnDestroy(): void {
    clearInterval(this.notifPooling);
  }
}

@Component({
  selector: 'app-inbox-dialog',
  templateUrl: './inbox-dialog.html',
  styleUrls: ['./inbox-dialog.css'],
})
export class InboxDialogComponent implements OnInit {
  @ViewChild('conversation') conversationElement: ElementRef;

  currentConversation: Conversation = DEFAULT_CONVERSATION;

  mode: MODE = MODE.LIST;

  currentMessagesIndex: number = 0;

  conversations: Conversation[] = [];

  isLoading: boolean = false;

  _isInputDisabled: boolean = true;

  maxMessagesIndex: number = 0;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private httpClient: HttpClientService,
    private dialogRef: MatDialogRef<FriendsDialogComponent>,
    private userData: UserDataService,
    private snackbar: SnackbarService,
    @Inject(MAT_DIALOG_DATA) private conversationID: string
  ) {}

  async ngOnInit() {
    this.dialogRef
      .afterClosed()
      .subscribe(() => this.userData.closeInboxSubject.next(''));

    this._isInputDisabled = true;
    this.isLoading = true;
    if (this.conversationID) {
      this.mode = MODE.MESSAGES;
      await this.fetchCurrentConversation();
      this.isLoading = false;
      this._isInputDisabled = false;
      return;
    }
    await this.fetchConversations();
    this.isLoading = false;
    this._isInputDisabled = false;
  }
  messageForm = new FormGroup({
    message: new FormControl('', [Validators.maxLength(1000)]),
  });

  async refresh() {
    this.isLoading = true;
    await this.fetchConversations();
    this.isLoading = false;
  }

  async switchToList() {
    this.mode = MODE.LIST;
    this.currentConversation = DEFAULT_CONVERSATION;
    this.isLoading = true;
    await this.fetchConversations();
    this.isLoading = false;
  }

  switchToMessages() {
    this.mode = MODE.MESSAGES;
  }

  switchToMembers() {
    if (this.isNotifConversation()) {
      return;
    }
    this.mode = MODE.MEMBERS;
  }

  async onConversationClick(conversationID: string) {
    this.currentMessagesIndex = 0;
    this.currentConversation = DEFAULT_CONVERSATION;
    this.conversationID = conversationID;

    this.isLoading = true;
    this._isInputDisabled = true;
    this.mode = MODE.MESSAGES;
    await this.fetchCurrentConversation();
    this.isLoading = false;
    this._isInputDisabled = false;
  }

  addPeople() {
    const friendsDialogData: FriendDialogData = {
      mode: FRIENDS_DIALOG_MODE.SELECTOR,
      selectionLimit: MAX_PEOPLE_IN_CONVERSATION,
      conversationId: this.currentConversation.id,
    };

    const friendsDialogRef = openDialog(
      this.dialog,
      FriendsDialogComponent,
      friendsDialogData
    );
    friendsDialogRef.afterClosed().subscribe((selectedFriends: any) => {
      if (!selectedFriends) {
        return;
      }
      this.isLoading = true;

      this.httpClient
        .put('/conversations/' + this.conversationID + '/members', {
          newMembers: selectedFriends,
        })
        .subscribe(async () => {
          await this.fetchCurrentConversation();
          this.isLoading = false;
        }, (err) => {
          if (err == HttpStatusCode.Forbidden) {
            this.snackbar.openSnackBar('Members limit reached.', true);
          }
        });
    });
  }

  onLeaveConversation() {
    const isConfirmed = window.confirm('Leave conversation?');
    this.mode = MODE.LIST;

    if (isConfirmed) {
      this.isLoading = true;
      this.httpClient
        .delete('/conversations/' + this.conversationID)
        .subscribe(async () => {
          await this.fetchConversations();
          this.isLoading = false;
        });
    }
  }

  onSendMessage() {
    const messageContent = this.messageForm.value;
    this.httpClient
      .post('/conversations/' + this.conversationID, messageContent)
      .subscribe(async () => {
        await this.fetchCurrentConversationMessages(false);
      });
    this.messageForm.reset();
  }

  onMemberClick(username: string) {
    this.dialogRef.close();
    navigateTo(this.router, '/profile/' + username);
  }

  async onLoadMoreMessages() {
    this._isInputDisabled = true;
    this.currentMessagesIndex++;
    await this.fetchCurrentConversationMessages(true);
    this._isInputDisabled = false;
  }

  fetchConversations() {
    this.conversations = [];
    return new Promise((resolve, reject) => {
      this.httpClient.get('/conversations').subscribe(
        async (conversations: Conversation[]) => {
          this.conversations = conversations;
          await this.fetchUnreadConversations();
          resolve('');
        },
        (err) => {
          if (err == HttpStatusCode.Unauthorized) {
            openLoginDialog(this.dialog, {
              onLoginSuccess: async () => {
                await this.fetchConversations();
                resolve('');
              },
              onCloseWithoutLogin: () => this.dialogRef.close(),
            });
          }
        }
      );
    });
  }

  fetchCurrentConversation() {
    this.currentConversation.members = [];

    return new Promise((resolve, reject) => {
      this.httpClient.get('/conversations/' + this.conversationID).subscribe(
        async (conversation: Conversation) => {
          this.currentConversation = conversation;
          await this.fetchCurrentConversationMessages(false);
          resolve('');
        },
        (err) => {
          if (err == HttpStatusCode.Unauthorized) {
            openLoginDialog(this.dialog, {
              onLoginSuccess: async () => {
                await this.fetchCurrentConversation();
                resolve('');
              },
              onCloseWithoutLogin: () => this.dialogRef.close(),
            });
          }
        }
      );
    });
  }

  fetchCurrentConversationMessages(isPreviousMessages: boolean) {
    return new Promise((resolve, reject) => {

      if (!isPreviousMessages) {
        this.currentMessagesIndex = 0;
      }

      this.httpClient
        .get(
          '/conversations/' + this.conversationID + '/messages/' + this.currentMessagesIndex
        )
        .subscribe((res: { messages: Message[]; maxIndex: number }) => {


          this.maxMessagesIndex = res.maxIndex;

          res.messages.reverse();

          if (isPreviousMessages) {
            this.currentConversation.messages = [
              ...res.messages,
              ...this.currentMessages,
            ];
          } else {
            this.currentConversation.messages = res.messages;
          }
          if (!isPreviousMessages) {
            this.scrollToBottom();
          }

          resolve('');
        });
    });
  }

  fetchUnreadConversations() {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get('/conversations/unread')
        .subscribe((unreadConversationIds: string[]) => {
          this.conversations.forEach((convo) => {
            convo.isUnread = unreadConversationIds.includes(convo.id);
          });
          resolve('');
        });
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (!this.conversationElement) {
        return; //because it might be loading
      }
      const maximumScrollHeight =
        this.conversationElement.nativeElement.scrollHeight;
      this.conversationElement.nativeElement.scrollTop = maximumScrollHeight;
    }, 25);
  }

  isNotifConversation(conversation?: Conversation) {
    let convo = conversation ? conversation : this.currentConversation;
    return convo.id.includes('notifications');
  }

  getMembersStr(conversation?: Conversation): string {
    if (!conversation) {
      return '';
    }

    if (conversation.id.includes('notifications')) {
      return 'Notifications';
    }

    let membersStr: string = '';
    conversation.members.forEach((member, index) => {
      membersStr += member;
      if (index != conversation.members.length - 1) {
        membersStr += ',';
      }
      membersStr += ' ';
    });
    return membersStr.toString();
  }

  get currentMessages() {
    return this.currentConversation.messages
      ? this.currentConversation.messages
      : [];
  }

  get currentMembers() {
    return this.currentConversation.members;
  }

  getLatestMessage(conversation?: Conversation): string {
    if (!conversation) {
      return '';
    }
    if (conversation.messages.length == 0) {
      return '';
    }
    const messages: Message[] = conversation.messages;
    return messages[messages.length - 1].content;
  }

  getLatestMessageDate(conversation?: Conversation): string {
    if (!conversation) {
      return '';
    }
    const messages: Message[] = conversation.messages;
    if (messages.length == 0) {
      return '';
    }
    return convertUTCToLocal(
      messages[messages.length - 1].date,
      UTCToLocalConversionMode.onlyTimeOrOnlyDay
    );
  }

  get isMessageEmpty() {
    const currentMessage = this.messageForm.controls['message'].value;
    return currentMessage && currentMessage.length == 0;
  }

  get isMaxMessagesIndexReached() {
    return this.currentMessagesIndex >= this.maxMessagesIndex;
  }

  get isListMode() {
    return this.mode == MODE.LIST;
  }

  get isMessagesMode() {
    return this.mode == MODE.MESSAGES;
  }

  get isMembersMode() {
    return this.mode == MODE.MEMBERS;
  }

  get isInputDisabled() {
    return this.isNotifConversation() || this._isInputDisabled;
  }
}
