import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, EMPTY, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(public router: Router) {}

  /*handleError(error: HttpErrorResponse): Observable<boolean> {
    if (error.status === UNAUTHORIZED) {
      this.router.navigateByUrl('/login');
    } else if (error.status === 0) {
      console.error(
        'error occured when performing HTTP request: ',
        error.message
      );
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    return throwError();
  }*/
}
