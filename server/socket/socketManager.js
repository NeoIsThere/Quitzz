const { VALID_CHANNELS, MAX_MSG_LENGTH, MAX_CHANNEL_SIZE } = require("../constants");
const { validateTypes, isFunction } = require("../utils/utils");
const { getLatestMessages, pushMessage, getNextMessagesAfter, deleteMessage } = require("./chat");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const { log } = require("../utils/logger");

const rateLimiter = new RateLimiterMemory({
  points: 4, // 4 points
  duration: 1, // per second
});

function configureSocket(socket, io) {
  socket.on("join", async (channelLabel, callback) => {
    try {
      await rateLimiter.consume(socket.handshake.headers['x-forwarded-for']); // consume 1 point per event from IP

      if (!validateTypes([channelLabel], "string")) {
        return;
      }

      if (!VALID_CHANNELS.includes(channelLabel)) {
        return;
      }

      if (!isFunction(callback)) {
        return;
      }

      leaveAllRooms(socket);
      socket.join(channelLabel);
      const latestMessages = getLatestMessages(channelLabel);
      callback(latestMessages);
    } catch (err) {
      // no available points to consume
      socket.emit("rate-limit");
    }
  });

  socket.on("leave", () => {
    leaveAllRooms(socket);
  });

  socket.on("post-message", async (channelLabel, message) => {
    try {
      await rateLimiter.consume(socket.handshake.headers['x-forwarded-for']);

      if (!validateTypes([channelLabel, message], "string")) {
        return;
      }
      if (!VALID_CHANNELS.includes(channelLabel)) {
        return;
      }
      if (message.length <= 0 || message.length > MAX_MSG_LENGTH) {
        return;
      }

      const messageWithAuthor = { content: message, author: socket.request.session.username };
      const messageWithId = pushMessage(channelLabel, messageWithAuthor);

      io.to(channelLabel).emit("get-message", messageWithId);
    } catch (rejRes) {
      socket.emit("rate-limit");
    }
  });

  socket.on("get-messages-after", async (channelLabel, id, callback) => {
    try {
      await rateLimiter.consume(socket.handshake.headers['x-forwarded-for']);

      if (!validateTypes([channelLabel, id], "string")) {
        return;
      }

      if (!VALID_CHANNELS.includes(channelLabel)) {
        return;
      }

      if (!isFunction(callback)) {
        return;
      }

      const messages = getNextMessagesAfter(channelLabel, id);
      callback(messages);
    } catch {
      socket.emit("rate-limit");
    }
  });

  socket.on("delete", async (channelLabel, id) => {
    try {
      await rateLimiter.consume(socket.handshake.headers['x-forwarded-for']);

      if (!validateTypes([channelLabel, id], "string")) {
        return;
      }
      if (!VALID_CHANNELS.includes(channelLabel)) {
        return;
      }

      const username = socket.request.session.username;

      if (username != "Neo") {
        log("you are not Neo");
        return;
      }

      deleteMessage(channelLabel, id);
      io.to(channelLabel).emit("delete-message", id);
    } catch {
      socket.emit("rate-limit");
    }
  });
}

function leaveAllRooms(socket) {
  socket.rooms.forEach((room) => socket.leave(room));
}

module.exports = {
  configureSocket,
};
