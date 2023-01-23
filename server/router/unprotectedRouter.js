const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  STATUS_CODES,
  CUSTOM_ERRORS,
  RATE_LIMITER_PASSWORD_RESET_WINDOW_DURATION,
  RATE_LIMITER_PASSWORD_RESET_N_REQUEST,
  CATEGORIES,
} = require("../constants");
const unprotectedRouter = express.Router();
const database = require("../database/database");
const { isPasswordValid } = require("../login/login.js");
const { wrapper } = require("../utils/utils");
const { sanitizeBody } = require("../utils/utils");
const utils = require("../utils/utils");
const { log } = require("../utils/logger");

/*Get the metadata of the articles of the given page.*/
unprotectedRouter.get(
  "/articles/page/:page",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const pageIndex = req.params.page;
    const result = await database.getMetadataOfPage(pageIndex);

    res.send(result);
  }, 0)
);

/*Get the metadata of a specific article.*/
unprotectedRouter.get(
  "/articles/id/:id/metadata",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const id = req.params.id;
    const articleMetadata = await database.getMetadata(id);
    if (!articleMetadata) {
      res.sendStatus(STATUS_CODES.NOT_FOUND);
      return;
    }
    articleMetadata.nViews++;
    await articleMetadata.save();
    res.send(articleMetadata);
  }, 1)
);

/*Gets all user counts (NF, NP and records).*/
unprotectedRouter.get(
  "/counts/committed",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const counts = await database.getUserCounts(username);
    res.send(counts);
  }, 2)
);

/*Gets the number of days that the user can commit for a specific category.*/
unprotectedRouter.get(
  "/counts/uncommitted/category/:category",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const category = req.params.category;

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    const days = await database.computeNDaysToCommit(username, category);
    res.send({ nDays: days });
  }, 3)
);

/*Gets a random motivation message.*/
unprotectedRouter.get(
  "/motivation-message/random",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const message = await database.getRandomMotivationMessage();
    res.send(message);
  }, 4)
);

const resetPasswordRateLimiter = rateLimit({
  windowMs: RATE_LIMITER_PASSWORD_RESET_WINDOW_DURATION,
  max: RATE_LIMITER_PASSWORD_RESET_N_REQUEST,
  message: "The ressource is being rate limited.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
});

/*Generates a password reset link and sent it by email for the given user.*/
unprotectedRouter.delete(
  "/account/password/username/:username",
  resetPasswordRateLimiter,
  wrapper(async (req, res) => {
    const username = req.params.username;
    try {
      const token = await database.sendPasswordResetToken(username);
      //res.send({ token }); /////////////////////////////////SECURITY-BREACH///////////////TESTING-PURPOSES ONLY/////////
      res.sendStatus(STATUS_CODES.OK);
    } catch (err) {
      log("delete /account/password " + err);
      if (err == CUSTOM_ERRORS.usernameNotExist) {
        res.sendStatus(STATUS_CODES.OK); //we don't want the user to know that the username does not exist
        return;
      }
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    }
  }, 5)
);

/*Updates the user's password if password respect criteria and token is valid*/
unprotectedRouter.put(
  "/account/password/username/:username/token/:token",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["newPassword"])) {
      return;
    }
    const username = req.params.username;
    const token = req.params.token;
    const newPassword = req.body.newPassword;

    try {
      await isPasswordValid(newPassword);
      const hashedPassword = await utils.hash(newPassword);
      await database.updatePassword(username, token, hashedPassword);

      res.sendStatus(STATUS_CODES.OK);
    } catch (err) {
      log("put /account/password " + err);
      if (err == CUSTOM_ERRORS.credentialsNotRespectRules) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
        return;
      }
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    }
  }, 6)
);

/*Returns the rank of the user associated with the session.*/
unprotectedRouter.get(
  "/account/rank/category/:category",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const category = req.params.category;
    const user = await database.findUser(username);
    if (!user) {
      res.send({ position: -1 });
      return;
    }

    const rank = await database.computeUserIndex(user, category);
    res.send({ position: rank });
  }, 7)
);

/*Returns the username of the user associated with the session.*/
unprotectedRouter.get(
  "/account/username",
  utils.getRateLimiter(),
  wrapper((req, res) => {
    const username = req.session.username;
    res.send({ username });
  }, 8)
);

/*Get the ids of the unread conversations.*/
unprotectedRouter.get(
  "/conversations/unread",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;

    try {
      const unreadConversationIds = await database.fetchUnreadConversations(username);
      res.send(unreadConversationIds);
    } catch (err) {
      if (err == CUSTOM_ERRORS.usernameNotExist) {
        res.send([]);
      }
    }
  }, 1717)
);

/*Returns the list of donors.*/
unprotectedRouter.get(
  "/donors",
  wrapper(async (req, res) => {
    const donorsList = await database.getDonors();
    res.send(donorsList);
  }, 9)
);

/*Fetch incoming friend requests.*/
unprotectedRouter.get(
  "/friends/requests/incoming",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;

    try {
      const requests = await database.fetchIncomingFriendRequests(username);
      res.send(requests);
    } catch (err) {
      if (err == CUSTOM_ERRORS.usernameNotExist) {
        res.send([]);
      }
    }
  }, 171204)
);

/*Get the user's goal for the given category.*/
unprotectedRouter.get(
  "/goals/:category",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const category = req.params.category;

    try {
      const invitationGoals = await database.fetchInvitationGoals(username, category);
      const goals = await database.fetchGoals(username, category);
      const joinedGoals = [...invitationGoals, ...goals];
      joinedGoals.forEach((goal) => {
        goal.isMine = (goal.creator == username);
      });
      res.send(joinedGoals);
    } catch (err) {
      if (err == CUSTOM_ERRORS.usernameNotExist) {
        res.send([]);
      }
    }
  }, 12231143)
);

/*Get the user's goals for the given category.*/
unprotectedRouter.get(
  "/goals/validated/:category",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const category = req.params.category;

    try {
      const goals = await database.fetchValidatedGoals(username, category);
      res.send(goals);
    } catch (err) {
      if (err == CUSTOM_ERRORS.usernameNotExist) {
        res.send([]);
      }
    }
  }, 12252022)
);

/*Fetches an ordered list of users. If page is 'top', the top 3 users are returned. If a page number is provided, it is returned. 
If no page is provided, if the user is connected, the page associated
with the user index is returned, otherwise the first page is returned. */
unprotectedRouter.get(
  "/users/category/:category/page/:page",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const category = req.params.category;
    const page = req.params.page;

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    const usersData = await database.fetchUsers(category, username, Number.parseInt(page));
    const countToUse = category + "count";

    const usersToSend = usersData.users.map((user) => {
      return {
        username: user.username,
        count: user[countToUse],
        me: user.username === username,
      };
    });

    res.send({
      users: usersToSend,
      maxPageIndex: usersData.maxPageIndex,
      page: usersData.page,
      myRank: usersData.myRank,
      nTotalActiveUsers: usersData.nTotalActiveUsers,
      nTotalUsers: usersData.nTotalUsers,
    });
  }, 10)
);

/*Fetches an ordered list of users that matches a certain patern. */
unprotectedRouter.get(
  "/users/category/:category/query/:query/page/:page",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const category = req.params.category;
    const query = req.params.query;
    const page = req.params.page;

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    try {
      await utils.isUsernameValid(query);
    } catch {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    const usersData = await database.fetchUsersWithQuery(category, query, Number.parseInt(page));
    const countToUse = category + "count";

    const usersToSend = usersData.users.map((user) => {
      return {
        username: user.username,
        count: user[countToUse],
        me: user.username === username,
      };
    });

    res.send({
      users: usersToSend,
      maxPageIndex: usersData.maxPageIndex,
      page: usersData.page,
    });
  }, 11)
);

/*Fetches average and median of streaks for given category. */
unprotectedRouter.get(
  "/users/category/:category/statistics",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const category = req.params.category;
    const countToUse = category + "count";

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    const average = await database.getCountsMetadata(countToUse + "Average");
    const median = await database.getCountsMetadata(countToUse + "Median");

    res.send({
      average,
      median,
    });
  }, 12)
);

module.exports = unprotectedRouter;
