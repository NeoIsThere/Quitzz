import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { HttpStatusCode } from '@angular/common/http';
import {
  LoginDialogData,
  SignUpCredentials,
} from '../../../interfaces/interface';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { includesProfanity, navigateTo } from 'src/app/services/utils/utils';
import { MAX_STREAK } from 'src/app/constants';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data/user-data.service';

enum STATE {
  signIn,
  signUp,
  passwordRecovery,
}

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent implements OnInit {
  state: STATE = STATE.signIn;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LoginDialogData,
    private httpClient: HttpClientService,
    private snackbar: SnackbarService,
    private dialogRef: MatDialogRef<LoginFormComponent>,
    private router: Router,
    private userData: UserDataService
  ) {}

  currentTimeZone: string;

  isCurrentStreakVisible: boolean = false;

  signInForm: FormGroup;
  signUpForm: FormGroup;
  passwordRecoveryForm: FormGroup;

  isPasswordVisible: boolean = false;

  customError: string | null = null;

  ngOnInit(): void {
    this.currentTimeZone = moment.tz.guess();

    this.signInForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.signUpForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^([0-9]|[a-zA-Z]|_)*$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).*$/),
      ]),
      passwordConfirmation: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      currentStreakNF: new FormControl('', [
        Validators.min(0),
        Validators.max(MAX_STREAK),
      ]),
      currentStreakNP: new FormControl('', [
        Validators.min(0),
        Validators.max(MAX_STREAK),
      ]),
    });

    this.passwordRecoveryForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
    });

    this.signInForm.valueChanges.subscribe(() => {
      this.customError = null;
    });

    this.signUpForm.valueChanges.subscribe(() => {
      this.customError = null;
    });

    this.passwordRecoveryForm.valueChanges.subscribe(() => {
      this.customError = null;
    });
  }

  onSignIn() {
    this.signInForm.disable();
    this.httpClient.post('/sign-in', this.signInForm.value).subscribe(
      () => {
        this.onConnected();
        this.signInForm.enable();
      },
      (err: number) => {
        this.signInForm.enable();

        if (err == HttpStatusCode.Unauthorized) {
          this.customError = 'The username or password is invalid';
          return;
        }
        if (err == HttpStatusCode.Forbidden) {
          this.customError =
            'Too many failed sign-in attempts. Please try again in 15 mins.';

          return;
        }
      }
    );
  }

  onSignUp() {
    if (!this.signUpForm.valid) {
      return;
    }

    const credentials: SignUpCredentials = this.signUpForm.value;

    if (includesProfanity(credentials.username)) {
      this.signUpForm.reset();
      this.snackbar.openSnackBar('Some words are restricted.', true);
      return;
    }

    const password = credentials.password;
    const passwordConfirmation =
      this.signUpForm.controls.passwordConfirmation.value;
    if (password !== passwordConfirmation) {
      this.customError = 'The passwords do not match';
      return;
    }

    credentials.timeZone = moment.tz.guess();
    const streakNF = credentials.currentStreakNF;
    const streakNP = credentials.currentStreakNP;
    credentials.currentStreakNF = !streakNF ? '0' : credentials.currentStreakNF;
    credentials.currentStreakNP = !streakNP ? '0' : credentials.currentStreakNP;

    this.signUpForm.disable();
    this.httpClient.post('/sign-up', credentials).subscribe(
      () => {
        this.signUpForm.enable();

        this.onConnected();
        this.snackbar.openSnackBar('You are now logged in');
      },
      (err: number) => {
        this.signUpForm.enable();

        if (err == HttpStatusCode.Conflict) {
          this.customError = 'This username is already taken.';
          return;
        }
        if (err == HttpStatusCode.Forbidden) {
          this.customError = 'Some words are restricted.';
          return;
        }
      }
    );
  }

  onConnected() {
    this.dialogRef.close();
    this.userData.fetchUsername();
    this.userData.fetchCounts(); //after logged in, the page does not refresh but we want the data to be refreshed, so we need
    //to fetch it
    if (this.data.onLoginSuccess) {
      this.data.onLoginSuccess();
    }
  }

  closeDialog() {
    navigateTo(this.router);
    this.dialogRef.close();
    if (this.data.onCloseWithoutLogin) {
      this.data.onCloseWithoutLogin();
    }
  }

  onResetPassword() {
    const username: string = this.passwordRecoveryForm.value.username;
    this.passwordRecoveryForm.disable();
    this.httpClient.delete('/account/password/username/' + username).subscribe(
      () => {
        this.passwordRecoveryForm.enable();
        this.onConnected();
        this.snackbar.openSnackBar(
          'Email has been sent if the username exists.'
        );
      },
      (err: number) => {
        this.passwordRecoveryForm.enable();
        if (err == HttpStatusCode.TooManyRequests) {
          this.customError =
            'A link to reset your password has already been requested in the past minute.';
          return;
        }
      }
    );
  }

  toggleCurrentStreaks() {
    this.isCurrentStreakVisible = !this.isCurrentStreakVisible;
    if (!this.isCurrentStreakVisible) {
      this.signUpForm.controls.currentStreakNF.setValue('');
      this.signUpForm.controls.currentStreakNP.setValue('');
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  resetAllForms() {
    this.signInForm.reset();
    this.signUpForm.reset();
    this.passwordRecoveryForm.reset();
    this.customError = null;
  }

  switchToSignIn() {
    this.state = STATE.signIn;
    this.resetAllForms();
  }

  switchToSignUp() {
    this.state = STATE.signUp;
    this.resetAllForms();
  }

  switchToPasswordRecovery() {
    this.state = STATE.passwordRecovery;
    this.resetAllForms();
  }

  get isSignIn() {
    return this.state === STATE.signIn;
  }

  get isSignUp() {
    return this.state === STATE.signUp;
  }

  get isPasswordRecovery() {
    return this.state === STATE.passwordRecovery;
  }
}
