let express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    util = require('./util/util');

let port = process.env.PORT || 5001;

let Players = [];

io.on('connection', (socket) => {
    console.log('::Server::socket.io::connection A client connected... Id: ', socket.id);

    socket.on('room', (roomDetails) => {
        console.log('::Server::socket.io::room ', roomDetails.roomName, ' from: ', socket.id);
        let player = {
            id: socket.id,
            roomName: roomDetails.roomName,
            socket: socket
        };
        if (util.areTwoPlayersInRoom(Players, player)) {
            socket.emit('cannot join', 'Game Room is already occupied by two players.');
            return;
        }

        socket.join(roomDetails.roomName);
        Players.push(player);
        io.in(roomDetails.roomName).emit('join room', socket.id);
        console.log('::Server::socket.io::room Number of Players: ', Players.length);
    });

	socket.on('confirm', (receiverId) => {
	    console.log('::Server::socket.io.confirm id: ', receiverId);
	    if (receiverId !== socket.id) {
	        let sockt = util.checkBothPlayersInSameRoom(Players, socket, receiverId);
	        if (sockt === false) {
	            return;
	        }
	        sockt.emit('confirm player2', socket.id);
	    }
	});

	socket.on('msg send event', (msg) => {
	    console.log('::Server::socket.io::msg send event Message received: ', msg, ' from: ', socket.id);
	    msg = JSON.parse(msg);
	    let newMsg = {
	        sender: socket.id,
            msg: msg.msg,
            senderName: msg.senderName
	    };
	    let sockt = util.checkBothPlayersInSameRoom(Players, socket, msg.receiver);
	    if (sockt === false) {
	        return;
	    }
	    sockt.emit('msg receive event', newMsg);
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
