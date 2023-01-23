import { HttpStatusCode } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MotivationMessage } from 'src/app/interfaces/interface';
import { InternalCommunicationsService } from 'src/app/services/internal-communications/internal-communications.service';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import {
  includesProfanity,
  openLoginDialog,
} from 'src/app/services/utils/utils';

@Component({
  selector: 'app-random-motivation',
  templateUrl: './random-motivation.component.html',
  styleUrls: ['./random-motivation.component.css'],
})
export class RandomMotivationComponent implements OnInit {
  constructor(
    private httpClient: HttpClientService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {}

  message: string = '';
  author: string = '';
  isEdit: boolean = false;

  clickableText = 'Click here to submit your own message';

  motivationMessageForm = new FormGroup({
    message: new FormControl('', [
      Validators.required,
      Validators.maxLength(30),
    ]),
  });

  ngOnInit(): void {
    this.httpClient.get('/motivation-message/random').subscribe(
      (motivationMessage: MotivationMessage) => {
        this.message = motivationMessage.message;
        this.author = motivationMessage.author;
      },
      (err) => {}
    );
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
    if (this.isEdit) {
      this.clickableText = 'Hide';
    } else {
      this.clickableText = 'Click here to submit your own message';
    }
  }

  onSubmit() {
    const message = this.motivationMessageForm.value;

    if (includesProfanity(message.message)) {
      this.motivationMessageForm.reset();
      this.snackbar.openSnackBar('Some words are restricted.', true);
      return;
    }

    this.httpClient.post('/motivation-message', message).subscribe(
      () => {
        this.snackbar.openSnackBar('Message submitted.');
        this.motivationMessageForm.reset();
        this.isEdit = false;
      },
      (err) => {
        if (err == HttpStatusCode.Unauthorized) {
          openLoginDialog(this.dialog, { onLoginSuccess: () => {} });
        }
        if (err == HttpStatusCode.TooManyRequests) {
          this.snackbar.openSnackBar(
            'You have already made a submission today.'
          );
        }
        if (err == HttpStatusCode.Forbidden) {
          this.snackbar.openSnackBar('Some words are restricted.', true);
        }
      }
    );
  }
}
