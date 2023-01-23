import { HttpStatusCode } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';
import { MAX_STREAK, TIME_ZONES } from 'src/app/constants';
import { InternalCommunicationsService } from 'src/app/services/internal-communications/internal-communications.service';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import {
  convertUTCToLocal,
  includesProfanity,
  openLoginDialog,
  UTCToLocalConversionMode,
} from 'src/app/services/utils/utils';
import { LabelValue, AccountData } from '../../interfaces/interface';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private httpClient: HttpClientService,
    private snackBar: SnackbarService,
    private userData: UserDataService,
    private internalCommunications: InternalCommunicationsService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {}

  timeZones: LabelValue[] = TIME_ZONES;
  currentTimeZone: string;
  selectedTimeZone: string;
  isEditEmail: boolean = false;
  isEditMotto: boolean = false;

  isEditNPStreak: boolean = false;
  isEditNFStreak: boolean = false;

  NPRecord: number;
  NFRecord: number;

  NPStreak: number;
  NFStreak: number;

  username: string;
  email: string;
  motto: string;
  joinedSince: string;

  isReady: boolean = false;
  areButtonsDisabled: boolean = false;

  userCountsSubscribtion: Subscription;

  onSuccess: () => void = () => {
    this.refresh;
  }; //lambda so this is conserved

  mottoForm: FormGroup = new FormGroup({
    motto: new FormControl('', [
      Validators.required,
      Validators.maxLength(500),
    ]),
  });

  emailForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  NPStreakForm: FormGroup = new FormGroup({
    NPStreak: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]*$/),
      Validators.min(0),
      Validators.max(MAX_STREAK),
    ]),
  });

  NFStreakForm: FormGroup = new FormGroup({
    NFStreak: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]*$/),
      Validators.min(0),
      Validators.max(MAX_STREAK),
    ]),
  });

  @ViewChild('emailEditor') emailEditor: ElementRef;
  @ViewChild('mottoEditor') mottoEditor: ElementRef;
  @ViewChild('NPStreakEditor') NPStreakEditor: ElementRef;
  @ViewChild('NFStreakEditor') NFStreakEditor: ElementRef;

  ngOnInit(): void {
    this.subscribeToUserCounts();
    this.userData.fetchCounts();
    this.refresh();
  }

  subscribeToUserCounts() {
    this.userCountsSubscribtion = this.userData.userCount.subscribe((value) => {
      if (value) {
        this.NFRecord = value?.NFrecordCount;
        this.NPRecord = value?.NPrecordCount;
        this.NPStreak = value?.NPcount;
        this.NFStreak = value?.NFcount;
        this.NPStreakForm.controls.NPStreak.setValue(value?.NPcount);
        this.NFStreakForm.controls.NFStreak.setValue(value?.NFcount);
      }
    });
  }

  refresh() {
    this.isReady = false;

    const onSuccess = () => {
      this.refresh();
    };

    this.httpClient.get('/account').subscribe(
      (accountData: AccountData) => {
        this.username = accountData.username;
        this.motto = accountData.motto;
        this.mottoForm.controls.motto.setValue(this.motto);
        this.email = accountData.email;
        this.emailForm.controls.email.setValue(this.email);
        this.NFRecord = accountData.NFrecordCount;
        this.NPRecord = accountData.NPrecordCount;
        this.currentTimeZone = accountData.timeZone;
        this.joinedSince = convertUTCToLocal(
          accountData.joinedSince,
          UTCToLocalConversionMode.dayOnly
        );
        const index = this.timeZones.findIndex(
          (timeZone) => timeZone.value === this.currentTimeZone
        );
        if (index < 0) {
          this.timeZones.unshift({
            label: this.currentTimeZone,
            value: this.currentTimeZone,
          });
        }
        this.selectedTimeZone = this.currentTimeZone;
        this.isReady = true;
      },
      (err) => {
        if (err == HttpStatusCode.Unauthorized) {
          openLoginDialog(this.dialog, { onLoginSuccess: onSuccess });
        }
      }
    );
  }

  formatFromUtc(utc: string) {
    return utc.substring(0, utc.indexOf('T'));
  }

  currentTime(timeZone: string) {
    if (timeZone) {
      return moment().tz(timeZone).format('hh:mm A');
    }
    return undefined;
  }

  onEditMotto() {
    this.isEditMotto = true;
    this.mottoEditor.nativeElement.focus();
  }

  onCancelEditMotto() {
    this.mottoForm.controls.motto.setValue(this.motto);
    this.isEditMotto = false;
  }

  onSaveMotto() {
    const mottoValue = this.mottoForm.value;
    if (mottoValue.motto == this.motto) {
      this.isEditMotto = false;
      return;
    }

    this.areButtonsDisabled = true;

    if (includesProfanity(mottoValue.motto)) {
      this.mottoForm.reset();
      this.snackbar.openSnackBar('Some words are restricted.', true);
      this.isEditMotto = false;
      return;
    }
    this.httpClient.patch('/account/motto', mottoValue).subscribe(
      () => {
        this.snackBar.openSnackBar('Motto updated.');
        this.isEditMotto = false;
        this.areButtonsDisabled = false;
      },
      (err) => {
        this.areButtonsDisabled = false;


        if (err == HttpStatusCode.Unauthorized) {
          openLoginDialog(this.dialog, { onLoginSuccess: this.onSuccess });
        }
        if (err == HttpStatusCode.TooManyRequests) {
          this.snackBar.openSnackBar(
            'Please wait before updating your motto again.',true
          );
        }
      }
    );
  }

  onEditEmail() {
    this.isEditEmail = true;
    this.emailEditor.nativeElement.focus();
  }

  onCancelEditEmail() {
    this.emailForm.controls.email.setValue(this.email);
    this.isEditEmail = false;
  }

  onSaveEmail() {
    const email = this.emailForm.value;
    if (email.email == this.email) {
      this.isEditEmail = false;
      return;
    }
    this.areButtonsDisabled = true;

    this.httpClient.patch('/account/email', email).subscribe(
      () => {
        this.snackBar.openSnackBar('Email updated.');
        this.isEditEmail = false;
        this.areButtonsDisabled = false;
      },
      (err) => {
        this.areButtonsDisabled = false;


        if (err == HttpStatusCode.Unauthorized) {
          openLoginDialog(this.dialog, { onLoginSuccess: this.onSuccess });
        }
        if (err == HttpStatusCode.TooManyRequests) {
          this.snackBar.openSnackBar(
            'Please wait before updating your email again.',true
          );
        }
      }
    );
  }

  onEditNPStreak() {
    this.isEditNPStreak = true;
    this.NPStreakEditor.nativeElement.focus();
    this.userData.fetchCounts();
  }

  onCancelEditNPStreak() {
    this.NPStreakForm.controls.NPStreak.setValue(this.NPStreak);
    this.isEditNPStreak = false;
  }

  onSaveNPStreak() {
    const NPStreak = this.NPStreakForm.value;
    if (NPStreak.NPStreak == this.NPStreak) {
      this.isEditNPStreak = false;
      return;
    }
    this.areButtonsDisabled = true;

    this.httpClient
      .patch('/account/streak/NP', { newValue: NPStreak.NPStreak })
      .subscribe(
        () => {
          this.snackBar.openSnackBar('PornFree streak updated.');
          this.isEditNPStreak = false;
          this.areButtonsDisabled = false;
          this.userData.fetchCounts();
        },
        (err) => {
          this.areButtonsDisabled = false;


          if (err == HttpStatusCode.Unauthorized) {
            openLoginDialog(this.dialog, { onLoginSuccess: this.onSuccess });
          }
          if (err == HttpStatusCode.TooManyRequests) {
            this.snackBar.openSnackBar(
              'Please wait before updating your PornFree streak again.',true
            );
          }
        }
      );
  }

  onEditNFStreak() {
    this.isEditNFStreak = true;
    this.NFStreakEditor.nativeElement.focus();
  }

  onCancelEditNFStreak() {
    this.NFStreakForm.controls.NFStreak.setValue(this.NFStreak);
    this.isEditNFStreak = false;
  }

  onSaveNFStreak() {
    const NFStreak = this.NFStreakForm.value;
    if (NFStreak.NFStreak == this.NFStreak) {
      this.isEditNFStreak = false;
      return;
    }
    this.areButtonsDisabled = true;
    this.httpClient
      .patch('/account/streak/NF', { newValue: NFStreak.NFStreak })
      .subscribe(
        () => {
          this.snackBar.openSnackBar('FullPMO streak updated.');
          this.isEditNFStreak = false;
          this.areButtonsDisabled = false;

          this.userData.fetchCounts();
        },
        (err) => {
          this.areButtonsDisabled = false;


          if (err == HttpStatusCode.Unauthorized) {
            openLoginDialog(this.dialog, { onLoginSuccess: this.onSuccess });
          }
          if (err == HttpStatusCode.TooManyRequests) {
            this.snackBar.openSnackBar(
              'Please wait before updating your PMO streak again.',true
            );
          }
        }
      );
  }

  onSelectTimeZone() {
    this.httpClient
      .patch('/account/timezone', { timeZone: this.selectedTimeZone })
      .subscribe(
        () => {
          this.snackBar.openSnackBar('Time zone changed successfully.');
        },
        (err) => {
          if (err == HttpStatusCode.Unauthorized) {
            openLoginDialog(this.dialog, { onLoginSuccess: this.onSuccess });
          }
        }
      );
  }

  onLogout() {
    this.areButtonsDisabled = true;
    this.httpClient.post('/sign-out', {}).subscribe(
      () => {
        this.userData.fetchUsername();
        this.router.navigateByUrl('');
      },
      (err) => {
        this.areButtonsDisabled = false;
      }
    );
  }

  navigateTo(relativeUrl: string) {
    this.router.navigateByUrl(relativeUrl);
  }

  get isAdminConnected() {
    return this.username == 'Neo';
  }

  get emailStyle() {
    if (!this.isEditEmail) {
      return { 'pointer-events': 'none' };
    }
    return {};
  }

  get NPStreakStyle() {
    if (!this.isEditNPStreak) {
      return { 'pointer-events': 'none' };
    }
    return {};
  }

  get NFStreakStyle() {
    if (!this.isEditNFStreak) {
      return { 'pointer-events': 'none' };
    }
    return {};
  }

  ngOnDestroy(): void {
    this.userCountsSubscribtion.unsubscribe();
  }
}
