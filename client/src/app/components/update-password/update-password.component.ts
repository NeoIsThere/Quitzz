import { HttpStatusCode } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
})
export class UpdatePasswordComponent implements OnInit {
  constructor(public dialog: MatDialog, private router: Router) {}

  username: string;
  token: string;

  ngOnInit(): void {
    const url: string[] = this.router.url.split('/');
    this.username = url[3];
    this.token = url[5];
    this.openPasswordUpdateDialog();
  }

  openPasswordUpdateDialog() {
    this.dialog.open(DialogContenUpdatePassword, {
      disableClose: true,
      data: { username: this.username, token: this.token },
    });
  }
}

@Component({
  selector: 'dialog-content-update-password',
  templateUrl: './update-password-dialog.html',
  styleUrls: ['./update-password-dialog.css'],
})
export class DialogContenUpdatePassword {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogContenUpdatePassword>,
    private httpClient: HttpClientService,
    private router: Router,
    private snackBar: SnackbarService
  ) {}

  customError: string | null = null;

  passwordForm: FormGroup;

  isPasswordVisible: Boolean = false;

  ngOnInit(): void {
    this.passwordForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).*$/),
      ]),
      passwordConfirmation: new FormControl('', [Validators.required]),
    });

    this.passwordForm.valueChanges.subscribe(() => {
      this.customError = null;
    });
  }

  onSubmit() {
    const newPassword: string = this.passwordForm.value.password;
    const passwordConfirmation =
      this.passwordForm.controls.passwordConfirmation.value;

    if (newPassword !== passwordConfirmation) {
      this.customError = 'The passwords do not match';
      return;
    }

    this.passwordForm.disable();

    this.httpClient
      .put(
        '/account/password/username/' +
          this.data.username +
          '/token/' +
          this.data.token,
        {
          newPassword,
        }
      )
      .subscribe(
        () => {
          this.snackBar.openSnackBar('Password updated.');
          this.dialogRef.close();
          this.router.navigateByUrl('/');
        },
        (err: number) => {
          if (err == HttpStatusCode.Unauthorized) {
            this.customError =
              'The link to reset your password has expired. Please request another link.';
            return;
          }
        }
      );
  }

  onCancel() {
    this.dialogRef.close();
    this.router.navigateByUrl('/pmo-ranking');
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
