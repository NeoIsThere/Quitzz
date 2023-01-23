const rateLimit = require("express-rate-limit");

//Set to 10 for tests
let MULTIPLIER = 1;///////////////////

//Time in ms
const SEC_MS = 1000;
const MIN_MS = SEC_MS * 60;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;

//Password reset tokens
const PASSWORD_RESET_TOKEN_MINS = 1 * DAY_MS;

//------RATE LIMITING------

//Rate limiter
const MAX_STARTING_STREAK = 4000;
const MAX_PAYLOAD_SIZE = "10mb";

//Socket rate limiter
const SOCKET_MAX_MSG_SIZE = 1e5;

const GLOBAL_RATE_LIMITER_DURATION = SEC_MS;
const GLOBAL_RATE_LIMITER_REQ_LIMIT = 1000 * MULTIPLIER; //1

const GLOBAL_RATE_LIMITER = rateLimit({
  windowMs: GLOBAL_RATE_LIMITER_DURATION, // x mins
  max: GLOBAL_RATE_LIMITER_REQ_LIMIT, // Limit each IP to y requests per `window` (here, per x minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
});

const PER_ENDPOINT_RATE_LIMITER_DURATION = 1 * SEC_MS; //1
const PER_ENDPOINT_RATE_LIMITER_REQ_LIMIT = 10 * MULTIPLIER; //10

const RATE_LIMITER_SIGN_UP_WINDOW_DURATION = 10 * MIN_MS; //10
const RATE_LIMITER_SIGN_UP_N_REQUEST = 20 * MULTIPLIER; //20

const RATE_LIMITER_SIGN_UP_SHORT_WINDOW_DURATION = 10 * SEC_MS; //10
const RATE_LIMITER_SIGN_UP_SHORT_N_REQUEST = 1 * MULTIPLIER; //1

const RATE_LIMITER_SIGN_IN_WINDOW_DURATION = 10 * MIN_MS; //10
const RATE_LIMITER_SIGN_IN_N_REQUEST = 20 * MULTIPLIER; //20

const RATE_LIMITER_MOTIVATION_WINDOW_DURATION = DAY_MS;
const RATE_LIMITER_MOTIVATION_N_REQUEST = 1 * MULTIPLIER; //1

const RATE_LIMITER_PASSWORD_RESET_WINDOW_DURATION = 1 * MIN_MS;
const RATE_LIMITER_PASSWORD_RESET_N_REQUEST = 1 * MULTIPLIER; //1

const RATE_LIMITER_FEEDBACK_WINDOW_DURATION = 30 * MIN_MS;
const RATE_LIMITER_FEEDBACK_N_REQUEST = 3 * MULTIPLIER; //3

//------END RATE LIMITING------

/*Friends*/
const MAX_FRIENDS_PER_PERSON = 100;

/*Conversations*/
const N_MSG_PER_BLOCK = 5;
const VALID_CHANNELS = ["C1", "C2", "C3"];
const MAX_MSG_LENGTH = 1000;
const MAX_CHANNEL_SIZE = 200;
const WRITE_TO_FILE_CYCLE_DURATION = SEC_MS;
const MAX_CONVERSATIONS_PER_PERSON = 50;
const MAX_PARTICIPANTS_CONVERSATION = 50;

/*Goals*/
const MAX_OBJECTIVE = 999;
const GOAL_STATUS = {
  ON_GOING: "ongoing",
  SUCCESS: "success",
  RELAPSE: "relapse",
  INVITATION: "invitation",
};
const MAX_PARTICIPANTS_GOAL = 50;
const MAX_GOALS_PER_PERSON = 10;

/*Statistics*/
const STATISTICS_REFRESH_CYCLE = 1 * HOUR_MS;

/*Session id*/
const SESSION_ID_EXPIRATION = 30 * DAY_MS;

/*Secret*/
const PRIVATE_KEY_COOKIE_SIGNATURE = process.env.PRIVATE_KEY_COOKIE_SIGNATURE;

/*User list*/
const TOP_RESULTS = 3;
const RESULTS_PER_PAGE = 20;
const MAX_DELTA_DAYS_TO_APPEAR_IN_RANKING = 10;

/*Articles*/
const ARTICLES_PER_PAGE = 7; //7

/*Gitlab*/
const GITLAB_PATH_ARTICLE_CONTENTS = "article-contents/";
const GITLAB_PATH_ARTICLE_IMAGES = "article-images/";
const GITLAB_PAGES_URL = "https://quitzz-group.gitlab.io/quitzz/";
const DEFAULT_VALUES = {
  TIME_ZONE: "US/Eastern",
};

/*Email*/
const ADMIN_EMAIL = "quitzzapp@yahoo.com";

//Modifying a frozen object does not produce error but modication has no effect
//Freezing does not affected nested objects
Object.freeze(DEFAULT_VALUES);

const CATEGORIES = ["NF", "NP"];

Object.freeze(CATEGORIES);

/*Status codes*/
const STATUS_CODES = {
  OK: 200,
  SUCCESS_NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TEAPOT: 418,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

Object.freeze(STATUS_CODES);

/*Custom errors*/
const CUSTOM_ERRORS = {
  usernameNotExist: 0,
  credentialsNotRespectRules: 1,
  credentialsNotMatch: 2,
  activePasswordResetTokenAlreadyExist: 3,
  passwordResetTokenExpired: 4,
  noPasswordResetTokenFound: 5,
  usernameAlreadyExist: 6,
  internalError: 7,
  invalidFormat: 8,
  profanity: 10,
  resetTokenNotMatch: 11,
  unrequestedFriendship: 12,
  reserved: 13,
  messageTooLong: 14,
  unmodifiableConversation: 15,
  tooManyFriends: 16,
  tooManyConversations: 17,
  tooManyParticipantInConversation: 18,
  tooManyGoals: 19,
  tooManyParticipantsInGoal: 20,
  conversationNotExist: 21,
  goalNotExist: 22,
  removingGoalOfSomeoneElse: 23,
};

Object.freeze(CUSTOM_ERRORS);

/*Profanities*/
const PROFANITIES = [
  "niga",
  "neger",
  "negre",
  "nigra",
  "negro",
  "nazi",
  "jewish",
  "muslim",
  "alah",
  "islam",
  "cock",
  "sex",
  "vagina",
  "hitler",
  "adolf",
  "admin",
  "milf",
  "chink",
  "fuck",
];

/* MISC */
const NO_DAYS_TO_COMMIT = 1;
const MOTTO_MAX_LENGTH = 500;
const FEEDBACK_MAX_LENGTH = 4000;

const RESERVED_USERNAMES = ["quitzz", "Quitzz"];

Object.freeze(PROFANITIES);

module.exports = {
  MULTIPLIER,
  DEFAULT_VALUES,
  PROFANITIES,
  TOP_RESULTS,
  RESULTS_PER_PAGE,
  STATUS_CODES,
  CUSTOM_ERRORS,
  PASSWORD_RESET_TOKEN_MINS,
  MAX_STARTING_STREAK,
  MAX_PAYLOAD_SIZE,
  RATE_LIMITER_SIGN_UP_N_REQUEST,
  RATE_LIMITER_SIGN_UP_WINDOW_DURATION,
  RATE_LIMITER_SIGN_UP_SHORT_N_REQUEST,
  RATE_LIMITER_SIGN_UP_SHORT_WINDOW_DURATION,
  RATE_LIMITER_SIGN_IN_N_REQUEST,
  RATE_LIMITER_SIGN_IN_WINDOW_DURATION,
  RATE_LIMITER_MOTIVATION_N_REQUEST,
  RATE_LIMITER_MOTIVATION_WINDOW_DURATION,
  SESSION_ID_EXPIRATION,
  ARTICLES_PER_PAGE,
  HOUR_MS,
  CATEGORIES,
  STATISTICS_REFRESH_CYCLE,
  PRIVATE_KEY_COOKIE_SIGNATURE,
  GITLAB_PATH_ARTICLE_CONTENTS,
  GITLAB_PATH_ARTICLE_IMAGES,
  GITLAB_PAGES_URL,
  ADMIN_EMAIL,
  SOCKET_MAX_MSG_SIZE,
  N_MSG_PER_BLOCK,
  VALID_CHANNELS,
  MAX_MSG_LENGTH,
  MAX_CHANNEL_SIZE,
  WRITE_TO_FILE_CYCLE_DURATION,
  MAX_OBJECTIVE,
  MAX_DELTA_DAYS_TO_APPEAR_IN_RANKING,
  GLOBAL_RATE_LIMITER,
  PER_ENDPOINT_RATE_LIMITER_DURATION,
  PER_ENDPOINT_RATE_LIMITER_REQ_LIMIT,
  GOAL_STATUS,
  RESERVED_USERNAMES,
  MAX_PARTICIPANTS_CONVERSATION,
  MAX_PARTICIPANTS_GOAL,
  RATE_LIMITER_PASSWORD_RESET_N_REQUEST,
  RATE_LIMITER_PASSWORD_RESET_WINDOW_DURATION,
  MAX_FRIENDS_PER_PERSON,
  MAX_CONVERSATIONS_PER_PERSON,
  MAX_GOALS_PER_PERSON,
  NO_DAYS_TO_COMMIT,
  MOTTO_MAX_LENGTH,
  FEEDBACK_MAX_LENGTH,
  RATE_LIMITER_FEEDBACK_WINDOW_DURATION,
  RATE_LIMITER_FEEDBACK_N_REQUEST,
};
