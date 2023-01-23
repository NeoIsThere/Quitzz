export interface RankingData {
  users: User[];
  maxPageIndex: number;
  page: number;
  nTotalActiveUsers: number;
  nTotalUsers: number;
}

export interface SearchByUserResult {
  users: User[];
  maxPageIndex: number;
  page: number;
}

export interface Donor {
  username: string;
}

export interface RankingPosition {
  position: number;
}

export interface Statistics {
  average: number;
  median: number;
}

export interface User {
  username: string;
  count: number;
  country: string;
  me: boolean;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface IconFile {
  name: string;
  path: string;
}

export interface DaysToCommit {
  nDays: number;
}

export interface SignUpCredentials {
  username: string;
  password: string;
  email: string;
  timeZone: string;
  currentStreakNF: string;
  currentStreakNP: string;
}

export interface ResetPasswordTokenData {
  username: string;
  token: string;
}

export interface AccountData {
  username: string;
  email: string;
  joinedSince: string;
  timeZone: string;
  motto: string;
  NFrecordCount: number;
  NPrecordCount: number;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface MotivationMessage {
  message: string;
  author: string;
}

export interface UserCount {
  NFcount: number;
  NPcount: number;
  NFrecordCount: number;
  NPrecordCount: number;
  NFrank: RankData;
  NPrank: RankData;
  NFobjective: number;
  NPobjective: number;
  NFobjProgress: number;
  NPobjProgress: number;
  NFstreakAverage: number;
  NPstreakAverage: number;
}

export interface RankData {
  currentRank: string;
  nextRank: string;
  completion: number;
  nDaysTillNext: number;
}

export interface Rank {
  min: number;
  label: string;
}

export interface Username {
  username: string;
}

export interface ArticlesData {
  metadatas: ArticleMetadata[];
  maxPageIndex: number;
}

export interface ArticleMetadata {
  id: string;
  author: string;
  imageCreditAuthor: string;
  imageCreditLink: string;
  name: string;
  summary: string;
  tag: string;
  linkToArticle: string;
  linkToImage: string;
  fileName: string;
  nViews: number;
}

export interface Partner {
  name: string;
  description: string;
  imagePath: string;
  link: string;
}

export interface Message {
  id: string;
  content: string;
  author: string;
  date: string;
  isMe?: boolean;
}

export interface Conversation {
  id: string;
  isUnread: boolean;
  members: string[];
  messages: Message[];
}

export interface Friend {
  username: string;
  NFlastCommitDate: string;
  NPlastCommitDate: string;
  NFcount: number;
  NPcount: number;
  isSelected?: boolean;
}

export interface FriendDialogData {
  mode: FRIENDS_DIALOG_MODE;
  selectionLimit: number;
  conversationId?: string;
}

export enum FRIENDS_DIALOG_MODE {
  DEFAULT,
  REQUESTS,
  SELECTOR,
}

export interface Goal {
  id: string;
  creator: string,
  isMine: boolean,
  objective: number;
  category: string;
  endDate: string;
  relapser: string;
  status: string;
  progress: { username: string; count: number }[];
}

export interface LoginDialogData {
  onLoginSuccess: () => void;
  onCloseWithoutLogin?: () => void;
}
