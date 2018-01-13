let express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    util = require('./util/util');

let port = process.env.PORT || 5001;

let ChatRoomUsers = [];
let AllActiveChatRoomHistory = [];

io.on('connection', (socket) => {
    console.log('::Server::socket.io::connection A client connected... Id: ', socket.id);

    socket.on('room', (clientDetails) => {
        console.log('::Server::socket.io::room ', clientDetails.roomName, ' from: ', socket.id);
        let player = {
            id: socket.id,
            roomName: clientDetails.roomName,
            socket: socket,
            username: clientDetails.username
        };
        if (util.areTwoPlayersInRoom(ChatRoomUsers, player)) {
            socket.emit('cannot join', 'Game Room is already occupied by two users in the ChatRoom.');
            return;
        }

        socket.join(clientDetails.roomName);
        ChatRoomUsers.push(player);
        io.in(clientDetails.roomName).emit('join room', socket.id);
        console.log('::Server::socket.io::room Number of ChatRoomUsers: ', ChatRoomUsers.length);
    });

	socket.on('confirm', (receiverId) => {
	    console.log('::Server::socket.io.confirm id: ', receiverId);
	    if (receiverId !== socket.id) {
	        let sockt = util.checkBothPlayersInSameRoom(ChatRoomUsers, socket, receiverId);
	        if (sockt === false) {
	        	console.log('::Server::socket.io.confirm sockt is FALSE');
	            return;
	        }
	        sockt.emit('confirm user2', socket.id);
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
	    let sockt = util.checkBothPlayersInSameRoom(ChatRoomUsers, socket, msgDetails.receiver);
	    if (sockt === false) {
	        return;
	    }
	    sockt.emit('msg receive event', newMsg);
	});

	socket.on('disconnect', () => {
	    ChatRoomUsers = util.removePlayer(ChatRoomUsers, socket.id);
	    console.log('::Server::socket.io::disconnect A client disconnected... Id: ', socket.id);
	    console.log('Number of ChatRoomUsers: ', ChatRoomUsers.length);
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
