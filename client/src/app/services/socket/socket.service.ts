import { HttpStatusCode } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { DEV_BACKEND, PROD_BACKEND } from 'src/app/constants';
import { Message } from 'src/app/interfaces/interface';
import { InternalCommunicationsService } from '../internal-communications/internal-communications.service';
import { SnackbarService } from '../snackbar/snackbar.service';
import { openLoginDialog } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private API_BASE_URL = PROD_BACKEND;
  private socket: Socket;

  newMessage: Subject<Message> = new Subject();
  deletedMessage: Subject<string> = new Subject();
/*
  constructor(
    private dialog: MatDialog,
    private internalCommunications: InternalCommunicationsService,
    private snackbar: SnackbarService
  ) {
    if (!isDevMode()) {
      this.API_BASE_URL = PROD_BACKEND;
    }
  }

  connectIfNeeded() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(this.API_BASE_URL, {
        withCredentials: true,
        reconnection: false,
      });
      this.setListeners();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isConnected() {
    return this.socket.connected;
  }

  fetchMessages(channel: string, callback: (messages: Message[]) => void) {
    this.socket.emit('join', channel, callback);
  }

  leave() {
    this.socket.emit('leave');
  }

  sendMessage(channel: string, message: string) {
    this.socket.emit('post-message', channel, message);
  }

  getOlderMessages(
    channel: string,
    afterId: string,
    callback: (messages: Message[]) => void
  ) {
    this.socket.emit('get-messages-after', channel, afterId, callback);
  }

  deleteMessage(channel: string, id: string) {
    this.socket.emit('delete', channel, id);
  }

  setListeners() {
    this.socket.removeAllListeners();

    this.socket.on('get-message', (message: Message) => {
      this.newMessage.next(message);
    });

    this.socket.on('delete-message', (id: string) => {
      this.deletedMessage.next(id);
    });

    this.socket.on('connect_error', (error: Error) => {
      const status = error.message as any as number;
      if (status == HttpStatusCode.Unauthorized) {
        openLoginDialog(this.dialog,{onLoginSuccess: ()=>{}});

      }
    });

    this.socket.on('rate-limit', (error: Error) => {
      this.snackbar.openSnackBar('Please do not spam.', true);
    });
  }*/
}
