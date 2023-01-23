const { STATUS_CODES } = require("../constants");
const database = require("../database/database");
const { log } = require("../utils/logger");

async function authenticate(req, res, next) {
  try {
    if (req.session && req.session.username) {
      const username = req.session.username;
      const user = await database.findUser(username);
      if (!user) {
        log("error: " + "user has a session but username not found in DB");
        res.sendStatus(STATUS_CODES.UNAUTHORIZED);
        return;
      }
      next();
      return;
    }
    res.sendStatus(STATUS_CODES.UNAUTHORIZED);
  } catch (err) {
    log(err);
  }
}

module.exports = authenticate;
