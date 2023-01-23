const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  timeZone: String,
  motto: { type: String, default: "" },
  NFlastCommitDate: String,
  NPlastCommitDate: String,
  NFcount: Number,
  NPcount: Number,
  NFrecordCount: { type: String, default: 0 },
  NPrecordCount: { type: String, default: 0 },
  joinedSince: String,
  conversationIds: { type: [String], default: [] },
  unreadConversationIds: { type: [String], default: [] },
  friends: { type: [String], default: [] },
  incomingFriendRequests: { type: [String], default: [] },
  outgoingFriendRequests: { type: [String], default: [] },
  nNFrelapse: { type: Number, default: 0 },
  nNPrelapse: { type: Number, default: 0 },
  NFstreakAverage: { type: Number, default: 0 },
  NPstreakAverage: { type: Number, default: 0 },
  currentGoalsIds: { type: [String], default: [] },
  validatedGoalsIds: { type: [String], default: [] },
  invitationGoalsIds: {type: [String], default: []},
  conversations: Array,////////////////////
  NFobjective: Number,////////////////////
  NPobjective: Number,////////////////////
  NFobjProgress: Number,////////////////////
  NPobjProgress: Number,////////////////////
});

const donorSchema = new Schema({
  username: String,
});

const passwordResetTokenSchema = new Schema({
  username: String,
  token: String,
  expiration: String,
});

const motivationMessageSchema = new Schema({
  message: String,
  author: String,
});

const motivationMessageSubmissionSchema = new Schema({
  username: String,
  message: String,
  date: String,
  IP: String,
});

const articleMetadataSchema = new Schema({
  id: String,
  index: Number,
  name: String,
  author: String,
  summary: String,
  tag: String,
  imageCreditAuthor: String,
  imageCreditLink: String,
  fileName: String,
  imageFileName: String,
  date: String,
  linkToArticle: String,
  linkToImage: String,
  articleInternalFilePath: String,
  imageInternalFilePath: String,
  nViews: { type: Number, default: 0 },
});

const messageSchema = new Schema({
  id: String,
  content: String,
  author: String,
  isMe: Boolean,
  date: Date,
});

const conversationSchema = new Schema({
  id: String,
  members: [String],
  messages: [messageSchema],
  latestMessageDate: Date,
});

const goalSchema = new Schema({
  id: String,
  creator: String,
  objective: Number,
  progress: [{ username: String, count: Number }],
  status: String,
  category: String,
  relapser: String,
  endDate: Date,
});

const user = mongoose.model("users", userSchema);
const donor = mongoose.model("donors", donorSchema);
const passwordResetToken = mongoose.model("passwordResetTokens", passwordResetTokenSchema);
const motivationMessage = mongoose.model("motivationMessages", motivationMessageSchema);
const motivationMessageSubmission = mongoose.model("motivationMessageSubmissions", motivationMessageSubmissionSchema);
const articleMetadata = mongoose.model("articleMetadatas", articleMetadataSchema);
const message = mongoose.model("messages", messageSchema);
const conversation = mongoose.model("conversations", conversationSchema);
const goal = mongoose.model("goals", goalSchema);

module.exports = {
  user,
  donor,
  passwordResetToken,
  motivationMessage,
  motivationMessageSubmission,
  articleMetadata,
  message,
  conversation,
  goal,
};
