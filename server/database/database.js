const mongoose = require("mongoose");
const {
  RESULTS_PER_PAGE,
  TOP_RESULTS,
  CUSTOM_ERRORS,
  PASSWORD_RESET_TOKEN_MINS,
  STATISTICS_REFRESH_CYCLE,
  ARTICLES_PER_PAGE,
  MAX_DELTA_DAYS_TO_APPEAR_IN_RANKING,
  N_MSG_PER_BLOCK,
  GOAL_STATUS,
  MAX_MSG_LENGTH,
  MAX_FRIENDS_PER_PERSON,
  MAX_GOALS_PER_PERSON,
  MAX_PARTICIPANTS_GOAL,
  MAX_CONVERSATIONS_PER_PERSON,
  MAX_PARTICIPANTS_CONVERSATION,
  NO_DAYS_TO_COMMIT,
} = require("../constants");
let userModel;
let donorModel;
let resetTokenModel;
let motivationMessageModel;
let motivationMessageSubmissionModel;
let articleMetadataModel;
let conversationModel;
let messageModel;
let goalModel;
const moment = require("moment-timezone");
const timeZones = moment.tz.names();
const crypto = require("crypto");
const utils = require("../utils/utils");
const { sendPasswordResetLink, sendDBBackup, sendFeedback } = require("../email/email");
const { log } = require("../utils/logger");
const schedule = require("node-schedule");
const { v4: uuidv4 } = require("uuid");

countsMetadata = { NFcountAverage: 0, NPcountAverage: 0, NFcountMedian: 0, NPcountMedian: 0 };

async function addFriend(username, newFriend) {
  const user = await this.findUser(username);
  const newFriendUser = await this.findUser(newFriend);

  if (!user || !newFriendUser) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  if (user.friends.length >= MAX_FRIENDS_PER_PERSON) {
    throw CUSTOM_ERRORS.tooManyFriends;
  }

  const outgoingFriendRequests = await newFriendUser.outgoingFriendRequests;

  if (!outgoingFriendRequests.includes(username)) {
    throw CUSTOM_ERRORS.unrequestedFriendship;
  }

  await userModel.updateOne(
    { username },
    {
      $pull: { incomingFriendRequests: newFriend, outgoingFriendRequests: newFriend },
      $addToSet: { friends: newFriend },
    }
  );

  return userModel.updateOne(
    { username: newFriend },
    { $addToSet: { friends: username }, $pull: { incomingFriendRequests: username, outgoingFriendRequests: username } }
  );
}

async function addMembersToConversation(conversationID, newMembers) {
  if (conversationID.includes("notifications")) {
    throw CUSTOM_ERRORS.unmodifiableConversation;
  }

  const conversation = await conversationModel.findOne({ id: conversationID });

  if (!conversation) {
    throw CUSTOM_ERRORS.conversationNotExist;
  }

  if (conversation.members.length >= MAX_PARTICIPANTS_CONVERSATION) {
    throw CUSTOM_ERRORS.tooManyParticipantInConversation;
  }

  await conversationModel.updateOne({ id: conversationID }, { $addToSet: { members: newMembers } });

  await userModel.updateMany(
    { username: { $in: newMembers } },
    { $addToSet: { conversationIds: conversationID, unreadConversationIds: conversationID } }
  );
}

async function addMemberToGoal(username, goalId) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  if (user.currentGoalsIds.length >= MAX_GOALS_PER_PERSON) {
    throw CUSTOM_ERRORS.tooManyGoals;
  }

  const goal = await goalModel.findOne({ id: goalId });

  if (!goal) {
    throw CUSTOM_ERRORS.goalNotExist;
  }

  await userModel.updateOne(
    { username },
    { $addToSet: { currentGoalsIds: goalId }, $pull: { invitationGoalsIds: goalId } }
  );

  const progress = goal.progress;
  progress.push({ username, count: 0 });

  return goalModel.updateOne({ id: goalId }, { progress });
}

async function addMessage(author, conversationID, messageContent) {
  if (messageContent.length > MAX_MSG_LENGTH) {
    throw CUSTOM_ERRORS.messageTooLong;
  }

  const message = new messageModel({
    id: uuidv4(),
    content: messageContent,
    author: author,
    date: utils.todayDateUTC(),
  });

  const todayDate = utils.todayDateUTC();

  const conversation = await conversationModel.findOneAndUpdate(
    { id: conversationID },
    { $addToSet: { messages: message }, latestMessageDate: todayDate }
  );

  const membersWithoutAuthor = conversation.members.filter((member) => member != author);

  return userModel.updateMany(
    { username: { $in: membersWithoutAuthor } },
    { $addToSet: { unreadConversationIds: conversationID } }
  );
}

async function backup() {
  const users = await getAllUsers();
  const motivationMessages = await getAllMotivationMessages();
  const motivationMessageSubmissions = await getAllMotivationMessageSubmissions();
  const nUsersWhoCommittedToday = await getNUsersWhoCommittedToday();
  sendDBBackup(users, motivationMessages, motivationMessageSubmissions, nUsersWhoCommittedToday);
  log("sending backup: " + moment().utc().format());
}

async function computeCountsMetadata() {
  let sums = 0;
  let nUsers = 0;

  log("computing average: " + moment().utc().format());
  try {
    sums = await userModel.aggregate([
      { $match: {} },
      { $group: { _id: null, sumNFCount: { $sum: "$NFcount" }, sumNPCount: { $sum: "$NPcount" } } },
    ]);

    nUsers = await userModel.count({});

    countsMetadata.NFcountAverage = sums[0].sumNFCount / nUsers;
    countsMetadata.NPcountAverage = sums[0].sumNPCount / nUsers;

    NFMedian = await userModel
      .find({})
      .sort({ NFcount: "asc" })
      .skip(Math.floor(nUsers / 2))
      .limit(1);
    NPMedian = await userModel
      .find({})
      .sort({ NPcount: "asc" })
      .skip(Math.floor(nUsers / 2))
      .limit(1);

    countsMetadata.NFcountMedian = NFMedian[0].NFcount;
    countsMetadata.NPcountMedian = NPMedian[0].NPcount;
  } catch (err) {
    log("error: " + "computing sums " + err);
  }
}

async function connectToMongo() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

    const state = mongoose.connection.readyState;
    const models = require("./models");
    userModel = models.user;
    donorModel = models.donor;
    //userModel.collection.createIndex({username: 1})
    resetTokenModel = models.passwordResetToken;
    motivationMessageModel = models.motivationMessage;
    motivationMessageSubmissionModel = models.motivationMessageSubmission;
    articleMetadataModel = models.articleMetadata;
    conversationModel = models.conversation;
    messageModel = models.message;
    goalModel = models.goal;

    //await TEMPaddMissingProperties();

    computeCountsMetadata();
    setInterval(() => computeCountsMetadata(), STATISTICS_REFRESH_CYCLE);

    log("successfully connected to mongodb");
    log("Ready state: " + state);

    schedule.scheduleJob("0 4 * * *", () => backup());
  } catch (err) {
    log("error: " + "Could not connect to database: " + err);
  }
}

async function TEMPaddMissingProperties() {
  await conversationModel.deleteMany({});
  await goalModel.deleteMany({});

  await userModel.updateMany(
    {},
    {
      currentGoalsIds: [],
      validatedGoalsIds: [],
      nNFrelapse: 0,
      nNPrelapse: 0,
      NFstreakAverage: 0,
      NPstreakAverage: 0,
      friends: [],
      incomingFriendRequests: [],
      outgoingFriendRequests: [],
      conversationIds: [],
      unreadConversationIds: [],
    }
  );

  await userModel.updateMany(
    {},
    { $unset: { NFobjective: "", NPobjective: "", NFobjProgress: "", NPobjProgress: "", conversations: "" } }
  );

  const users = await userModel.find({});

  users.forEach(async (user) => {
    const notifConvoId = "notifications" + user.username;

    const newConvo = new conversationModel();
    newConvo.id = notifConvoId;
    newConvo.members = ["Quitzz", user.username];
    await newConvo.save();

    user.conversationIds.push(notifConvoId);
    user.unreadConversationIds.push(notifConvoId);

    await user.save();

    const messageContent =
      "Welcome to Quitzz!  \n \n This is a read-only conversation in which will appear important notifications. \n \n \
    A regular conversation can be created by messaging a friend.\n \n \
    You can send a friend request to someone in the rankings by clicking on their username.";

    await addMessage("Quitzz", notifConvoId, messageContent);
  });
}

async function computeNDaysToCommit(username, category) {
  const user = await this.findUser(username);
  if (!user) {
    return NO_DAYS_TO_COMMIT;
  }
  return computeNDaysToCommitForUser(user, category);
}

function computeNDaysToCommitForUser(user, category) {
  const timeZone = user.timeZone;

  let currentDate = moment(formattedCurrentDate(timeZone));

  const dateToUse = category + "lastCommitDate";
  const lastCommitDate = moment(user[dateToUse], "YYYY-MM-DD");

  let nDaysToCommit = currentDate.diff(lastCommitDate, "days");

  if (Number.isNaN(nDaysToCommit)) {
    nDaysToCommit = 0;
  }
  return Math.max(nDaysToCommit, 0); //max because nDaysToCommit could be negative if user changes time zone
}

async function computeUserIndex(user, category) {
  let indexOfUser = 0;
  const latestDateAuthorized = computeLatestDateToAppearOnRanking();

  const countToUse = category + "count";
  const dateToUse = category + "lastCommitDate";

  const nCountsGreaterThanUser = await userModel.count({
    [countToUse]: { $gt: user[countToUse] },
    [dateToUse]: { $gt: latestDateAuthorized },
  });

  indexOfUser += nCountsGreaterThanUser;

  const nUsernamesGreaterThanUser = await userModel.count({
    [countToUse]: { $eq: user[countToUse] },
    [dateToUse]: { $gt: latestDateAuthorized },
    username: { $gt: user.username },
  });

  indexOfUser += nUsernamesGreaterThanUser;

  return indexOfUser;
}

function computeLatestDateToAppearOnRanking() {
  const currentDate = moment();
  return currentDate.subtract(MAX_DELTA_DAYS_TO_APPEAR_IN_RANKING, "days").format("YYYY-MM-DD");
}

async function createArticleMetadata(data) {
  const nArticles = await articleMetadataModel.count({});
  data.index = nArticles;
  const metadata = new articleMetadataModel(data);
  return metadata.save();
}

async function createConversation(author, members, id) {
  const user = await findUser(author);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  if (user.conversationIds.length >= MAX_CONVERSATIONS_PER_PERSON) {
    throw CUSTOM_ERRORS.tooManyConversations;
  }

  let newConversationID = id ? id : uuidv4();

  const newConversation = new conversationModel();
  newConversation.id = newConversationID;
  newConversation.members = members;
  await newConversation.save();

  await userModel.updateMany(
    { username: { $in: members } },
    { $addToSet: { conversationIds: newConversationID, unreadConversationIds: newConversationID } }
  );

  return newConversationID;
}

async function createGoal(author, category, objective, participants) {
  const authorUser = await findUser(author);

  if (!authorUser) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  if (authorUser.currentGoalsIds.length >= MAX_GOALS_PER_PERSON) {
    throw CUSTOM_ERRORS.tooManyGoals;
  }

  if (participants.length > MAX_PARTICIPANTS_GOAL) {
    throw CUSTOM_ERRORS.tooManyParticipantsInGoal;
  }

  const newGoalID = uuidv4();

  const toInviteUsernames = participants.filter((participant) => participant != author);
  await userModel.updateMany(
    { username: { $in: toInviteUsernames } },
    { $addToSet: { invitationGoalsIds: newGoalID } }
  );

  await userModel.updateMany({ username: author }, { $addToSet: { currentGoalsIds: newGoalID } });

  const progress = { username: author, count: 0 };

  const newGoal = new goalModel({
    id: newGoalID,
    creator: author,
    objective,
    progress,
    status: GOAL_STATUS.ON_GOING,
    category,
  });

  await newGoal.save();

  presentableCategory = category == "NF" ? "PMO" : "PornFree";

  const msg =
    "You've been invited to a goal created by " +
    author +
    ".\n \n" +
    "You can now see it in the Goals panel of the " +
    presentableCategory +
    " section.";

  await Promise.all(
    toInviteUsernames.map((participant) => {
      return addMessage("Quitzz", "notifications" + participant, msg);
    })
  );

  return newGoalID;
}

async function deleteArticleMetadata(id) {
  const metadata = await articleMetadataModel.findOne({ id });
  const indexToDelete = metadata.index;
  await articleMetadataModel.find({ index: { $gt: indexToDelete } });
  await articleMetadataModel.updateMany({ index: { $gt: indexToDelete } }, { $inc: { index: -1 } });
  return articleMetadataModel.deleteOne({ id });
}

async function editArticleMetadata(id, data) {
  const metadata = await articleMetadataModel.findOne({ id });
  Object.keys(data).forEach((key) => (metadata[key] = data[key]));
  return metadata.save();
}

async function fetchConversation(conversationID) {
  const conversation = await conversationModel.findOne({ id: conversationID }, { messages: 0 });
  return conversation;
}

async function fetchConversations(username) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  const conversationIDs = user.conversationIds;

  const conversations = await conversationModel.find({ id: { $in: conversationIDs } }).sort({ latestMessageDate: -1 });

  return conversations.map((conversation) => {
    delete conversation.messages;
    return conversation;
  });
}

async function fetchFriends(username, conversationIDFilter) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  if (conversationIDFilter) {
    return userModel.find(
      { username: { $in: user.friends }, conversationIds: { $nin: conversationIDFilter } },
      { username: 1, NPcount: 1, NFcount: 1 }
    );
  }

  return userModel.find({ username: { $in: user.friends } }, { username: 1, NPcount: 1, NFcount: 1 });
}

async function fetchGoal(goalID) {
  return goalModel.findOne({ id: goalID });
}

async function fetchGoals(username, category) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  const goalIds = user.currentGoalsIds;

  return await goalModel.find({ id: { $in: goalIds }, category }).lean(); //lean converts MongooseDocument objects into plain JS objects so we can add properties to it
}

async function fetchInvitationGoals(username, category) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  const invitationGoalsIds = user.invitationGoalsIds;

  let goals = await goalModel.find({ id: { $in: invitationGoalsIds }, category }).lean();

  return goals.map((goal) => {
    goal.status = GOAL_STATUS.INVITATION;
    return goal;
  });
}

async function fetchIncomingFriendRequests(username) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  return userModel.find({ username: { $in: user.incomingFriendRequests } }, { username: 1, NPcount: 1, NFcount: 1 });
}

async function fetchValidatedGoals(username, category) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  return goalModel.find({ id: { $in: user.validatedGoalsIds }, category });
}

async function doOutgoingFriendRequestsInclude(username, queriedUsername) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  return user.outgoingFriendRequests.includes(queriedUsername);
}

async function doIncomingFriendRequestsInclude(username, queriedUsername) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  return user.incomingFriendRequests.includes(queriedUsername);
}

async function doFriendsInclude(username, queriedUsername) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  return user.friends.includes(queriedUsername);
}

async function fetchNumberOfIncomingFriendRequests(username) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  return user.incomingFriendRequests.length;
}

async function fetchMessagesFromConversation(username, conversationID, index) {
  await userModel.updateOne({ username }, { $pull: { unreadConversationIds: conversationID } });

  const conversation = await conversationModel.findOne({ id: conversationID });
  let messages = conversation.messages;

  messages.sort((m1, m2) => {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(m2.date) - new Date(m1.date);
  });

  const maxIndex = Math.floor(Math.max(messages.length - 1, 0) / N_MSG_PER_BLOCK);

  const beginIndex = index * N_MSG_PER_BLOCK;
  const endIndex = beginIndex + N_MSG_PER_BLOCK;

  messages = messages.slice(beginIndex, endIndex);

  messages.forEach((message) => {
    message.isMe = message.author == username;
  });

  return { messages, maxIndex };
}

async function fetchUnreadConversations(username) {
  const user = await userModel.findOne({ username });
  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }
  return user.unreadConversationIds;
}

async function fetchUsers(category, username, askedPageIndex) {
  const latestDateAuthorized = computeLatestDateToAppearOnRanking();
  const commitDateToUse = category + "lastCommitDate";

  const nTotalUsers = await userModel.count();

  const nTotalActiveUsers = await userModel.count({ [commitDateToUse]: { $gt: latestDateAuthorized } });

  let maxPageIndex = Math.floor(Math.max(nTotalActiveUsers - 1, 0) / RESULTS_PER_PAGE); //max in case count is 0

  if (askedPageIndex >= 0) {
    let pageIndex = Math.max(Math.min(askedPageIndex, maxPageIndex), 0);
    const users = await fetchUsersOfPage(pageIndex, category);
    return { users, maxPageIndex, page: pageIndex, myRank: -1, nTotalActiveUsers };
  }

  const user = await findUser(username);

  if (!user) {
    const users = await fetchUsersOfPage(0, category);
    return { users, maxPageIndex, page: 0, myRank: -1, nTotalUsers, nTotalActiveUsers };
  }

  const indexOfUser = await computeUserIndex(user, category);
  let pageIndex = Math.floor(indexOfUser / RESULTS_PER_PAGE);

  const users = await fetchUsersOfPage(pageIndex, category);
  return { users, maxPageIndex, page: pageIndex, myRank: indexOfUser + 1, nTotalUsers, nTotalActiveUsers };
}

function fetchUsersOfPage(pageIndex, category) {
  const nToSkip = pageIndex * RESULTS_PER_PAGE;
  const nToShow = RESULTS_PER_PAGE;
  const countToUse = category + "count";
  const commitDateToUse = category + "lastCommitDate";
  const latestDateAuthorized = computeLatestDateToAppearOnRanking();

  return userModel
    .find({ [commitDateToUse]: { $gt: latestDateAuthorized } })
    .sort({ [countToUse]: "desc", username: "desc" })
    .skip(nToSkip)
    .limit(nToShow);
}

async function fetchUsersWithQuery(category, query, askedPageIndex) {
  const regex = new RegExp(`^${query}`);

  const nUsersMatchingRegex = await userModel.count({ username: regex });

  const pageIndex = Math.max(askedPageIndex, 0); //max in case askedPageIndex is -1

  let maxPageIndex = Math.floor(Math.max(nUsersMatchingRegex - 1, 0) / RESULTS_PER_PAGE); //max in case nUsersMatchingRegex is 0

  const users = await fetchUsersOfPageWithQuery(pageIndex, category, regex);

  return { users, maxPageIndex, page: pageIndex };
}

function fetchUsersOfPageWithQuery(pageIndex, category, regex) {
  const nToSkip = pageIndex * RESULTS_PER_PAGE;
  const nToShow = RESULTS_PER_PAGE;
  const countToUse = category + "count";

  return userModel
    .find({ username: regex })
    .sort({ [countToUse]: "desc", username: "desc" })
    .skip(nToSkip)
    .limit(nToShow);
}

function findUser(username) {
  return userModel.findOne({ username });
}

async function getAllMetadatas() {
  return articleMetadataModel.find({}).sort({ index: "asc" });
}

async function getDonors() {
  return donorModel.find({}, "username").sort({ username: "desc" });
}

async function getMetadataOfPage(pageIndex) {
  const nArticles = await articleMetadataModel.count({});
  const maxPageIndex = Math.floor(Math.max(nArticles - 1, 0) / ARTICLES_PER_PAGE);
  pageIndex = Math.min(Math.max(pageIndex, 0), maxPageIndex);

  const nToSkip = pageIndex * ARTICLES_PER_PAGE;
  const nToShow = ARTICLES_PER_PAGE;

  const metadatas = await articleMetadataModel.find({}).sort({ index: "asc" }).skip(nToSkip).limit(nToShow);

  return { metadatas, maxPageIndex };
}

function getCountsMetadata(dataToRetrieve) {
  return countsMetadata[dataToRetrieve];
}

function getClient() {
  return mongoose.connection.getClient();
}

async function getMetadata(id) {
  return articleMetadataModel.findOne({ id });
}

function formattedCurrentDate(timeZone) {
  return moment().tz(timeZone).format("YYYY-MM-DD");
}

async function getAllUsers() {
  return userModel.find({});
}

async function getAllMotivationMessages() {
  return motivationMessageModel.find({});
}

async function getAllMotivationMessageSubmissions() {
  return motivationMessageSubmissionModel.find({});
}

async function getRandomMotivationMessage() {
  const result = await motivationMessageModel.aggregate([{ $sample: { size: 1 } }]);
  return result[0];
}

async function getNUsersWhoCommittedToday() {
  const today = moment().utc().subtract("1", "days").format("YYYY-MM-DD");
  return userModel.count({ $or: [{ NPlastCommitDate: today }, { NFlastCommitDate: today }] });
}

async function getUserCounts(username) {
  const user = await findUser(username);
  if (!user) {
    return {
      NFCount: -1,
      NPcount: -1,
      NFrecordCount: -1,
      NPrecordCount: -1,
      NFstreakAverage: 0,
      NPstreakAverage: 0,
    };
  }

  return {
    NFcount: user.NFcount,
    NPcount: user.NPcount,
    NFrecordCount: user.NFrecordCount,
    NPrecordCount: user.NPrecordCount,
    NFstreakAverage: user.NFstreakAverage,
    NPstreakAverage: user.NPstreakAverage,
  };
}

async function incrementUserCount(username, category, nDaysToCommit) {
  const user = await findUser(username);
  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }
  const countToIncrement = category + "count";
  const countRecord = category + "recordCount";
  const dateToUse = category + "lastCommitDate";
  const currentDate = formattedCurrentDate(user.timeZone);
  user[countToIncrement] += nDaysToCommit;
  user[dateToUse] = currentDate;

  if (user[countToIncrement] > user[countRecord]) {
    user[countRecord] = user[countToIncrement];
  }

  await user.save();

  return incrementGoals(user, category, nDaysToCommit);
}

async function incrementGoals(user, category, nDaysToCommit) {
  const currentGoalsIds = user.currentGoalsIds;

  const goals = await goalModel.find({ id: { $in: currentGoalsIds }, category });

  return Promise.all(
    goals.map((goal) => {
      const userProgress = goal.progress.find((progress) => progress.username == user.username);
      const newValue = Math.min(userProgress.count + nDaysToCommit, goal.objective);
      userProgress.count = newValue;

      for (let i = 0; i < goal.progress.length; i++) {
        if (goal.progress[i].count < goal.objective) {
          return goal.save();
        }
      }

      const todayDate = utils.todayDateUTC();
      goal.status = GOAL_STATUS.SUCCESS;
      goal.endDate = todayDate;
      return goal.save();
    })
  );
}

async function registerNewUser(user) {
  const newUser = new userModel(user);
  newUser.joinedSince = moment().utc().format();
  let commitDate;
  if (user.NFcount > 0 || user.NPcount > 0) {
    commitDate = formattedCurrentDate(user.timeZone);
  } else {
    commitDate = moment().tz(user.timeZone).subtract("1", "days").format("YYYY-MM-DD");
  }
  newUser.NFrecordCount = newUser.NFcount;
  newUser.NPrecordCount = newUser.NPcount;
  newUser.NFlastCommitDate = commitDate;
  newUser.NPlastCommitDate = commitDate;

  await newUser.save(); //newUser must be saved before creatingConversation

  const notifConvoId = "notifications" + user.username;

  await createConversation(user.username, [user.username], notifConvoId);

  const messageContent =
    "Welcome to Quitzz!  \n \n This is a read-only conversation in which will appear important notifications. \n \n \
  A regular conversation can be created by messaging a friend.\n \
  You can send a friend request to someone in the rankings by clicking on their username.";

  return addMessage("Quitzz", notifConvoId, messageContent);
}

async function relapse(username, category) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  const countToReset = category + "count";
  const averageToUse = category + "streakAverage";
  const nRelapseToUse = "n" + category + "relapse";

  user[averageToUse] = Math.round((user[averageToUse] * user[nRelapseToUse] + user[countToReset]) / ++user[nRelapseToUse]);
  user[countToReset] = 0;

  const currentDate = formattedCurrentDate(user.timeZone);
  const dateToUse = category + "lastCommitDate";
  user[dateToUse] = currentDate;

  await user.save();

  const todayDate = utils.todayDateUTC();

  await userModel.updateOne({ username }, { currentGoalsIds: [] });

  return goalModel.updateMany(
    { id: { $in: user.currentGoalsIds }, status: { $ne: GOAL_STATUS.SUCCESS } },
    { status: GOAL_STATUS.RELAPSE, endDate: todayDate, relapser: username }
  );
}

async function removeGoalInvitation(username, goalId) {
  return userModel.updateOne({ username }, { $pull: { invitationGoalsIds: goalId } });
}

async function removeFriend(username1, username2) {
  await userModel.updateOne(
    { username: username1 },
    { $pull: { friends: username2, incomingFriendRequests: username2, outgoingFriendRequests: username2 } }
  );
  return userModel.updateOne(
    { username: username2 },
    { $pull: { friends: username1, incomingFriendRequests: username1, outgoingFriendRequests: username1 } }
  );
}

async function removeFriendRequest(username, rejectedUsername) {
  await userModel.updateOne(
    { username },
    { $pull: { incomingFriendRequests: rejectedUsername, outgoingFriendRequests: rejectedUsername } }
  );
  return userModel.updateOne(
    { username: rejectedUsername },
    { $pull: { incomingFriendRequests: username, outgoingFriendRequests: username } }
  );
}

async function removeMemberFromConversation(conversationID, username) {
  if (conversationID.includes("notifications")) {
    throw CUSTOM_ERRORS.unmodifiableConversation;
  }
  await userModel.updateOne(
    { username: username },
    { $pull: { conversationIds: conversationID, unreadConversationIds: conversationID } }
  );

  await conversationModel.updateOne({ id: conversationID }, { $pull: { members: username } });

  await conversationModel.deleteOne({ id: conversationID, members: { $size: 0 } });
}

async function saveSubmission(data) {
  const submission = new motivationMessageSubmissionModel(data);
  await submission.save();
}

function sendFeedbackEmail(sender, feedback) {
  return sendFeedback(sender, feedback);
}

async function sendFriendRequest(sender, receiver) {
  const senderUser = await findUser(sender);

  if (!senderUser) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  if (senderUser.friends.length >= MAX_FRIENDS_PER_PERSON) {
    throw CUSTOM_ERRORS.tooManyFriends;
  }

  await userModel.updateOne({ username: receiver }, { $addToSet: { incomingFriendRequests: sender } });

  return userModel.updateOne({ username: sender }, { $addToSet: { outgoingFriendRequests: receiver } });
}

async function sendNotifToEveryone(content) {
  const users = await userModel.find({}, { username: 1 });

  const promises = users.map((user) => addMessage("Quitzz", "notifications" + user.username, content));

  return Promise.all(promises);
}

async function sendPasswordResetToken(username) {
  const user = await findUser(username);

  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  const resetToken = await resetTokenModel.findOneAndUpdate(
    { username: user.username },
    { username: user.username }, //update argument
    { new: true, upsert: true } //upsert: create one if not exist
  ); //new: true so it returns the object after modification

  let plainTextToken = crypto.randomBytes(32).toString("hex");
  resetToken.token = await utils.hash(plainTextToken);
  resetToken.expiration = moment().utc().add(PASSWORD_RESET_TOKEN_MINS, "milliseconds").format();
  await resetToken.save();

  const urlToSend = "https://www.quitzz.com/reset-password/username/" + username + "/token/" + plainTextToken;

  await sendPasswordResetLink(urlToSend, user.username, user.email);

  return plainTextToken;
  //TODO send by mail
}

async function setUserCount(username, category, newValue) {
  const user = await findUser(username);
  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }
  const countToIncrement = category + "count";
  const countRecord = category + "recordCount";
  const dateToUse = category + "lastCommitDate";
  const currentDate = formattedCurrentDate(user.timeZone);
  user[countToIncrement] = newValue;
  user[dateToUse] = currentDate;

  if (user[countToIncrement] > user[countRecord]) {
    user[countRecord] = user[countToIncrement];
  }
  return user.save();
}

async function setUserObjective(username, category, newValue) {
  const user = await findUser(username);
  if (!user) {
    throw CUSTOM_ERRORS.usernameNotExist;
  }

  const objectiveToIncrement = category + "objective";
  const progress = category + "objProgress";

  if (user[progress] >= user[objectiveToIncrement]) {
    user[progress] = 0;
  }

  user[objectiveToIncrement] = newValue;

  return user.save();
}

async function swapArticles(id1, id2) {
  const metadata1 = await articleMetadataModel.findOne({ id: id1 });
  const metadata2 = await articleMetadataModel.findOne({ id: id2 });

  const indexCopy = metadata2.index;
  metadata2.index = metadata1.index;
  metadata1.index = indexCopy;

  await metadata1.save();
  return metadata2.save();
}

function updateEmail(username, email) {
  return userModel.findOneAndUpdate({ username }, { email: email });
}

function updateMotto(username, motto) {
  return userModel.findOneAndUpdate({ username }, { motto: motto });
}

function updateTimeZone(username, timeZone) {
  return userModel.findOneAndUpdate({ username }, { timeZone: timeZone });
}

async function updatePassword(username, plainTextToken, passwordHash) {
  const token = await resetTokenModel.findOne({ username });
  if (!token) {
    throw CUSTOM_ERRORS.noPasswordResetTokenFound;
  }

  const expirationDate = token.expiration;

  if (!expirationDate) {
    throw CUSTOM_ERRORS.passwordResetTokenExpired;
  }

  if (moment(expirationDate).isBefore(moment.now())) {
    throw CUSTOM_ERRORS.passwordResetTokenExpired;
  }
  const isSame = await utils.comparePlainTextWithHash(plainTextToken, token.token);

  if (!isSame) {
    throw CUSTOM_ERRORS.resetTokenNotMatch;
  }

  await userModel.updateOne({ username }, { password: passwordHash });
  await resetTokenModel.deleteOne({ username });
}

async function updateGoalObjective(id, newValue) {
  return goalModel.updateOne({ id, status: GOAL_STATUS.ON_GOING }, { objective: newValue });
}

function userExists(username) {
  return userModel.exists({ username });
}

async function acknowledge(username, goalID) {
  const goal = await goalModel.findOne({ id: goalID });

  if (goal.status == GOAL_STATUS.SUCCESS) {
    return validateGoal(username, goalID);
  }
  if (goal.status == GOAL_STATUS.RELAPSE) {
    return removeGoalFromUser(username, goalID);
  }
}

async function validateGoal(username, goalID) {
  return userModel.updateOne(
    { username },
    { $pull: { currentGoalsIds: goalID }, $addToSet: { validatedGoalsIds: goalID } }
  );
}

async function removeGoal(username, goalID) {
  const goal = await goalModel.findOne({ id: goalID });

  if (!goal) {
    throw CUSTOM_ERRORS.goalNotExist;
  }

  if (username != goal.creator) {
    throw CUSTOM_ERRORS.removingGoalOfSomeoneElse;
  }

  const participants = [];

  goal.progress.forEach((progressData) => participants.push(progressData.username));

  await userModel.updateMany({ username: { $in: participants } }, { $pull: { currentGoalsIds: goalID } });
  return goalModel.deleteOne({ id: goalID });
}

async function removeGoalFromUser(username, goalID) {
  return userModel.updateOne({ username }, { $pull: { currentGoalsIds: goalID } });
}

module.exports = {
  connectToMongo,
  getClient,
  findUser,
  userExists,
  getDonors,
  computeUserIndex,
  fetchUsers,
  fetchUsersWithQuery,
  registerNewUser,
  incrementUserCount,
  computeNDaysToCommit,
  timeZones,
  sendPasswordResetToken,
  updatePassword,
  getUserCounts,
  updateTimeZone,
  updateEmail,
  updateMotto,
  getRandomMotivationMessage,
  relapse,
  getCountsMetadata,
  saveSubmission,
  setUserCount,
  setUserObjective,
  getAllUsers,
  getAllMotivationMessageSubmissions,
  getAllMotivationMessages,
  createArticleMetadata,
  deleteArticleMetadata,
  editArticleMetadata,
  getAllMetadatas,
  getMetadata,
  swapArticles,
  getMetadataOfPage,
  createConversation,
  fetchConversation,
  fetchConversations,
  fetchMessagesFromConversation,
  addMessage,
  addMembersToConversation,
  removeMemberFromConversation,
  fetchUnreadConversations,
  fetchFriends,
  sendFriendRequest,
  fetchIncomingFriendRequests,
  doOutgoingFriendRequestsInclude,
  doFriendsInclude,
  addFriend,
  removeFriendRequest,
  removeFriend,
  fetchNumberOfIncomingFriendRequests,
  doIncomingFriendRequestsInclude,
  updateGoalObjective,
  validateGoal,
  acknowledge,
  fetchInvitationGoals,
  fetchGoals,
  fetchGoal,
  createGoal,
  fetchValidatedGoals,
  sendFeedbackEmail,
  addMemberToGoal,
  removeGoalInvitation,
  removeGoal,
  sendNotifToEveryone,
};
