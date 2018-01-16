let express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
util = require('./util/util');

let port = process.env.PORT || 5001;

let ChatRoomUsers = [];
let AllActiveChatRoomHistory = {};

io.on('connection', (socket) => {
  console.log('::Server::socket.io::connection A client connected... Id: ', socket.id);

  socket.on('room', (clientDetails) => {
    console.log('::Server::socket.io::room ', clientDetails.roomName, ' from: ', socket.id);
    let user = {
      id: socket.id,
      roomName: clientDetails.roomName,
      socket: socket,
      username: clientDetails.username
    };
    if (util.areTwoUsersInRoom(ChatRoomUsers, user)) {
      socket.emit('cannot join', 'Game Room is already occupied by two users in the ChatRoom.');
      return;
    }

    socket.join(clientDetails.roomName);
    ChatRoomUsers.push(user);
    let data = {
      senderId: socket.id,
      username: clientDetails.username
    };
    io.in(clientDetails.roomName).emit('join room', data);
    console.log('::Server::socket.io::room Number of ChatRoomUsers: ', ChatRoomUsers.length);

    if (!AllActiveChatRoomHistory[clientDetails.roomName]) {
      AllActiveChatRoomHistory[clientDetails.roomName] = [];
    }
  });

  socket.on('confirm', (receiverId) => {
    console.log('::Server::socket.io.confirm id: ', receiverId);
    if (receiverId !== socket.id) {
      let sockt = util.checkBothUsersInSameRoom(ChatRoomUsers, socket, receiverId);
      if (sockt === false) {
        console.log('::Server::socket.io.confirm both the users not in same room');
        return;
      }
      let roomName = util.getRoomName(ChatRoomUsers, socket.id);
      if (roomName === null) {
        return;
      }
      console.log(AllActiveChatRoomHistory);
      console.log(AllActiveChatRoomHistory[roomName]);
      let data = {
        user2Id: socket.id,
        chatHistory: AllActiveChatRoomHistory[roomName],
        username: util.getUserName(ChatRoomUsers, socket.id)
      };
      sockt.emit('confirm user2', data);
    }
  });

  socket.on('msg send event', (msgDetails) => {
    console.log('::Server::socket.io::msg send event Message received: ', msgDetails, ' from: ', socket.id);
    msgDetails = JSON.parse(msgDetails);
    let newMsg = {
      sender: socket.id,
      msg: msgDetails.msg,
      senderName: msgDetails.senderName
    };
    let sockt = util.checkBothUsersInSameRoom(ChatRoomUsers, socket, msgDetails.receiver);
    if (sockt === false) {
      console.log('::Server::socket.io::msg send event both the users not in same room');
      return;
    }
    let message = msgDetails.senderName + ' : ' + msgDetails.msg;
    AllActiveChatRoomHistory[msgDetails.roomName].push(message);
    console.log('::Server::socket.io::msg send event AllActiveChatRoomHistory: ', AllActiveChatRoomHistory);
    sockt.emit('msg receive event', newMsg);
  });

  socket.on('disconnect', () => {
    let roomName = util.getRoomName(ChatRoomUsers, socket.id);
    if (roomName === null) {
      console.log('::Server::socket.io::disconnect something blew up here');
      return;
    }
    ChatRoomUsers = util.removeUserFromServer(ChatRoomUsers, socket.id);
    if (util.checkRoomIsEmpty(ChatRoomUsers, roomName)) {
      console.log('::Server::socket.io::disconnect room: ', roomName, ' is now empty. Destroying the room...');
      delete AllActiveChatRoomHistory[roomName];
      console.log(AllActiveChatRoomHistory);
    }
    console.log('::Server::socket.io::disconnect A client disconnected... Id: ', socket.id);
    console.log('Number of ChatRoomUsers: ', ChatRoomUsers.length);
    io.in(roomName).emit('user left', socket.id);
  });
});

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.set('port', port);
http.listen(app.get('port'), () => {
  console.log('chat app is running on port: ', app.get('port'));
});
