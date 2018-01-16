let exportUtil = module.exports = {};

// util functions
exportUtil.checkBothUsersInSameRoom = (ChatRoomUsers, socket, receiverId) => {
  let roomName1,
  roomName2, socket2;
  for (let i = 0; i < ChatRoomUsers.length; ++i) {
    if (socket.id === ChatRoomUsers[i].id) {
      roomName1 = ChatRoomUsers[i].roomName;
      break;
    }
  }
  for (let i = 0; i < ChatRoomUsers.length; ++i) {
    if (receiverId === ChatRoomUsers[i].id) {
      roomName2 = ChatRoomUsers[i].roomName;
      socket2 = ChatRoomUsers[i].socket;
      break;
    }
  }
  console.log('::checkBothUsersInSameRoom:: roomName1: ', roomName1, ' roomName2: ', roomName2);
  if (roomName1 !== roomName2) {
    socket.emit('no opponent', receiverId);
    return false;
  }
  return socket2;
};

exportUtil.areTwoUsersInRoom = (ChatRoomUsers, player) => {
  let count = 0;
  for (let i = 0; i < ChatRoomUsers.length; ++i) {
    if (ChatRoomUsers[i].roomName === player.roomName) {
      count++;
    }
    if (count >= 2) {
      return true;
    }
  }
  return false;
};

exportUtil.removeUserFromServer = (ChatRoomUsers, socketId) => {
  for (let i = 0; i < ChatRoomUsers.length; ++i) {
    if (ChatRoomUsers[i].id === socketId) {
      console.log('::Server::socket.io::util::removeUserFromServer Removing playerId: ', socketId);
      ChatRoomUsers.splice(i, 1);
      return ChatRoomUsers;
    }
  }
  console.log('::Server::socket.io::util::removeUserFromServer No usersInRoom removed');
  return ChatRoomUsers;
};

exportUtil.getRoomName = (ChatRoomUsers, socketId) => {
  for (let i = 0; i < ChatRoomUsers.length; ++i) {
    if (ChatRoomUsers[i].id === socketId) {
      let roomName = ChatRoomUsers[i].roomName;
      console.log('::Server::socket.io::util::getRoomName user: ',
      ChatRoomUsers[i].username + ' is in room: ', roomName);
      return roomName;
    }
  }
  return null;
};

exportUtil.checkRoomIsEmpty = (ChatRoomUsers, roomName) => {
  for (let i = 0; i < ChatRoomUsers.length; ++i) {
    if (ChatRoomUsers[i].roomName === roomName) {
      console.log('::Server::socket.io::util::checkRoomIsEmpty user: ', ChatRoomUsers[i].username,
      ' is still in room: ' + ChatRoomUsers[i].roomName);
      return false;
    }
  }
  return true;
};

exportUtil.getUserName = (ChatRoomUsers, socketId) => {
  for (let i = 0; i < ChatRoomUsers.length; ++i) {
    if (ChatRoomUsers[i].id === socketId) {
      return ChatRoomUsers[i].username;
    }
  }
  return null;
};
