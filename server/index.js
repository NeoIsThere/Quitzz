const express = require("express");
const http = require("http");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const database = require("./database/database");
const app = express();
const corsMiddleWare = require("./middlewares/cors");
const httpServer = http.createServer(app);
const authenticate = require("./middlewares/authenticate");
const { loginRouter } = require("./login/login");
const morgan = require("morgan");
const unprotectedRouter = require("./router/unprotectedRouter");
const protectedRouter = require("./router/protectedRouter");
const {
  MAX_PAYLOAD_SIZE,
  SESSION_ID_EXPIRATION,
  PRIVATE_KEY_COOKIE_SIGNATURE,
  SOCKET_MAX_MSG_SIZE,
  STATUS_CODES,
  GLOBAL_RATE_LIMITER,
} = require("./constants");
const moment = require("moment-timezone");
const rateLimit = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const requestIp = require("request-ip");
const logger = require("./utils/logger");
const { configureSocket } = require("./socket/socketManager");
let sessionMiddleware;
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: SOCKET_MAX_MSG_SIZE,
  cors: { origin: process.env.CORS_ALLOWED_ORIGINS.split(","), credentials: true },
});

main();

async function main() {
  //process.stdout.write("\033c");

  const accessLogStream = logger.setupWriteStream();

  logger.log(moment().utc().format());

  await database.connectToMongo();

  const mongoClient = database.getClient();
  const store = MongoStore.create({ client: mongoClient });
  sessionMiddleware = expressSession({
    store: store,
    secret: PRIVATE_KEY_COOKIE_SIGNATURE /*used to sign the cookie, to make sure the server created it*/,
    saveUninitialized: false /*do not store an empty session object in database */,
    resave: false /*forces session object to be updated in database whether it was modified or not*/,
    cookie: {
      secure: true, //if true: only set cookie over httpS ////////////////must be true in production
      httpOnly: true, //if true: prevents client side JS from reading the cookie
      maxAge: SESSION_ID_EXPIRATION,
      sameSite:
        "lax" /*sameSite attribute is used to declare the intent of the cookies (third party or not). Three modes are available: strict, lax and none.
      lax means that cross-site subrequests (e.g., loading images from another website) won't send cookies but navigating to another
      website will. Whereas with strict, navigating from website A to B would not send cookies. (This only concerns requests initiated by a website A to a website B).*/,
    },
  });

  app.enable("trust proxy"); //trust the headers transmitted by the reverse proxy (nginx)

  app.use(requestIp.mw()); //puts correct IP address in req.clientIp

  app.use(sessionMiddleware);

  //write logs in console
  app.use(
    morgan((tokens, req, res) => {
      return formatLog(tokens, req, res);
    })
  );
  //write logs in file
  app.use(
    morgan(
      (tokens, req, res) => {
        return formatLog(tokens, req, res);
      },
      { stream: accessLogStream }
    )
  );

  app.options("*", corsMiddleWare);
  app.use(corsMiddleWare);

  app.use(GLOBAL_RATE_LIMITER);

  app.use(express.urlencoded({ extended: true })); //for HTTP methods containing body: when sending string or arrays directly
  app.use(express.json({ limit: MAX_PAYLOAD_SIZE })); //for HTTP methods containing body: when sending JSON
  app.use(fileUpload()); //for Content-Type = multipart/form-data (file upload)

  app.use(loginRouter);
  app.use(unprotectedRouter);
  app.use(authenticate);
  app.use(protectedRouter);

  app.use((err, req, res, next) => {
    logger.log("exception caught @ index.js: " + err);
  });

  //setupSocketIO(); //chat is disabled for now

  httpServer.listen(8080, () => logger.log("V.01-20-2023; server listening on port 8080"));
}

function formatLog(tokens, req, res) {
  const status = tokens.status(req, res);
  const adminIP = process.env.ADMIN_IP;
  const clientIp = req.clientIp;
  let adminIPMarker = "";

  let statusToOutput = status;
  if (status >= 400) {
    statusToOutput += " ****";
  }

  if (adminIP == clientIp) {
    adminIPMarker = "(me) |||";
  }

  return [
    "-------------------------\n",
    adminIPMarker,
    tokens.method(req, res),
    "|||",
    tokens.url(req, res),
    "|||",
    statusToOutput,
    "|||",
    req.clientIp,
    "|||",
    tokens["response-time"](req, res) + " ms",
    "|||",
    "@ " + tokens.date(req, res),
    "|||",
  ].join(" ");
}

async function setupSocketIO() {
  const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

  io.use(wrap(sessionMiddleware));

  // only allow authenticated users
  io.use(async (socket, next) => {
    const session = socket.request.session;

    if (session && session.username) {
      const username = session.username;
      const user = await database.findUser(username);
      if (!user) {
        log("socket.io authenticate error: " + "user has a session but username not found in DB");
        next(new Error(STATUS_CODES.UNAUTHORIZED));
        return;
      }
      next();
      return;
    }
    next(new Error(STATUS_CODES.UNAUTHORIZED));
  });

  io.on("connection", (socket) => {
    configureSocket(socket, io);
  });
}
