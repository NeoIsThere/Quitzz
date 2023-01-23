const axios = require("axios");
const { GITLAB_PATH_ARTICLE_CONTENTS, GITLAB_PAGES_URL } = require("../constants");
const { log } = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");

async function sendFileToRepository(file) {
  const uuid = uuidv4();
  const date = moment().utc().format();

  const body = {
    branch: "main",
    commit_message: uuid,
    content: file.data.toString("utf8"),
  };
  const fileExtension = file.name.substr(file.name.lastIndexOf("."));

  const fileName = uuid + fileExtension;

  const path = encodeURIComponent(GITLAB_PATH_ARTICLE_CONTENTS + fileName);

  try {
    await axios.post("https://gitlab.com/api/v4/projects/35609224/repository/files/" + path, body, {
      headers: {
        Authorization: "Bearer " + process.env.GITLAB_ACCESS_TOKEN,
      },
    });
    return {
      id: uuid,
      date,
      linkToArticle: GITLAB_PAGES_URL + GITLAB_PATH_ARTICLE_CONTENTS + fileName,
      fileName,
      articleInternalFilePath: path,
    };
  } catch (err) {
    log("error: " + err);
  }
}

async function deleteFileFromRepository(metadata) {
  const path = metadata.articleInternalFilePath;
  const fileName = metadata.fileName;

  const body = {
    branch: "main",
    commit_message: "deleted " + fileName,
  };
  try {
    await axios.delete("https://gitlab.com/api/v4/projects/35609224/repository/files/" + path, {
      data: body,
      headers: {
        Authorization: "Bearer " + process.env.GITLAB_ACCESS_TOKEN,
      },
    });
  } catch (err) {
    log("error: " + err);
  }
}

module.exports = {
  sendFileToRepository,
  deleteFileFromRepository,
};
