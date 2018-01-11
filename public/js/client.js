let socket;

let roomName,
    password,
    room,
    username;

function takeInputName() {
    roomName = prompt('Enter roomName');
    password = prompt('Enter password');
    if (!roomName || !password) {
        alert('Room name or password not provided. Reload page to start again');
        $('#messageInput').remove();
        return;
    }
    username = prompt('Enter username');
    if (!username) {
        alert('Username not provided, Reload page to start again');
        return;
    }
    room = roomName + ':' + password;
    console.log("Room: " + room);
}

function disableInput() {
    $('#messageInput').remove();
    $('#sendBtn').remove();
}

let players = {
    player1: '',
    player2: ''
};

function makeSocketConnectionToServer() {
    socket = io.connect();

    socket.on('connect', () => {
        console.log('::Client::socket.io::connection Client connected to socket.io server... ');
        let details = {
            roomName: room,
            username: username
        };
        socket.emit('room', details);
    });

    socket.on('join room', (senderId) => {
        console.log('::Client::socket.io::join room socketId: ', senderId);
        if (players.player1 === '') {
            console.log('Player1 joined room');
            players.player1 = senderId;
            console.log('players: ', players);
            return;
        }
        if (players.player1 !== '') {
            console.log('Player2 joined room');
            players.player2 = senderId;
            socket.emit('confirm', senderId);
            console.log('players: ', players);
        }
    });

    socket.on('confirm player2', (player2Id) => {
        console.log('::Client::socket.io::confirm player2 id: ', player2Id);
        if (players.player2 === '') {
            players.player2 = player2Id;
            console.log('players: ', players);
        }
    });

    socket.on('msg receive event', (msg) => {
        console.log('::Client::socket.io::msg receive event Message received: ', msg.msg, ' from: ', msg.senderName);
        if (msg.sender !== players.player1) {
            $('#chatHistory').show();
            let chatBoxElement = $('<div>').text(msg.senderName +': ' + msg.msg).addClass('chat-box');
            $('#history').append($('<div>').addClass('chat-right').append(chatBoxElement));
        }
    });

    // socket.on('no opponent', (id) => {
    //     console.log('::Client::socket.io::no opponent id:', id);
    // });
    //
    // socket.on('cannot join', (msg) => {
    //     console.log('::Client::socket.io::cannot join msg: ', msg);
    //     alert(msg);
    //     socket.close();
    //     disableInput();
    // });
}

$(() => {
    takeInputName();

    if (!username && !room) {
        alert('Reload to connect again');
        disableInput();
        return;
    }

    makeSocketConnectionToServer();

    $('#sendBtn').click(() => {
      let msgEle = $('#messageInput'),
          data = {
              receiver: players.player2,
              msg: msgEle.val(),
              senderName: username
          };

      data = JSON.stringify(data);
      console.log('::Client:: Sending message: ', data, ' to: ', players.player2);
      socket.emit('msg send event', data);

      $('#chatHistory').show();
      let chatBoxElement = $('<div>').text(username + ': ' + msgEle.val()).addClass('chat-box');
      $('#history').append($('<div>').addClass('chat-left').append(chatBoxElement));
      msgEle.val('');
  });
});
