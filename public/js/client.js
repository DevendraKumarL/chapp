let roomname,
    password,
    room,
    username;

function takeInputName() {
  roomname = prompt('Enter roomname');
  password = prompt('Enter password');
  if (!roomname || !password) {
    alert('Roomname or password not provided. Reload page to start again');
    $('#messageInput').remove();
    return;
  }
  
  username = prompt('Enter username');
  if (!username) {
    alert('Usrename not provided, Reload page to start again');
    return;
  }
  
  room = roomname + ':' + password;
  console.log("Room: " + room);
}

let players = {
  player1: '',
  player2: ''
};

$(() => {
  takeInputName();
  let socket = io.connect();

  socket.on('connect', () => {
    console.log('::Client::socket.io::connection Client connected to websocket server... ');
    let details = {
      roomname: room,
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

  socket.on('no opponent', (id) => {
     console.log('::Client::socket.io::no opponent id:', id);
  });

  socket.on('cannot join', (msg) => {
      console.log('::Client::socket.io::cannot join msg: ', msg);
      alert(msg);
      socket.close();
      $('#messageInput').remove();
      $('#sendBtn').remove();
  });

  $('#sendBtn').click(() => {
    let msg = $('#messageInput').val(),
        data = {
          receiver: players.player2,
          msg: msg,
          senderName: username
        };
    
    data = JSON.stringify(data);
    console.log('::Client:: Sending message: ', data, ' to: ', players.player2);
    socket.emit('msg send event', data);
    
    $('#chatHistory').show();
    let chatBoxElement = $('<div>').text(username + ': ' + msg).addClass('chat-box');
    $('#history').append($('<div>').addClass('chat-left').append(chatBoxElement));
    
    $('#messageInput').val('');
  });
});
