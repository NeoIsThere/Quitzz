import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { LoginFormComponent } from 'src/app/components/login-page/login-form/login-form.component';
import * as Constants from 'src/app/constants';
import { openDialog } from '../../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  private API_BASE_URL = Constants.DEV_BACKEND;
  constructor(private httpClient: HttpClient, private dialog: MatDialog) {
    if (!isDevMode()) {
      this.API_BASE_URL = Constants.PROD_BACKEND;
    }
  }

  public uploadFile(
    relativeUrl: string,
    fieldName: string,
    file: File,
    isResponseTypeText: boolean = true
  ) {
    let options = {
      ...Constants.HTTP_WITH_CREDENTIAL_OPTION,
      ...Constants.HTTP_CONTENT_TYPE_MULTIPART_FORM_DATA,
    };

    if (isResponseTypeText) {
      options = {
        ...options,
        ...Constants.TEXT_RESPONSE_TYPE,
      };
    }
    const formData: FormData = new FormData();

    formData.append(fieldName, file, file.name);

    return this.httpClient
      .post<any>(this.API_BASE_URL + relativeUrl, formData, options)
      .pipe(
        catchError((err) => {
          //passing the function directly (i.e., handleError) prevents from being able to use this therefore this.router is undefined
          return this.handleError(err);
        })
      );
  }

  public sendNotifToEveryone(content: string){
    return this.post("/conversations/global-notif", {content}, true);
  }

  public post(
    relativeUrl: string,
    body: any,
    isResponseTypeText: boolean = true
  ) {
    let options = {
      ...Constants.HTTP_WITH_CREDENTIAL_OPTION,
      ...Constants.HTTP_CONTENT_TYPE_JSON,
    };

    if (isResponseTypeText) {
      options = {
        ...options,
        ...Constants.TEXT_RESPONSE_TYPE,
      };
    }
    return this.httpClient
      .post<any>(this.API_BASE_URL + relativeUrl, body, options)
      .pipe(
        catchError((err) => {
          //passing the function directly (i.e., handleError) prevents from being able to use this therefore this.router is undefined
          return this.handleError(err);
        })
      );
  }

  public put(
    relativeUrl: string,
    body: any,
    isResponseTypeText: boolean = true
  ) {
    let options = {
      ...Constants.HTTP_WITH_CREDENTIAL_OPTION,
      ...Constants.HTTP_CONTENT_TYPE_JSON,
    };

    if (isResponseTypeText) {
      options = {
        ...options,
        ...Constants.TEXT_RESPONSE_TYPE,
      };
    }
    return this.httpClient
      .put<any>(this.API_BASE_URL + relativeUrl, body, options)
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  public patch(
    relativeUrl: string,
    body: any,
    isResponseTypeText: boolean = true
  ) {
    let options = {
      ...Constants.HTTP_WITH_CREDENTIAL_OPTION,
      ...Constants.HTTP_CONTENT_TYPE_JSON,
    };

    if (isResponseTypeText) {
      options = {
        ...options,
        ...Constants.TEXT_RESPONSE_TYPE,
      };
    }
    return this.httpClient
      .patch<any>(this.API_BASE_URL + relativeUrl, body, options)
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  public getAbsoluteURL(
    absoluteURL: string,
    isResponseTypeText: boolean = false /*when fetching a page (HTML file)*/
  ) {
    let options = {};

    if (isResponseTypeText) {
      options = {
        ...options,
        ...Constants.TEXT_RESPONSE_TYPE,
      };
    }

    return this.httpClient.get<any>(absoluteURL, options).pipe(
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  public get(
    relativeUrl: string,
    isResponseTypeText: boolean = false /*when fetching a page (HTML file)*/
  ) {
    let options = {
      ...Constants.HTTP_WITH_CREDENTIAL_OPTION,
    };

    if (isResponseTypeText) {
      options = {
        ...options,
        ...Constants.TEXT_RESPONSE_TYPE,
      };
    }

    return this.httpClient
      .get<any>(this.API_BASE_URL + relativeUrl, options)
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  public delete(
    relativeUrl: string,
    isResponseTypeText: boolean = true
  ) {
    let options = {
      ...Constants.HTTP_WITH_CREDENTIAL_OPTION,
      ...Constants.HTTP_CONTENT_TYPE_JSON,
    };

    if (isResponseTypeText) {
      options = {
        ...options,
        ...Constants.TEXT_RESPONSE_TYPE,
      };
    }
    return this.httpClient
      .delete<any>(this.API_BASE_URL + relativeUrl, options)
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  handleError(httpError: HttpErrorResponse) {
    const customMessage = httpError.error.message; //message set in server (ex. res.status(STATUS_CODES.UNAUTHORIZED).send({ message: "xxxxx" });)
    console.error(httpError.message);

    if (httpError.status === 0) {
      console.error('Error in client when performing the request.');
    } else {
      console.error(httpError.message);
    }
    return throwError(httpError.status);
  }
}
