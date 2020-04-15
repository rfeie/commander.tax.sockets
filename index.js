// Setup basic express server
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;
var cors = require("cors");
var merge = require("lodash").merge;
server.listen(port, function () {
  console.log("Server listening at port %d", port);
});
const sandbox = process.env.SANDBOX;
const players = (process.env.ALLOWED_PLAYERS || "").split(",");
var whitelist = ["http://example1.com", "http://example2.com"];
let state = {};
let activePlayers = {};
const corsOptions = {
  origin: sandbox,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
io.origins((origin, callback) => {
  console.log("origin", { origin, sandbox, valid: origin === sandbox });
  if (origin !== sandbox) {
    return callback("origin not allowed", false);
  }
  callback(null, true);
});
app.use(express.static("public"));
app.use(cors(corsOptions));

var numUsers = 0;

const formatPlayers = (players) => Object.keys(players);

io.on("connection", function (socket) {
  let username = null;

  socket.on("PLAYER_LOGIN", function (data) {
    // we tell the client to execute 'new message'
    const name = data.name;
    if (players.indexOf(name) > -1) {
      console.log("PLAYER_LOGIN_SUCCESS: ", { data });

      socket.emit("PLAYER_LOGIN_SUCCESS", state);
      if (!activePlayers[name]) {
        username = name;
        activePlayers[name] = {
          loginTime: Date.now(),
        };
        socket.emit("PLAYER_LIST_UPDATE", formatPlayers(activePlayers));
        socket.broadcast.emit(
          "PLAYER_LIST_UPDATE",
          formatPlayers(activePlayers)
        );
      }
    } else {
      console.log("PLAYER_LOGIN FAIL: ", { data });
      socket.emit("PLAYER_LOGIN_FAIL");
    }
  });

  socket.on("UPDATE_GAMESTATE", function (data) {
    state = data
    socket.emit("GAMESTATE_UPDATED", state);
    socket.broadcast.emit("GAMESTATE_UPDATED", state);
  });

  // when the user disconnects.. perform this
  socket.on("disconnect", function () {
    if (activePlayers[username]) {
      delete activePlayers[username];
      socket.broadcast.emit("PLAYER_LIST_UPDATE", formatPlayers(activePlayers));
    }
  });
});
