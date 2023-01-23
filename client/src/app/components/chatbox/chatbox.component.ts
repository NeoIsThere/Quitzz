import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Message } from 'src/app/interfaces/interface';
import { SocketService } from 'src/app/services/socket/socket.service';
import { UserDataService } from 'src/app/services/user-data/user-data.service';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css'],
})
export class ChatboxComponent implements OnInit, OnDestroy {
  ngOnInit(): void {}

  ngOnDestroy(): void {}

  /* _currentChannel: string = 'C1';

  get currentChannel() {
    return this._currentChannel;
  }
  set currentChannel(value: string) {
    this._currentChannel = value;
    this.connect();
    this.fetchMessages();
  }

  @ViewChild('chat') chatElement: ElementRef;

  messageForm = new FormGroup({
    message: new FormControl('', [Validators.maxLength(1000)]),
  });

  username: string;
  usernameSubscribtion: Subscription;

  displayLoadMoreMsgButton: boolean = false;

  //@ViewChild('chatbox') chatbox: ElementRef;

  messages: Message[] = [];

  newMessageSubscribtion: Subscription;
  deletedMessageSubscribtion: Subscription;

  scrollToBottomCoolDown: number;

  constructor(
    private socketService: SocketService,
    private userData: UserDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.newMessageSubscribtion = this.socketService.newMessage.subscribe(
      (message: Message) => {
        this.messages.push(message);
        this.scrollToBottom(true);
      }
    );

    this.deletedMessageSubscribtion =
      this.socketService.deletedMessage.subscribe((id: string) => {
        this.messages = this.messages.filter((msg) => msg.id != id);
      });

    this.usernameSubscribtion = this.userData.username.subscribe((username) => {
      if (username) {
        this.username = username;
      }
    });

    this.connect();
    this.fetchMessages();

    window.scrollTo({
      top: 150,
      left: 0,
      behavior: 'smooth',
    });

    setInterval(() => {
      this.scrollToBottomCoolDown = Math.max(
        0,
        this.scrollToBottomCoolDown - 1
      );
    }, 1000);
  }

  onSend() {
    if (!this.isSocketConnected) {
      this.connect();
      this.fetchMessages();
    }
    let message = this.messageForm.controls.message.value;
    if (!message || message.length == 0) {
      return;
    }
    if (!/\S/.test(message)) {
      return;
    }
    message = message.replace(/\n\s*\n\n/g, '\n\n');
    this.sendMessage(message);
    this.messageForm.reset();
    this.scrollToBottom(false);
  }

  sendMessage(message: string) {
    this.socketService.sendMessage(this.currentChannel, message);
  }

  loadMoreMessages() {
    if (this.messages.length == 0) {
      return;
    }
    const oldestMessage = this.messages[0];
    this.socketService.getOlderMessages(
      this.currentChannel,
      oldestMessage.id,
      (messages: Message[]) => {
        this.messages = [...messages, ...this.messages];
      }
    );
  }

  navigateTo(relativeUrl: string) {
    this.router.navigateByUrl(relativeUrl);
  }

  scrollToBottom(shouldWaitForTimer: boolean) {
    if (shouldWaitForTimer) {
      if (this.scrollToBottomCoolDown > 0) {
        return;
      }
    }
    setTimeout(() => {
      const maximumScrollHeight = this.chatElement.nativeElement.scrollHeight;
      this.chatElement.nativeElement.scrollTop = maximumScrollHeight;
    }, 25);
  }

  onScroll() {
    this.scrollToBottomCoolDown = 5;
  }

  isSocketConnected() {
    return this.socketService.isConnected();
  }

  deleteMessage(message: Message) {
    this.socketService.deleteMessage(this.currentChannel, message.id);
  }

  connect() {
    this.socketService.connectIfNeeded();
  }

  fetchMessages() {
    this.socketService.fetchMessages(
      this.currentChannel,
      (messages: Message[]) => {
        this.messages = messages;
        this.scrollToBottom(false);
      }
    );
  }
  get presentableCurrentChannel() {
    switch (this.currentChannel) {
      case 'C1':
        return 'Global 1';
      case 'C2':
        return 'Global 2';
      case 'C3':
        return 'Global 3';
      default:
        return 'Global Chat';
    }
  }

  get isAdminConnected() {
    return this.username == 'Neo';
  }

  ngOnDestroy(): void {
    this.newMessageSubscribtion.unsubscribe();
    this.socketService.leave();
  }*/
}
