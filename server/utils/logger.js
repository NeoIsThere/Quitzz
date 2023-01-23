const fs = require("fs");
const path = require("path");

let accessLogStream;

function setupWriteStream() {
  accessLogStream = fs.createWriteStream("./persistent-data/access.log", { flags: "a" });
  return accessLogStream;
}

function log(text) {
  console.log(text);
  accessLogStream.write(text + "\n");
}

module.exports = {
  setupWriteStream,
  log,
};
