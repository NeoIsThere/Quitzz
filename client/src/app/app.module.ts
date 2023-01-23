import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginFormComponent } from './components/login-page/login-form/login-form.component';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TipsComponent } from './components/tips/tips.component';
import { AboutComponent } from './components/about/about.component';
import { AccountComponent } from './components/account/account.component';
import { DialogContenUpdatePassword } from './components/update-password/update-password.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RandomMotivationComponent } from './components/random-motivation/random-motivation.component';
import { FaqComponent } from './components/faq/faq.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { PrivacyPolicyComponent } from './components/legal/privacy-policy/privacy-policy.component';
import { UsernameDisplayerComponent } from './components/username-displayer/username-displayer.component';
import { ArticleComponent } from './components/article/article.component';
import { HeaderArticleComponent } from './components/header-article/header-article.component';
import { UpdatePasswordComponent } from './components/update-password/update-password.component';
import { AttributionComponent } from './components/legal/attributions/attribution.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ArticleManagerComponent } from './components/article-manager/article-manager.component';
import { ResourcesComponent } from './components/resources/resources.component';
import { GameComponent } from './components/game/game.component';
import { PublicProfileComponent } from './components/public-profile/public-profile.component';
import { EmergencyComponent } from './components/emergency/emergency.component';
import { DonateButtonComponent } from './components/donate-button/donate-button.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { CircleProgressComponent } from './components/circle-progress/circle-progress.component';
import { BarProgressComponent } from './components/bar-progress/bar-progress.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { HomeComponent } from './components/home/home.component';
import { AnnouncementComponent } from './components/announcement/announcement.component';
import { DonorsListComponent } from './components/donors-list/donors-list.component';
import { NeonTextComponent } from './components/neon-text/neon-text.component';
import { AccountabilityComponent } from './components/accountability/accountability.component';
import { FriendsComponent } from './components/friends/friends.component';
import { InboxComponent } from './components/inbox/inbox.component';
import { MessageComponent } from './components/message/message.component';
import { InboxDialogComponent } from './components/inbox/inbox.component';
import { MatBadgeModule } from '@angular/material/badge';
import { GoalPrimitiveComponent } from './components/goal-primitive/goal-primitive.component';
import { StatsComponent } from './components/stats/stats.component';
import { FriendsDialogComponent } from './components/friends/friends-dialog.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { SimpleDialogComponent } from './components/simple-dialog/simple-dialog.component';

const routes: Routes = [
  {
    path: 'p-ranking',
    component: HomeComponent,
    data: {
      title: 'Ranking',
      description: "Regain your power. Let's break those chains.",
    },
  },
  {
    path: 'pmo-ranking',
    component: HomeComponent,
    data: {
      title: 'Ranking',
      description: "Regain your power. Let's break those chains.",
    },
  },
  {
    path: 'articles',
    component: TipsComponent,
    data: {
      title: 'Articles',
      description:
        'Articles written by the community in which we share tips, advice and our thoughts regarding our journey.',
    },
  },

  {
    path: 'faq',
    component: FaqComponent,
    data: {
      title: 'FAQ',
      description: 'Answers to most of your questions regarding Quitzz.',
    },
  },

  {
    path: 'resources',
    component: ResourcesComponent,
    data: {
      title: 'Resources',
      description: 'Useful resources and other tools that can be very helpful.',
    },
  },

  {
    path: 'about',
    component: AboutComponent,
    data: {
      title: 'About us',
      description: 'Who we are and the reasons we started this project.',
    },
  },

  {
    path: 'attribution',
    component: AttributionComponent,
    data: {
      title: 'Attribution',
      description: 'Attribution.',
    },
  },

  {
    path: 'account',
    component: AccountComponent,
    data: {
      title: 'Account',
      description: 'Information regarding your Quitzz account.',
    },
  },

  {
    path: 'articles/:name/:id',
    component: ArticleComponent,
  },

  {
    path: 'privacy',
    component: PrivacyPolicyComponent,
    data: {
      title: 'Privacy',
      description:
        'Information regarding Quitzz and the privacy of Quitzz users.',
    },
  },

  {
    path: 'reset-password/username/:username/token/:token',
    component: UpdatePasswordComponent,
  },

  {
    path: 'profile/:username',
    component: PublicProfileComponent,
  },

  {
    path: 'emergency',
    component: EmergencyComponent,
  },

  /* {
    path: 'chat',
    component: ChatboxComponent,
  },
*/
  {
    path: '**',
    redirectTo: '/p-ranking',
  },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    TipsComponent,
    AboutComponent,
    AccountComponent,
    DialogContenUpdatePassword,
    RandomMotivationComponent,
    FaqComponent,
    PrivacyPolicyComponent,
    UsernameDisplayerComponent,
    ArticleComponent,
    HeaderArticleComponent,
    UpdatePasswordComponent,
    AttributionComponent,
    ArticleManagerComponent,
    ResourcesComponent,
    GameComponent,
    PublicProfileComponent,
    EmergencyComponent,
    DonateButtonComponent,
    ChatboxComponent,
    ComingSoonComponent,
    CircleProgressComponent,
    BarProgressComponent,
    RankingComponent,
    HomeComponent,
    AnnouncementComponent,
    DonorsListComponent,
    NeonTextComponent,
    AccountabilityComponent,
    FriendsComponent,
    FriendsDialogComponent,
    InboxComponent,
    MessageComponent,
    InboxDialogComponent,
    GoalPrimitiveComponent,
    StatsComponent,
    FeedbackComponent,
    SimpleDialogComponent,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    MatTooltipModule,
    MatSelectModule,
    DragDropModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatBadgeModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
