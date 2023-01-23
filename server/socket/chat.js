const { N_MSG_PER_BLOCK, MAX_CHANNEL_SIZE, WRITE_TO_FILE_CYCLE_DURATION } = require("../constants");
const { v4: uuidv4 } = require("uuid");
const { LinkedList } = require("./linkedlist");
const fs = require("fs");
const moment = require("moment-timezone");

const global1 = new LinkedList();
const global2 = new LinkedList();
const global3 = new LinkedList();

const channels = [global1, global2, global3];

/*function TEMP_INIT() {
  for (let i = 0; i < 19; i++) {
    global1.push({
      id: i.toString(),
      content: i,
      author: "test",
    });
  }
}*/

async function writeMessageToFile(chat, channelLabel, message) {
  const filename = labelToFileName(channelLabel);
  await fs.promises.appendFile("./persistent-data/" + filename, JSON.stringify(message) + "\n" + "\n", "utf8");
}

function labelToFileName(channelLabel) {
  switch (channelLabel) {
    case "C1":
      return "c1.log";
    case "C2":
      return "c2.log";
    case "C3":
      return "c3.log";
    default:
      return "c1.log";
  }
}

function labelToIndex(channelLabel) {
  switch (channelLabel) {
    case "C1":
      return 0;
    case "C2":
      return 1;
    case "C3":
      return 2;
    default:
      return 0;
  }
}

function getLatestMessages(channelLabel) {
  const channelIndex = labelToIndex(channelLabel);
  return channels[channelIndex].getNLatest(N_MSG_PER_BLOCK);
}

function getNextMessagesAfter(channelLabel, id) {
  const channelIndex = labelToIndex(channelLabel);

  const node = channels[channelIndex].findNode((data) => data.id == id);
  if (!node) {
    return [];
  }
  return channels[channelIndex].getNAfter(node, N_MSG_PER_BLOCK);
}

function pushMessage(channelLabel, message) {
  const channelIndex = labelToIndex(channelLabel);

  const id = uuidv4();
  message.id = id;
  message.date = moment().utc();

  channels[channelIndex].push(message);

  writeMessageToFile(channels[channelIndex], channelLabel, message);

  prune(channelLabel);

  return message;
}

function deleteMessage(channelLabel, id) {
  const channelIndex = labelToIndex(channelLabel);

  channels[channelIndex].pop((data) => data.id == id);
}

function prune(channelLabel) {
  const channelIndex = labelToIndex(channelLabel);
  const channelSize = getChannelSize(channelLabel);

  if (channelSize <= MAX_CHANNEL_SIZE) {
    return;
  }

  const NtoRemove = channelSize - MAX_CHANNEL_SIZE;
  channels[channelIndex].popNFirst(NtoRemove);
}

function getChannelSize(channelLabel) {
  const channelIndex = labelToIndex(channelLabel);
  return channels[channelIndex].size;
}

module.exports = {
  getLatestMessages,
  getNextMessagesAfter,
  pushMessage,
  deleteMessage,
  getChannelSize,
};
