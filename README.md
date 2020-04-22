# Socket.IO Chat
A simple [chat demo](https://github.com/socketio/socket.io/tree/master/examples/chat) using the  [socket.io](http://socket.io/) real-time bidirectional event library for Node.js.


## Actions:

### connection
- framework action


### PLAYER_LOGIN
- Inbound

### PLAYER_LOGIN_SUCCESS
- Outbound
- Reply

### PLAYER_LOGIN_FAIL
- Outbound
- Reply

### PLAYER_LIST_UPDATE
- Outbound
- Broadcast


### UPDATE_GAMESTATE
- Inbound

### UPDATED_GAMESTATE
- Outbound
- Reply
- Broadcast

### PLAYER_UPDATE

### disconnect
- framework action
