import { Router } from '@angular/router';
import { PROFANITIES, TABLET_MAX_WIDTH } from 'src/app/constants';
import * as moment from 'moment-timezone';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/compiler/src/core';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClientService } from '../server-communication/http-client/http-client.service';
import { resolve } from 'dns';
import { rejects } from 'assert';
import { LoginFormComponent } from 'src/app/components/login-page/login-form/login-form.component';
import { LoginDialogData } from 'src/app/interfaces/interface';

export function uglify(str: string) {
  return str
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, '_')
    .replace(/\W+/g, '');
}

export function beautify(str: string) {
  const str1 = uglify(str);
  const str2 = str1.charAt(0).toUpperCase() + str1.slice(1);
  return str2.replace(/_+/g, ' ').replace(/\W/g, ' ');
}

export function includesProfanity(input: string) {
  const lowercase = input.toLowerCase();
  const withoutUnderscore = lowercase.replace(/_/g, '');
  const withoutRepetition = withoutUnderscore.replace(/(.)\1+/g, '$1');

  if (PROFANITIES.some((profanity) => withoutRepetition.includes(profanity))) {
    return true;
  }
  return false;
}

export enum UTCToLocalConversionMode {
  onlyTimeOrOnlyDay,
  dayOnly,
  timeAndDay,
}

export function convertUTCToLocal(
  utcDate: string,
  mode: UTCToLocalConversionMode
) {
  const date = moment(utcDate);
  const isSameDay = moment().diff(date, 'days') == 0;
  const isSameYear = moment().diff(date, 'years') == 0;

  let localTimeOnly = date.format('LT');
  let localDayOnly = date.format('MMM Do');
  let localDayWithYearOnly = date.format('MMM Do YY');

  let fullDate = localDayOnly + ' ' + localTimeOnly;

  switch (mode) {
    case UTCToLocalConversionMode.onlyTimeOrOnlyDay:
      if (isSameDay) {
        return localTimeOnly;
      }
      if (isSameYear) {
        return localDayOnly;
      }
      return localDayWithYearOnly;
    case UTCToLocalConversionMode.dayOnly:
      if (isSameYear) {
        return localDayOnly;
      }
      return localDayWithYearOnly;
    case UTCToLocalConversionMode.timeAndDay:
      return fullDate;
  }
}

export function isOverflown(element: any) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

export function navigateTo(router: Router, relativeUrl?: string) {
  relativeUrl = relativeUrl ? relativeUrl : '/';
  router.navigateByUrl(relativeUrl);
}

export function isWidthLowerThan(widthUpperLimit: number) {
  return window.innerWidth < widthUpperLimit;
}

export function openDialog<T>(
  dialog: MatDialog,
  dialogComponent: ComponentType<T>,
  dialogData?: any
): MatDialogRef<T> {
  let width = '50vw';

  if (isWidthLowerThan(TABLET_MAX_WIDTH)) {
    width = '95vw';
  }
  return dialog.open(dialogComponent, {
    width: width,
    maxWidth: width,
    height: '90vh',
    maxHeight: '90vh',
    panelClass: 'custom-dialog-container',
    disableClose: true,
    data: dialogData,
  });
}

export function openLoginDialog(dialog: MatDialog, data: LoginDialogData) {
  let width = '30vw';

  if (isWidthLowerThan(TABLET_MAX_WIDTH)) {
    width = '95vw';
  }
  dialog.open(LoginFormComponent, {
    width: width,
    maxWidth: width,
    height: '80vh',
    maxHeight: '80vh',
    panelClass: 'custom-dialog-container',
    disableClose: true,
    data,
  });
}
