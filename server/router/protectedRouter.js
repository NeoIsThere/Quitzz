const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  STATUS_CODES,
  CUSTOM_ERRORS,
  CATEGORIES,
  MAX_STARTING_STREAK,
  MAX_OBJECTIVE,
  MAX_MSG_LENGTH,
  MAX_PARTICIPANTS_CONVERSATION,
  MAX_PARTICIPANTS_GOAL,
  RATE_LIMITER_MOTIVATION_WINDOW_DURATION,
  RATE_LIMITER_MOTIVATION_N_REQUEST,
  MOTTO_MAX_LENGTH,
  FEEDBACK_MAX_LENGTH,
  RATE_LIMITER_FEEDBACK_WINDOW_DURATION,
  RATE_LIMITER_FEEDBACK_N_REQUEST,
} = require("../constants");
const protectedRouter = express.Router();
const database = require("../database/database");
const { sanitizeBody, includesProfanity } = require("../utils/utils");
const fs = require("fs");
const moment = require("moment-timezone");
const { wrapper } = require("../utils/utils");
const { sendImageToRepository, deleteImageFromRepository } = require("../articles/image-manager");
const { sendFileToRepository, deleteFileFromRepository } = require("../articles/article-manager");
const { log } = require("../utils/logger");
const { user } = require("../database/models");
const utils = require("../utils/utils");
const { v4: uuidv4 } = require("uuid");

/*Retrieves the data associated with the user.*/
protectedRouter.get(
  "/account",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;

    const user = await database.findUser(username);

    if (!user) {
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
      return;
    }

    res.send({
      username: user.username,
      email: user.email,
      timeZone: user.timeZone,
      motto: user.motto,
      joinedSince: user.joinedSince,
      NFrecordCount: user.NFrecordCount,
      NPrecordCount: user.NPrecordCount,
    });
  }, 0)
);

/*Retrieves the public data of a user.*/
protectedRouter.get(
  "/account/:username",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const queriedUsername = req.params.username;

    const queriedUser = await database.findUser(queriedUsername);

    if (!queriedUser) {
      res.sendStatus(STATUS_CODES.NOT_FOUND);
      return;
    }

    res.send({
      username: queriedUser.username,
      motto: queriedUser.motto,
      joinedSince: queriedUser.joinedSince,
      NFrecordCount: queriedUser.NFrecordCount,
      NPrecordCount: queriedUser.NPrecordCount,
    });
  }, 1)
);

/*Update the email of the user.*/
protectedRouter.patch(
  "/account/email",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["email"])) {
      return;
    }
    const username = req.session.username;
    const email = req.body.email;

    await database.updateEmail(username, email);
    res.sendStatus(STATUS_CODES.OK);
  }, 2)
);

/*Update the motto of the user.*/
protectedRouter.patch(
  "/account/motto",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["motto"])) {
      return;
    }
    const username = req.session.username;
    const motto = req.body.motto;

    if (motto.length > MOTTO_MAX_LENGTH) {
      res.send(STATUS_CODES.FORBIDDEN);
      return;
    }

    await database.updateMotto(username, motto);
    res.sendStatus(STATUS_CODES.OK);
  }, 3)
);

/*Update the streaks of the user.*/
protectedRouter.patch(
  "/account/streak/:category",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["newValue"])) {
      return;
    }
    const username = req.session.username;
    const category = req.params.category;
    const newValue = req.body.newValue;

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    if (newValue < 0 || newValue > MAX_STARTING_STREAK || Math.round(newValue) != newValue) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }
    try {
      await database.setUserCount(username, category, newValue);
      res.sendStatus(STATUS_CODES.OK);
    } catch (err) {
      log("account/streak " + err);
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    }
  }, 4)
);

/*Updates the time zone associated with the user.*/
protectedRouter.patch(
  "/account/timezone",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["timeZone"])) {
      return;
    }
    const timeZone = req.body.timeZone;
    const username = req.session.username;

    if (!database.timeZones.includes(timeZone)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    await database.updateTimeZone(username, timeZone);
    res.sendStatus(STATUS_CODES.OK);
  }, 5)
);

/*Submit an article's HTML file.*/
protectedRouter.post(
  "/articles/content",
  wrapper(async (req, res) => {
    const username = req.session.username;

    if (username != "Neo") {
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const article = req.files["article"];

    const metadata = await sendFileToRepository(article);
    await database.createArticleMetadata(metadata);
    res.send(metadata);
  }, 6)
);

/*Set the article's metadata.*/
protectedRouter.patch(
  "/articles/id/:id/metadata",
  wrapper(async (req, res) => {
    const username = req.session.username;

    if (username != "Neo") {
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const id = req.params.id;
    const name = req.body.name;
    const author = req.body.author;
    const summary = req.body.summary;
    const tag = req.body.tag;
    const imageCreditAuthor = req.body.imageCreditAuthor;
    const imageCreditLink = req.body.imageCreditLink;

    const data = {
      name,
      author,
      summary,
      tag,
      imageCreditAuthor,
      imageCreditLink,
    };
    await database.editArticleMetadata(id, data);
    res.sendStatus(STATUS_CODES.OK);
  }, 7)
);

/*Set the article's header image.*/
protectedRouter.patch(
  "/articles/id/:id/image",
  wrapper(async (req, res) => {
    const username = req.session.username;

    if (username != "Neo") {
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const imageBase64 = req.body.base64;
    const id = req.params.id;

    const data = await sendImageToRepository(imageBase64);
    await database.editArticleMetadata(id, data);
    res.sendStatus(STATUS_CODES.OK);
  }, 8)
);

/*Post an image in the repository.*/
protectedRouter.post(
  "/articles/images",
  wrapper(async (req, res) => {
    const username = req.session.username;

    if (username != "Neo") {
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const imageBase64 = req.body.base64;

    await sendImageToRepository(imageBase64);
    res.sendStatus(STATUS_CODES.OK);
  }, 9)
);

/*Delete an article.*/
protectedRouter.delete(
  "/articles/id/:id",
  wrapper(async (req, res) => {
    const username = req.session.username;

    if (username != "Neo") {
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const id = req.params.id;

    const metadata = await database.getMetadata(id);
    await database.deleteArticleMetadata(id);
    await deleteFileFromRepository(metadata);
    await deleteImageFromRepository(metadata);

    res.sendStatus(STATUS_CODES.OK);
  }, 10)
);

/*Get metadata of all articles.*/
protectedRouter.get(
  "/articles",
  wrapper(async (req, res) => {
    const username = req.session.username;

    if (username != "Neo") {
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const articlesMetadata = await database.getAllMetadatas();
    res.send({ metadatas: articlesMetadata });
  }, 11)
);

/*Swap 2 articles.*/
protectedRouter.post(
  "/articles/swap/id1/:id1/id2/:id2",
  wrapper(async (req, res) => {
    const username = req.session.username;

    if (username != "Neo") {
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
      return;
    }

    const id1 = req.params.id1;
    const id2 = req.params.id2;

    await database.swapArticles(id1, id2);
    res.sendStatus(STATUS_CODES.OK);
  }, 12)
);

/*Increment count for the given category by the number of days from the last commit day.*/
protectedRouter.post(
  "/commit/category/:category",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const category = req.params.category;

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    const nDaysToCommit = await database.computeNDaysToCommit(username, category);

    if (nDaysToCommit <= 0) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }
    try {
      await database.incrementUserCount(username, category, nDaysToCommit);
      res.sendStatus(STATUS_CODES.OK);
    } catch (err) {
      log("/commit/category " + category + " " + err);
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    }
  }, 13)
);

/*Create a conversation.*/
protectedRouter.post(
  "/conversations",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["members"])) {
      return;
    }

    const username = req.session.username;

    let members = req.body.members;
    members.push(username);
    members = members.filter((member, pos) => pos == members.indexOf(member));

    if (members.length > MAX_PARTICIPANTS_CONVERSATION) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }

    try {
      const conversationID = await database.createConversation(username, members);
      res.send(conversationID);
    } catch (err) {
      if (err == CUSTOM_ERRORS.tooManyConversations) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
      }
    }
  }, 16)
);

/*Send a notification to all users from Quitzz*/
protectedRouter.post(
  "/conversations/global-notif",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const notifContent = req.body.content;
    await database.sendNotifToEveryone(notifContent);
    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  })
);

/*Get a specific conversation.*/
protectedRouter.post(
  "/conversations/:id",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["message"])) {
      return;
    }
    const username = req.session.username;
    const conversationID = req.params.id;
    const messageContent = req.body.message;

    if (messageContent.length > MAX_MSG_LENGTH || conversationID == "notifications" + username) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }

    try {
      await database.addMessage(username, conversationID, messageContent);
    } catch (err) {
      if ((err = CUSTOM_ERRORS.messageTooLong)) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
        return;
      }
    }

    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  }, 171106)
);


/*Get all user's conversations without the messages.*/
protectedRouter.get(
  "/conversations",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;

    const conversations = await database.fetchConversations(username);
    res.send(conversations);
  }, 15)
);

/*Send a message in a conversation.*/
protectedRouter.get(
  "/conversations/:id",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const conversationID = req.params.id;

    const conversation = await database.fetchConversation(conversationID);

    res.send(conversation);
  }, 17)
);

/*Leave a conversation.*/
protectedRouter.delete(
  "/conversations/:id",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const conversationID = req.params.id;

    try {
      await database.removeMemberFromConversation(conversationID, username);
    } catch (err) {
      if (err == CUSTOM_ERRORS.unmodifiableConversation) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
        return;
      }
    }

    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  }, 171018)
);

/*Add members to an existing conversation.*/
protectedRouter.put(
  "/conversations/:id/members",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["newMembers"])) {
      return;
    }

    const conversationID = req.params.id;
    let newMembers = req.body.newMembers;
    newMembers = [...new Set(newMembers)];

    try {
      await database.addMembersToConversation(conversationID, newMembers);
      res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
    } catch (err) {
      if (err == CUSTOM_ERRORS.unmodifiableConversation) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
      }
      if (err == CUSTOM_ERRORS.tooManyParticipantInConversation) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
      }
    }
  }, 1710182)
);

/*Get a specific conversation's messages from a specific period.*/
protectedRouter.get(
  "/conversations/:id/messages/:index",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const conversationID = req.params.id;
    const index = req.params.index;

    const messages = await database.fetchMessagesFromConversation(username, conversationID, index);

    res.send(messages);
  }, 18)
);

const feedbackLimiter = rateLimit({
  windowMs: RATE_LIMITER_FEEDBACK_WINDOW_DURATION,
  max: RATE_LIMITER_FEEDBACK_N_REQUEST,
  message: "The ressource is being rate limited.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
});

/*Update the motto of the user.*/
protectedRouter.post(
  "/feedback",
  feedbackLimiter,
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["feedback"])) {
      return;
    }
    const username = req.session.username;
    const feedback = req.body.feedback;

    if (feedback.length > FEEDBACK_MAX_LENGTH) {
      res.send(STATUS_CODES.FORBIDDEN);
      return;
    }

    await database.sendFeedbackEmail(username, feedback);
    res.sendStatus(STATUS_CODES.OK);
  }, 3)
);

/*Fetch the user's friends.*/
protectedRouter.get(
  "/friends",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;

    const friends = await database.fetchFriends(username);

    res.send(friends);
  }, 171156)
);

/*Fetch the user's friends.*/
protectedRouter.get(
  "/friends/not-in-conversation/:conversationIdFilter",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const conversationIdFilter = req.params.conversationIdFilter;

    const friends = await database.fetchFriends(username, conversationIdFilter);

    res.send(friends);
  }, 2612630)
);

/*Fetch whether a given username belongs to outgoing friend requests.*/
protectedRouter.get(
  "/friends/requests/incoming/includes/:queriedUsername",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const queriedUsername = req.params.queriedUsername;

    const isIncluded = await database.doIncomingFriendRequestsInclude(username, queriedUsername);

    res.send({ isIncluded });
  }, 17144)
);

/*Fetch whether a given username belongs to outgoing friend requests.*/
protectedRouter.get(
  "/friends/requests/outgoing/includes/:queriedUsername",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const queriedUsername = req.params.queriedUsername;

    const isIncluded = await database.doOutgoingFriendRequestsInclude(username, queriedUsername);

    res.send({ isIncluded });
  }, 17144)
);

/*Fetch whether a given username belongs to friends.*/
protectedRouter.get(
  "/friends/includes/:username",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const queriedUsername = req.params.username;

    const isIncluded = await database.doFriendsInclude(username, queriedUsername);

    res.send({ isIncluded });
  }, 17145)
);

/*Fetch the number of incoming friend requests.*/
protectedRouter.get(
  "/friends/requests/incoming/count",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;

    const numberOfRequests = await database.fetchNumberOfIncomingFriendRequests(username);

    res.send({ numberOfRequests });
  }, 171204)
);

/*Send a friend request to a user.*/
protectedRouter.put(
  "/friends/requests/:username",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const sender = req.session.username;
    const receiver = req.params.username;

    try {
      await database.sendFriendRequest(sender, receiver);
      res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
    } catch (err) {
      if (err == CUSTOM_ERRORS.tooManyFriends) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
      }
    }
  }, 171157)
);

/*Accept a friend request.*/
protectedRouter.post(
  "/friends/requests/accept/:username",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const newFriend = req.params.username;

    try {
      await database.addFriend(username, newFriend);
      res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
    } catch (err) {
      if ((err = CUSTOM_ERRORS.tooManyFriends)) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
      }
    }
  }, 171209)
);

/*Reject a friend request.*/
protectedRouter.post(
  "/friends/requests/reject/:username",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const rejected = req.params.username;

    await database.removeFriendRequest(username, rejected);

    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  }, 171210)
);

/*Remove a friend.*/
protectedRouter.delete(
  "/friends/:username",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const deleted = req.params.username;

    await database.removeFriend(username, deleted);

    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  }, 171211)
);

/*Create a goal with given participants.*/
protectedRouter.post(
  "/goals/:category/",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["participants", "objective"])) {
      return;
    }

    const username = req.session.username;
    const objective = req.body.objective;
    const category = req.params.category;

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    if (objective < 0 || objective > MAX_OBJECTIVE || Math.round(objective) != objective) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }
    let participants = req.body.participants;

    participants.push(username);
    participants = participants.filter((participant, pos) => participants.indexOf(participant) == pos);

    if (participants.length > MAX_PARTICIPANTS_GOAL) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }

    try {
      const goalID = await database.createGoal(username, category, objective, participants);
      res.send({ goalID });
    } catch (err) {
      if (err == CUSTOM_ERRORS.tooManyGoals || err == CUSTOM_ERRORS.tooManyParticipantsInGoal) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
      }
    }
  }, 1223841)
);

/*Remove a goal.*/
protectedRouter.delete(
  "/goals/:goalId",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const goalId = req.params.goalId;

    await database.removeGoal(username, goalId);
    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  }, 1501136)
);

/*Accept a goal invitation.*/
protectedRouter.post(
  "/goals/invitations/accept/:goalId",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const goalId = req.params.goalId;

    try {
      await database.addMemberToGoal(username, goalId);
      res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
    } catch (err) {
      if ((err = CUSTOM_ERRORS.tooManyGoals)) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
      }
    }
  }, 1501136)
);

/*Reject a goal invitation.*/
protectedRouter.post(
  "/goals/invitations/reject/:goalId",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const goalId = req.params.goalId;

    await database.removeGoalInvitation(username, goalId);
    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  }, 1501138)
);

/*Update the objective of a goal that is still ongoing.*/
/*protectedRouter.patch(
  "/goals/:id/:newValue",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const id = req.params.id;
    const newValue = req.params.newValue;

    if (newValue < 0 || newValue > MAX_OBJECTIVE || Math.round(newValue) != newValue) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }

    await database.updateGoalObjective(id, newValue);

    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  }, 1223912)
);*/

/*Update the objective of a goal that is still ongoing.*/
protectedRouter.post(
  "/goals/:goalId/acknowledge",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const goalId = req.params.goalId;

    await database.acknowledge(username, goalId);

    res.sendStatus(STATUS_CODES.SUCCESS_NO_CONTENT);
  }, 12231137)
);

/*Get a specific goal metadata.*/
protectedRouter.get(
  "/goals/:goalId/progress",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const goalId = req.params.goalId;

    const goal = await database.fetchGoal(goalId);

    const progress = goal.progress.find((progress) => progress.username == username).count;

    if (progress) {
      res.send({ progress });
      return;
    }

    res.sendStatus(STATUS_CODES.NOT_FOUND);
  }, 12241100)
);

const motivationMessageLimiter = rateLimit({
  windowMs: RATE_LIMITER_MOTIVATION_WINDOW_DURATION,
  max: RATE_LIMITER_MOTIVATION_N_REQUEST,
  message: "The ressource is being rate limited.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
});

/*Submit a motivation message for evaluation.*/
protectedRouter.post(
  "/motivation-message",
  motivationMessageLimiter,
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["message"])) {
      return;
    }

    const receivedMessage = req.body.message;
    const upperCaseMessage = receivedMessage.toUpperCase(); /*remove non-word characters*/

    const username = req.session.username;
    const date = moment().utc().format();

    try {
      //await includesProfanity(upperCaseMessage);
      await database.saveSubmission({ username, message: upperCaseMessage, date, IP: req.clientIp });
      res.sendStatus(STATUS_CODES.OK);
    } catch (err) {
      log("/motivation-message " + err);
      if (err == CUSTOM_ERRORS.profanity) {
        res.sendStatus(STATUS_CODES.FORBIDDEN);
        return;
      }
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    }
  }, 19)
);

/*Update the objective of the user for the given category.*/
protectedRouter.patch(
  "/objective/category/:category",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    if (!sanitizeBody(req, res, ["newValue"])) {
      return;
    }
    const username = req.session.username;
    const category = req.params.category;
    const newValue = req.body.newValue;

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    if (newValue < 0 || newValue > MAX_OBJECTIVE || Math.round(newValue) != newValue) {
      res.sendStatus(STATUS_CODES.FORBIDDEN);
      return;
    }
    try {
      await database.setUserObjective(username, category, newValue);
      res.sendStatus(STATUS_CODES.OK);
    } catch (err) {
      log("/objective/category " + err);
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    }
  }, 20)
);

/*Resets a count of given category.*/
protectedRouter.post(
  "/relapse/category/:category",
  utils.getRateLimiter(),
  wrapper(async (req, res) => {
    const username = req.session.username;
    const category = req.params.category;

    if (!CATEGORIES.includes(category)) {
      res.sendStatus(STATUS_CODES.UNPROCESSABLE_ENTITY);
      return;
    }

    try {
      await database.relapse(username, category);
      res.sendStatus(STATUS_CODES.OK);
    } catch (err) {
      log("/relapse/category " + err);
      res.sendStatus(STATUS_CODES.UNAUTHORIZED);
    }
  }, 21)
);

/*Logs the user out of the website.*/
protectedRouter.post(
  "/sign-out",
  utils.getRateLimiter(),
  wrapper((req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.sendStatus(STATUS_CODES.INTERNAL_SERVER_ERROR);
        return;
      }

      res.sendStatus(STATUS_CODES.OK);
    });
  }, 22)
);

module.exports = protectedRouter;
