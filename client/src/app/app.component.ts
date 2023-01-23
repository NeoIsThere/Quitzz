import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IconsMetaData } from './meta-data';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InternalCommunicationsService } from './services/internal-communications/internal-communications.service';
import { SeoService } from './services/seo/seo.service';
import { beautify } from './services/utils/utils';
import { ColorService } from './services/color/color.service';
import {
  CHRISTMAS_LOGO_PATH,
  CURRENT_THEME,
  LOGO_PATH,
  SPECIAL_THEME,
} from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog,
    private internalCommunications: InternalCommunicationsService,
    private router: Router,
    private seo: SeoService,
    private activatedRoute: ActivatedRoute,
    private theme: ColorService
  ) {
    this.registerIcons();

    this.updatePageMeta();

    /*this.setUserPreferedTheme();*/

    this.setMessage2();
  }

  message2: string = 'YOU CAN EITHER KEEP SUFFERING OR DO SOMETHING ABOUT IT.';

  isMobileGameActive: boolean = false;
  toggleGameText: string = 'Play a game';

  ngOnInit(): void {}

  get currentTheme() {
    return this.theme.currentTheme == 'dark';
  }

  set currentTheme(value: boolean) {
    this.changeTheme(value);
  }

  setUserPreferedTheme() {
    const userPreference = localStorage.getItem('theme');
    if (userPreference == 'dark') {
      this.theme.setTheme('dark');
      return;
    }
    this.theme.setTheme('light');
  }

  changeTheme(isDarkMode: boolean) {
    if (isDarkMode) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
    this.setUserPreferedTheme();
  }

  updatePageMeta() {
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      if (route.outlet === 'primary') {
        route.data.subscribe((data) => {
          const url = event.urlAfterRedirects.split('/');
          if (url[1] == 'articles' && url.length == 4) {
            const title = beautify(url[2]);
            this.seo.updateTitle(title);
            this.seo.updateDescription(data['description']);
            return;
          }

          this.seo.updateTitle(data['title']);
          this.seo.updateDescription(data['description']);
        });
      }
    });
  }

  registerIcons() {
    for (const icon of IconsMetaData.iconFiles) {
      this.iconRegistry.addSvgIcon(
        icon.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    }
  }

  onLoggedOut() {}

  isActive(link: string) {
    return this.router.url === link;
  }

  navigateTo(relativeUrl: string) {
    this.router.navigateByUrl(relativeUrl);
  }

  setMessage2() {
    const randomBool = Math.random() > 0.5;
    if (randomBool) {
      this.message2 = 'YOU CAN EITHER KEEP SUFFERING OR DO SOMETHING ABOUT IT.';
      return;
    }
    this.message2 = 'BECAUSE OUR SEXUAL DRIVE IS NOT A PRODUCT.';
  }

  toggleGame() {
    this.isMobileGameActive = !this.isMobileGameActive;
    if (this.isMobileGameActive) {
      this.toggleGameText = 'Hide the game';
    } else {
      this.toggleGameText = 'Play a game';
    }
  }
  get currentCategory(): string {
    return this.isActive('/p-ranking') ? 'NP' : 'NF';
  }

  get isDarkModeAvailable(): boolean {
    return (
      !this.isActive('/privacy') &&
      !this.isActive('/attribution') &&
      !this.isActive('/emergency') &&
      !this.isActive('/chat')
    );
  }

  get isRankingPage(): boolean {
    return this.isActive('/p-ranking') || this.isActive('/pmo-ranking');
  }

  get isEmergencyPage(): boolean {
    return this.isActive('/emergency');
  }

  get logoSrc(): string {
    const specialTheme: number = CURRENT_THEME;

    switch (specialTheme) {
      case SPECIAL_THEME.CHRISTMAS:
        return CHRISTMAS_LOGO_PATH;
      case SPECIAL_THEME.HALLOWEEN:
        return LOGO_PATH;
      default:
        return LOGO_PATH;
    }
  }
}

/*
@Component({
  selector: 'dialog-content-login',
  templateUrl: './components/dialogs/dialog-content-login.html',
})
export class DialogContentLogin {
  constructor(
    @Inject(MAT_DIALOG_DATA) public onSuccess: () => void | null,
    private dialogRef: MatDialogRef<DialogContentLogin>,
    private userData: UserDataService
  ) {}

  onConnected() {
    this.dialogRef.close();
    this.userData.fetchUsername();
    this.userData.fetchCounts(); //after logged in, the page does not refresh but we want the data to be refreshed, so we need
    //to fetch it
    if (this.onSuccess) {
      this.onSuccess();
    }
  }
}
*/
