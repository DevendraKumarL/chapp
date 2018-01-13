let socket;

let chatRoomReady = false;

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
        $('#messageInput').remove();
        return;
    }
    room = roomName + ':' + password;
    console.log("Room: " + room);
}

function disableInput() {
    $('#messageInput').prop('disabled', true);
    $('#sendBtn').prop('disabled', true);
}

let usersInRoom = {
    user1: null,
    user2: null
};

let messageHistory = {};

function makeSocketConnectionToServer() {
    socket = io.connect();

    socket.on('connect', () => {
        console.log('::Client::socket.io::connection Client connected to socket.io server... ');
        let clientDetails = {
            roomName: room,
            username: username
        };
        socket.emit('room', clientDetails);
    });

    socket.on('join room', (senderId) => {
        console.log('::Client::socket.io::join room socketId: ', senderId);
        if (usersInRoom.user1 === null) {
            console.log('Player1 joined room');
            usersInRoom.user1 = senderId;
            console.log('usersInRoom: ', usersInRoom);
            $('#chatRoomName').html('<b><u>' + room.split(':')[0] + '</u></b>');
            return;
        }
        if (usersInRoom.user1 !== null) {
            console.log('Player2 joined room');
            usersInRoom.user2 = senderId;
            socket.emit('confirm', senderId);
            console.log('usersInRoom: ', usersInRoom);
        }
    });

    socket.on('confirm user2', (player2Id) => {
        console.log('::Client::socket.io::confirm user2 id: ', player2Id);
        if (usersInRoom.user2 === null) {
            usersInRoom.user2 = player2Id;
            console.log('usersInRoom: ', usersInRoom);
        }
    });

    socket.on('msg receive event', (msg) => {
        console.log('::Client::socket.io::msg receive event Message received: ', msg.msg, ' from: ', msg.senderName);
        if (msg.sender !== usersInRoom.user1) {
            $('#chatHistory').show();
            let chatBoxElement = $('<div>').text(msg.senderName +': ' + msg.msg).addClass('chat-box');
            $('#history').append($('<div>').addClass('chat-right').append(chatBoxElement));
        }
    });

    // socket.on('no opponent', (id) => {
    //     console.log('::Client::socket.io::no opponent id:', id);
    // });
    //

    socket.on('cannot join', (msg) => {
        console.log('::Client::socket.io::cannot join msg: ', msg);
        $('#chatRoomStatus').html('<u><i>' + msg + '</i></u>');
        socket.close();
        disableInput();
        clearInterval(chatRoomReadyStatusInterval);
    });
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
              receiver: usersInRoom.user2,
              msg: msgEle.val(),
              senderName: username
          };

      data = JSON.stringify(data);
      console.log('::Client:: Sending message: ', data, ' to: ', usersInRoom.user2);
      socket.emit('msg send event', data);

      $('#chatHistory').show();
      let chatBoxElement = $('<div>').text(username + ': ' + msgEle.val()).addClass('chat-box');
      $('#history').append($('<div>').addClass('chat-left').append(chatBoxElement));
      msgEle.val('');
  });
});

let chatRoomReadyStatusInterval;

function updateChatRoomReadyStatus() {
    if (usersInRoom.user1 && usersInRoom.user2) {
        chatRoomReady = true;
        clearInterval(chatRoomReadyStatusInterval);
        $('#chatRoomStatus').html('<u><i>Start chatting!</i></u>');
        $('#messageInput').prop('disabled', false);
        return;
    }
    if (!chatRoomReady) {
        $('#messageInput').prop('disabled', true);
        $('#chatRoomStatus').html('<u><i>Waiting for other user to join chat room...</i></u>');
        chatRoomReadyStatusInterval = setTimeout(updateChatRoomReadyStatus, 1000);
    }
}

$(() => {
    chatRoomReadyStatusInterval = setTimeout(updateChatRoomReadyStatus, 1000);
});

let chatDivPosition = $('#chatDiv').offset();

$(window).scroll(() => {
    if ($(window).scrollTop() > chatDivPosition.top) {
        $('#chatDiv').css('position', 'fixed');
    }
    else {
        $('#chatDiv').css('position', 'static');
    }
});
