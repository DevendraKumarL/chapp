let express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
  util = require('./util/util');

let port = process.env.PORT || 5001;

let Players = [];

io.on('connection', (socket) => {
  console.log('::Server::socket.io::connection A client connected... Id: ', socket.id);

  socket.on('room', (details) => {
    console.log('::Server::socket.io::room ', details.roomname, ' from: ', socket.id, ' username: ', details.username);
    var player = {
      id: socket.id,
      roomname: details.roomname,
      username: details.username,
      socket: socket
    };
    if (util.areTwoPlayersInRoom(Players, player)) {
      socket.emit('cannot join', 'room occupied');
      return;
    }
    socket.join(details.roomname);
    Players.push(player);
    io.in(details.roomname).emit('join room', socket.id);
  });

  socket.on('confirm', (receiverId) => {
    console.log('::Server::socket.io.confirm id: ', receiverId);
    if (receiverId !== socket.id) {
      var sockt = util.checkBothPlayersInSameRoom(Players, socket, receiverId);
      if (sockt === false) {
        return;
      }
      sockt.emit('confirm player2', socket.id);
    }
  });

  socket.on('msg send event', (msg) => {
    console.log('::Server::socket.io::msg send event Message received: ', msg.msg, ' from: ', socket.id, ' username: ', msg.senderName);
    msg = JSON.parse(msg);
    var sockt = util.checkBothPlayersInSameRoom(Players, socket, msg.receiver);
    if (sockt === false) {
        return;
    }
    let data = {
      msg: msg.msg,
      sender: socket.id,
      senderName: msg.senderName
    };
    sockt.emit('msg receive event', data);
  });

  socket.on('disconnect', () => {
    Players = util.removePlayer(Players, socket.id);
    console.log('::Server::socket.io::disconnect A client disconnected... Id: ', socket.id);
    console.log('Number of players: ', Players.length);
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
