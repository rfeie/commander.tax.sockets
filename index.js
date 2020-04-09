// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var cors = require('cors')
var merge = require('lodash').merge
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
const sandbox = process.env.SANDBOX;
const players = (process.env.ALLOWED_PLAYERS || '').split(',') 
var whitelist = ['http://example1.com', 'http://example2.com']
let state = {}
const corsOptions = {
  origin: sandbox,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
io.origins((origin, callback) => {
  console.log('origin', {origin, sandbox, valid: origin === sandbox})
  if (origin !== sandbox) {
    return callback('origin not allowed', false);
  }
  callback(null, true);
});
app.use(express.static('public'));
app.use(cors(corsOptions));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

//   setTimeout(() => {
//         socket.broadcast.emit('GAMESTATE_UPDATED', {
//         users: players
//     });

//   }, 1000)

  socket.on('PLAYER_LOGIN', function (data) {
    // we tell the client to execute 'new message'
    const name = data.name
    if (players.indexOf(name) > -1) {
              console.log('PLAYER_LOGIN_SUCCESS: ', {data})

      socket.emit('PLAYER_LOGIN_SUCCESS', state)
    } else {
        console.log('PLAYER_LOGIN FAIL: ', {data})
        socket.emit('PLAYER_LOGIN_FAIL')
    }
    // socket.broadcast.emit('new message', {
    //   username: socket.username,
    //   message: data
    // });
  });
  
    socket.on('UPDATE_GAMESTATE', function (data) {
    // we tell the client to execute 'new message'
//     const name = data.name
      state = merge(state, data)
            socket.emit('GAMESTATE_UPDATED', state)

//     if (players.indexOf(name) > -1) {
//               console.log('PLAYER_LOGIN_SUCCESS: ', {data})

//       socket.emit('PLAYER_LOGIN_SUCCESS', state)
//     } else {
//         console.log('PLAYER_LOGIN FAIL: ', {data})
//         socket.broadcast.emit('PLAYER_LOGIN_FAIL')
//     }
    // socket.broadcast.emit('new message', {
    //   username: socket.username,
    //   message: data
    // });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});