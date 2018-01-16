let socket;

let chatRoomReady = false;

let roomName,
password,
room,
username;

let usersInRoom = {
  user1: null,
  user2: null
};

let userNames = {
  username1: null,
  username2: null
};

let online = "<i class='fa fa-check-circle-o' style='color:green'></i>",
offline = "<i class='fa fa-times-circle' style='color:red'></i>";

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

function createMessageReceivedUIElement(username, msg) {
  $('#chatHistory').show();
  let usernameEle = $('<span>').text(username).addClass('receiverUsernameEle');
  let messageEle = $('<span>').text(msg).css('display', 'block');
  let chatBoxElement = $('<div>').append(usernameEle).append(messageEle).addClass('chat-box');
  let ele = $('<div>').addClass('chat-right').append(chatBoxElement);
  $('#history').prepend(ele);
}

function createMessageSentUIElement(username, msg) {
  $('#chatHistory').show();
  let usernameEle = $('<span>').text(username).addClass('senderUsernameEle');
  let messageEle = $('<span>').text(msg).css('display', 'block');
  let chatBoxElement = $('<div>').append(usernameEle).append(messageEle).addClass('chat-box');
  let ele = $('<div>').addClass('chat-left').append(chatBoxElement);
  $('#history').prepend(ele);
}

function processChatHistory(chatHistory) {
  if (chatHistory.length == 0) {
    console.log('::processChatHistory:: empty');
    return;
  }
  $('#history').html();
  for (let i = 0; i < chatHistory.length; ++i) {
    console.log('::processChatHistory:: ', chatHistory[i]);
    console.log('::userNames:: ', userNames);
    let username = chatHistory[i].split(' : ')[0],
    message = chatHistory[i].split(' : ')[1];
    if (username === userNames.username1) {
      console.log('::processChatHistory:: username: ', username, ' username1: ', userNames.username1);
      createMessageSentUIElement(username, message);
    }
    else {
      console.log('::processChatHistory:: username: ', username, ' username2: ', userNames.username2);
      createMessageReceivedUIElement(username, message);
    }
  }
}

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

  socket.on('join room', (data) => {
    console.log('::Client::socket.io::join room data: ', data);
    if (usersInRoom.user1 === null) {
      console.log('User1 joined room');
      usersInRoom.user1 = data.senderId;
      console.log('usersInRoom: ', usersInRoom);
      $('#chatRoomName').html('<b><u>' + room.split(':')[0] + '</u></b>');
      $('#user1').html('<b>' + username + '</b>');
      userNames.username1 = username;
      $('#user1Status').html(online);
      $('#user2Status').html(offline);
      console.log('::userNames:: ', userNames);
      return;
    }
    if (usersInRoom.user1 !== null) {
      console.log('User2 joined room');
      usersInRoom.user2 = data.senderId;
      socket.emit('confirm', data.senderId);
      console.log('usersInRoom: ', usersInRoom);
      $('#user2').html('<b>' + data.username + '</b>');
      userNames.username2 = data.username;
      $('#user2Status').html(online);
      console.log('::userNames:: ', userNames);
    }
  });

  socket.on('confirm user2', (data) => {
    console.log('::Client::socket.io::confirm user2 id: ', data.user2Id);
    if (usersInRoom.user2 === null) {
      usersInRoom.user2 = data.user2Id;
      console.log('::Client::socket.io::confirm user2 usersInRoom: ', usersInRoom);
      console.log('::Client::socket.io::confirm user2 chatHistory: ', data.chatHistory);
      $('#user2').html('<b>' + data.username + '</b>')
      userNames.username2 = data.username;
      $('#user2Status').html(online);
      processChatHistory(data.chatHistory);
      console.log('::userNames:: ', userNames);
    }
  });

  socket.on('msg receive event', (msgDetails) => {
    console.log('::Client::socket.io::msgDetails receive event Message received: ', msgDetails.msg, ' from: ', msgDetails.senderName);
    if (msgDetails.sender !== usersInRoom.user1) {
      $('#chatHistory').show();
      let usernameEle = $('<span>').text(msgDetails.senderName).addClass('receiverUsernameEle');
      let messageEle = $('<span>').text(msgDetails.msg).css('display', 'block');
      let chatBoxElement = $('<div>').append(usernameEle).append(messageEle).addClass('chat-box');
      let ele = $('<div>').addClass('chat-right').append(chatBoxElement);
      $('#history').prepend(ele);
    }
  });

  socket.on('no opponent', (id) => {
    console.log('::Client::socket.io::no opponent id:', id);
  });

  socket.on('cannot join', (msg) => {
    console.log('::Client::socket.io::cannot join msg: ', msg);
    $('#chatRoomStatus').html('<u><i>' + msg + '</i></u>');
    socket.close();
    disableInput();
    clearInterval(chatRoomReadyStatusInterval);
  });

  socket.on('user left', (socketId) => {
    console.log('::Client::socket.io::user left socketId: ', socketId);
    if (usersInRoom.user1 === socketId) {
      console.log('::Client::socket.io::user left userName: ', userNames.username1);
      $('#user1Status').html(offline);
      return;
    }
    if (usersInRoom.user2 === socketId) {
      console.log('::Client::socket.io::user left userName: ', userNames.username2);
      $('#user2Status').html(offline);
    }
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
      senderName: username,
      roomName: room
    };

    data = JSON.stringify(data);
    console.log('::Client:: Sending message: ', data, ' to: ', usersInRoom.user2);
    socket.emit('msg send event', data);

    $('#chatHistory').show();
    let usernameEle = $('<span>').text(username).addClass('senderUsernameEle');
    let messageEle = $('<span>').text(msgEle.val()).css('display', 'block');
    let chatBoxElement = $('<div>').append(usernameEle).append(messageEle).addClass('chat-box');
    let ele = $('<div>').addClass('chat-left').append(chatBoxElement);
    $('#history').prepend(ele);
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
    $('#sendBtn').prop('disabled', false);
    return;
  }
  if (!chatRoomReady) {
    $('#messageInput').prop('disabled', true);
    $('#sendBtn').prop('disabled', true);
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
