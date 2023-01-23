const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { GITLAB_PATH_ARTICLE_IMAGES, GITLAB_PAGES_URL } = require("../constants");
const {log} = require("../utils/logger");

async function sendImageToRepository(base64) {
  const id = uuidv4();
  trimmedBase64 = base64.substr(base64.indexOf(",") + 1);
  const body = {
    branch: "main",
    commit_message: id,
    encoding: "base64",
    content: trimmedBase64,
  };

  const index = base64.indexOf("/") + 1;
  const fileExtension = base64.substr(index, base64.indexOf(";") - index);
  const fileName = id + "." + fileExtension;

  const path = encodeURIComponent(GITLAB_PATH_ARTICLE_IMAGES + fileName);

  try {
    await axios.post("https://gitlab.com/api/v4/projects/35609224/repository/files/" + path, body, {
      headers: {
        Authorization: "Bearer " + process.env.GITLAB_ACCESS_TOKEN,
      },
    });
    return {linkToImage: GITLAB_PAGES_URL + GITLAB_PATH_ARTICLE_IMAGES + fileName, imageInternalFilePath: path, imageFileName: fileName};
  } catch (err) {
    log("error: " + err.data);
  }
}

async function deleteImageFromRepository( metadata) {
  const fileName = metadata.imageFileName;

  const path = metadata.imageInternalFilePath;

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
  sendImageToRepository,
  deleteImageFromRepository,
};

//'branch is missing, branch is empty, commit_message is missing, commit_message is empty, content is missing'
