import { Component, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackbar: MatSnackBar) {}

  openSnackBar(
    message: string,
    isError: boolean = false,
    durationMs: number = 5000,
  ) {
    this.snackbar.open(message, undefined, {
      duration: durationMs,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: isError ? ['snackbar-error'] : '',
    });
  }
}
