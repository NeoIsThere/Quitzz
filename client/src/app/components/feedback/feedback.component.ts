import { HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
})
export class FeedbackComponent implements OnInit {
  form: FormGroup = new FormGroup({
    feedback: new FormControl('', [
      Validators.required,
      Validators.maxLength(2000),
    ]),
  });

  constructor(
    private httpClient: HttpClientService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {}

  onSubmitFeedback() {
    this.form.disable();
    const formValue = this.form.value;

    this.httpClient.post('/feedback', formValue).subscribe(
      () => {
        this.snackbar.openSnackBar('Feedback sent!');
        this.form.reset();
      },
      (err) => {
        if (err == HttpStatusCode.TooManyRequests) {
          this.snackbar.openSnackBar(
            'Please wait before sending another feedback.',
            true
          );
        }
      }
    );
  }
}
