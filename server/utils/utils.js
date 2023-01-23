const bcrypt = require("bcrypt");
const { STATUS_CODES, PROFANITIES, CUSTOM_ERRORS, PER_ENDPOINT_RATE_LIMITER_DURATION, PER_ENDPOINT_RATE_LIMITER_REQ_LIMIT } = require("../constants");
const { log } = require("../utils/logger");
const rateLimit = require("express-rate-limit");

const wrapper = (middleware, id) => async (req, res) => {
  try {
    await middleware(req, res);
  } catch (err) {
    log("exception caught @ utils.js: " + err + " " + id);
  }
};

function isUsernameValid(username){
  const re = new RegExp(/^([0-9]|[a-zA-Z]|_){3,20}$/);

  return re.test(username);
}

/* /!\ Putting the loop inside a promise does not make it non-blocking and does not delay its execution.
To be non-blocking, an additional thread should be created. To be delayed, setTimeout can be used. */
function includesProfanity(input) {
  return new Promise((resolve, reject) => {
    const lowercase = input.toLowerCase();
    const withoutUnderscore = lowercase.replace(/_/g, "");
    const withoutRepetition = withoutUnderscore.replace(/(.)\1+/g, "$1");

    if (PROFANITIES.some((profanity) => withoutRepetition.includes(profanity))) {
      throw CUSTOM_ERRORS.profanity;
    }
    resolve();
  });
}

function hash(str) {
  return bcrypt.hash(str, 10);
}

function comparePlainTextWithHash(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

function sanitizeBody(req, res, expectedFields) {
  if (!req.body) {
    res.sendStatus(STATUS_CODES.BAD_REQUEST);
    return false;
  }
  for (let i = 0; i < expectedFields.length; i++) {
    let field = expectedFields[i];
    let valueInBody = req.body[field];
    if (valueInBody !== 0 && !valueInBody) {
      //if value is number 0 than it should not be considered missing
      res.sendStatus(STATUS_CODES.BAD_REQUEST);
      return false;
    }
  }
  return true;
}

function validateTypes(values, type) {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value != type) {
      return false;
    }
  }
  return true;
}

function isFunction(x) {
  return Object.prototype.toString.call(x) == "[object Function]";
}


function getRateLimiter() {
  return rateLimit({
    windowMs: PER_ENDPOINT_RATE_LIMITER_DURATION, // x mins
    max: PER_ENDPOINT_RATE_LIMITER_REQ_LIMIT, // Limit each IP to y requests per `window` (here, per x minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req, res) => {
      return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
    },
  });
}

function todayDateUTC(){
  return (new Date()).toISOString();
}

module.exports = {
  hash,
  comparePlainTextWithHash,
  sanitizeBody,
  includesProfanity,
  wrapper,
  validateTypes,
  isFunction,
  isUsernameValid,
  getRateLimiter,
  todayDateUTC,
};
