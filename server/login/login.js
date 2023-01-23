const database = require("../database/database");
const {
  STATUS_CODES,
  CUSTOM_ERRORS,
  MAX_STARTING_STREAK,
  RATE_LIMITER_SIGN_UP_SHORT_WINDOW_DURATION,
  RATE_LIMITER_SIGN_UP_SHORT_N_REQUEST,
} = require("../constants");
const utils = require("../utils/utils");
const { sanitizeBody } = require("../utils/utils");
const express = require("express");
const loginRouter = express.Router();
const rateLimit = require("express-rate-limit");
const {
  RATE_LIMITER_SIGN_IN_WINDOW_DURATION,
  RATE_LIMITER_SIGN_IN_N_REQUEST,
  RATE_LIMITER_SIGN_UP_WINDOW_DURATION,
  RATE_LIMITER_SIGN_UP_N_REQUEST,
} = require("../constants");
const { request } = require("express");
const constants = require("../constants");

const signInAccountLimiter = rateLimit({
  windowMs: RATE_LIMITER_SIGN_IN_WINDOW_DURATION,
  max: RATE_LIMITER_SIGN_IN_N_REQUEST,
  message: "The ressource is being rate limited.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
});

/*Logs the user in if the user exists and the password is correct.*/
loginRouter.post("/sign-in", signInAccountLimiter, async (req, res) => {
  if (!sanitizeBody(req, res, ["username", "password"])) {
    return;
  }
  const username = req.body.username;
  const password = req.body.password;

  const user = await database.findUser(username);

  if (!user) {
    res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    return;
  }

  const hashedPassword = user.password;
  const isSame = await utils.comparePlainTextWithHash(password, hashedPassword);

  if (!isSame) {
    res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    return;
  }

  req.session.username = username;
  res.sendStatus(STATUS_CODES.OK);
});

const signUpAccountLimiter = rateLimit({
  windowMs: RATE_LIMITER_SIGN_UP_WINDOW_DURATION,
  max: RATE_LIMITER_SIGN_UP_N_REQUEST,
  message: "The ressource is being rate limited.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
});

const signUpAccountShortLimiter = rateLimit({
  windowMs: RATE_LIMITER_SIGN_UP_SHORT_WINDOW_DURATION,
  max: RATE_LIMITER_SIGN_UP_SHORT_N_REQUEST,
  message: "The ressource is being rate limited.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
});
/*If the information is valid creates a new account and signs the user in.*/
loginRouter.post("/sign-up", signUpAccountLimiter, signUpAccountShortLimiter, async (req, res) => {
  if (
    !sanitizeBody(req, res, ["username", "password", "email", "currentStreakNF", "currentStreakNP", "timeZone"])
  ) {
    return;
  }
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const currentStreakNF = req.body.currentStreakNF;
  const currentStreakNP = req.body.currentStreakNP;
  let timeZone = req.body.timeZone;

  if (!database.timeZones.includes(timeZone)) {
    timeZone = constants.DEFAULT_VALUES.TIME_ZONE;
  }

  try {
    await isNewUsernameValid(username);
    await isPasswordValid(password);
    await isCurrentStreakValid(currentStreakNF);
    await isCurrentStreakValid(currentStreakNP);
    const hash = await utils.hash(password);
    const newUser = { username, password: hash, email, timeZone, NFcount: currentStreakNF, NPcount: currentStreakNP };
    await database.registerNewUser(newUser);
    req.session.username = username;
    res.sendStatus(STATUS_CODES.OK);
  } catch (err) {
    if (err == CUSTOM_ERRORS.usernameAlreadyExist) {
      res.sendStatus(STATUS_CODES.CONFLICT);
      return;
    }
    if ((err == CUSTOM_ERRORS.profanity) || (err == CUSTOM_ERRORS.reserved)) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }
    res.sendStatus(STATUS_CODES.UNAUTHORIZED);
  }
});

/*Checks whether the username is valid (i.e., length between 3 and 20 and only number, letter and underscore)*/
async function isNewUsernameValid(username) {

  if (!utils.isUsernameValid(username)) {
    throw CUSTOM_ERRORS.credentialsNotRespectRules;
  }

  const includesProfanity = await utils.includesProfanity(username);

  if (includesProfanity) {
    throw CUSTOM_ERRORS.profanity;
  }

  const isReserved = constants.RESERVED_USERNAMES.includes(username);

  if (includesProfanity) {
    throw CUSTOM_ERRORS.reserved;
  }

  const exists = await database.userExists(username);

  if (exists) {
    throw CUSTOM_ERRORS.usernameAlreadyExist;
  }
}

/*Checks whether the password is valid (i.e., length between 8 and 20 with at least 1 number and 1 letter)*/
function isPasswordValid(password) {
  return new Promise((resolve, reject) => {
    const re = new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$).{8,20}$/);
    if (re.test(password)) {
      resolve();
      return;
    }
    throw CUSTOM_ERRORS.credentialsNotRespectRules;
  });
}

function isCurrentStreakValid(currentStreak) {
  return new Promise((resolve, reject) => {
    const numeric = Number.parseInt(currentStreak);
    if (Number.isNaN(numeric)) {
      throw CUSTOM_ERRORS.invalidFormat;
    }
    if (numeric < 0 || numeric > MAX_STARTING_STREAK) {
      throw CUSTOM_ERRORS.invalidFormat;
    }
    resolve();
  });
}

module.exports = {
  loginRouter,
  isPasswordValid,
};
