import { HttpStatusCode } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InternalCommunicationsService } from 'src/app/services/internal-communications/internal-communications.service';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { openLoginDialog } from 'src/app/services/utils/utils';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private httpClient: HttpClientService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {}

  messageForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  onSubmit() {
    const message = this.messageForm.value;

    this.httpClient.post('/contact', message).subscribe(
      () => {
        this.snackbar.openSnackBar('Message sent.');
        this.messageForm.reset('');
      },
      (err) => {
        if (err == HttpStatusCode.Unauthorized) {
          openLoginDialog(this.dialog,{onLoginSuccess: () => {}});
        }
        if (err == HttpStatusCode.TooManyRequests) {
          this.snackbar.openSnackBar(
            'You have already made a submission today'
          );
        }
      }
    );
  }
}
