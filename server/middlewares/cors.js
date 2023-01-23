cors = require("cors");
const {log} = require("../utils/logger");

const whitelist = new Set(process.env.CORS_ALLOWED_ORIGINS.split(","));

const corsOptions = {
  optionsSuccessStatus: 200,
  origin: function (origin, callback) {

    if (!origin || whitelist.has(origin)) {
      //origin is undefined when request performed in origin being the same as destination
      //(i.e., opening the server URL on a web browser, postman...)
      callback(null, true);
    } else {
      log("error: " + origin + " not allowed");
      callback(new Error("not allowed from this url"));
    }
  },
  credentials: true,
};

module.exports = cors(corsOptions);
