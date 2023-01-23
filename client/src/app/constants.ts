import { HttpHeaders } from '@angular/common/http';
import { Rank } from './interfaces/interface';

export const DEV_BACKEND = 'http://localhost:8080';
export const PROD_BACKEND = 'https://api.quitzz.com';

export const ARTICLES_URL =
  'https://gitlab.com/quitzz-group/quitzz/-/tree/main/article-contents/';

export const HTTP_CONTENT_TYPE_JSON = new HttpHeaders({
  'Content-Type': 'application/json',
});

export const HTTP_CONTENT_TYPE_MULTIPART_FORM_DATA = new HttpHeaders({
  'Content-Type': 'multipart/form-data',
});

export const enum SPECIAL_THEME {
  NONE,
  CHRISTMAS,
  HALLOWEEN,
}

export const MOBILE_MAX_WIDTH = 400;

export const TABLET_MAX_WIDTH = 1200;

export const CURRENT_THEME = SPECIAL_THEME.NONE;

export const MAX_STREAK = 4000;

export const MAX_CHAT_MSG_LENGTH = 1000;

export const MAX_GOALS = 10;

export const MAX_PEOPLE_IN_GOAL = 50;

export const MAX_FRIENDS = 100;

export const MAX_CONVERSATIONS = 50;

export const MAX_PEOPLE_IN_CONVERSATION = 50;

export const REFRESH_PERIOD_MS = 1000* 120;

export const HTTP_WITH_CREDENTIAL_OPTION = {
  withCredentials: true,
};

export const LOGO_PATH = './assets/images/logo.png';
export const CHRISTMAS_LOGO_PATH = './assets/images/logo_christmas.png';

export const CHRISTMAS_CONTAINER_DECO_1 =
  './assets/images/christmas_container_deco_1.png';
export const CHRISTMAS_CONTAINER_DECO_2 =
  './assets/images/christmas_container_deco_2.png';
export const CHRISTMAS_CONTAINER_DECO_3 =
  './assets/images/christmas_container_deco_3.png';

export const TEXT_RESPONSE_TYPE = {
  /*To tell the parser so there is no error because it tries to parse JSON*/
  /* The response type is text whenever the server returns HTML files or only status codes without body.*/
  responseType: 'text',
};

export const TAG_COLORS = [
  { label: 'Motivation', color: '#7f0991' },
  { label: 'Advice', color: '#0f6dbf' },
  { label: 'Useful', color: '#25a306' },
  { label: 'Informational', color: '#c73653' },
];

export const RANKING: Rank[] = [
  { min: 0, label: 'Newbie' },
  { min: 2, label: 'Neophyte' },
  { min: 4, label: 'Trainee' },
  { min: 6, label: 'Initiate' },
  { min: 8, label: 'Learner' },
  { min: 10, label: 'Novice' },
  { min: 12, label: 'Apprentice' },
  { min: 14, label: 'Journeyman' },
  { min: 16, label: 'Student' },
  { min: 20, label: 'Adventurer' },
  { min: 25, label: 'Aspirant' },
  { min: 30, label: 'Soldier' },
  { min: 35, label: 'Warrior' },
  { min: 40, label: 'Knight' },
  { min: 45, label: 'Paladin' },
  { min: 50, label: 'Conqueror' },
  { min: 55, label: 'Achiever' },
  { min: 60, label: 'Specialist' },
  { min: 65, label: 'Adviser' },
  { min: 75, label: 'Professional' },
  { min: 100, label: 'Expert' },
  { min: 150, label: 'Guru' },
  { min: 200, label: 'Mentor' },
  { min: 250, label: 'Master' },
  { min: 300, label: 'Grand Master' },
  { min: 350, label: 'Prince' },
  { min: 400, label: 'King' },
  { min: 500, label: 'Champion' },
  { min: 750, label: 'Quitzzer' },
  { min: 1000, label: 'Legend' },
  { min: Number.MAX_SAFE_INTEGER, label: '*' },
];

/*Remember time zones offsets are purposely inverted because of: https://www.pixelbeat.org/docs/linux_timezones/ */
export const TIME_ZONES = [
  { label: '(GMT-12)', value: 'Etc/GMT+12' },
  { label: '(GMT-11) Samoa', value: 'Etc/GMT+11' },
  { label: '(GMT-10) Hawaii', value: 'Etc/GMT+10' },
  { label: '(GMT-9) Alaska', value: 'Etc/GMT+9' },
  { label: '(GMT-8) Pacific Time', value: 'Etc/GMT+8' },
  { label: '(GMT-7) Mountain Time', value: 'Etc/GMT+7' },
  { label: '(GMT-6) Central Time', value: 'Etc/GMT+6' },
  { label: '(GMT-5) Eastern Time', value: 'Etc/GMT+5' },
  { label: '(GMT-4) Atlantic Time', value: 'Etc/GMT+4' },
  { label: '(GMT-3) Brasilia', value: 'Etc/GMT+3' },
  { label: '(GMT-2) Mid-Atlantic', value: 'Etc/GMT+2' },
  { label: '(GMT-1) Cape Verde Islands', value: 'Etc/GMT+1' },
  { label: '(GMT) London', value: 'Etc/GMT' },
  {
    label: '(GMT+1) Paris',
    value: 'Etc/GMT-1',
  },
  { label: '(GMT+2) Athens ', value: 'Etc/GMT-2' },
  { label: '(GMT+3) Moscow', value: 'Etc/GMT-3' },
  { label: '(GMT+4) Abu Dhabi', value: 'Etc/GMT-4' },
  { label: '(GMT+5) Karachi', value: 'Etc/GMT-5' },
  { label: '(GMT+6)Novosibirsk', value: 'Etc/GMT-6' },
  { label: '(GMT+7) Bangkok', value: 'Etc/GMT-7' },
  { label: '(GMT+8) Perth', value: 'Etc/GMT-8' },
  { label: '(GMT+9) Tokyo', value: 'Etc/GMT-9' },
  { label: '(GMT+10)  Sydney ', value: 'Etc/GMT-10' },
  {
    label: '(GMT+11) New Caledonia',
    value: 'Etc/GMT-11',
  },
  {
    label: '(GMT+12) Wellington',
    value: 'Etc/GMT-12',
  },
];

export const PROFANITIES = [
  'niga',
  'neger',
  'negre',
  'nigra',
  'negro',
  'nazi',
  'jewish',
  'muslim',
  'allah',
  'islam',
  'cock',
  'sex',
  'vagina',
  'hitler',
  'adolf',
  'admin',
  'milf',
  'chink',
  'fuck',
  'reich',
  'führer',
  'fuhrer',
];
