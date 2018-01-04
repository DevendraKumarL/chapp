let utilFunctions = module.exports = {};

// util functions
utilFunctions.checkBothPlayersInSameRoom = (Players, socket, receiverId) => {
  let roomname1,
      roomname2, socket2;
  for (let i = 0; i < Players.length; ++i) {
      if (socket.id === Players[i].id) {
          roomname1 = Players[i].roomname;
          break;
      }
  }
  console.log('::Server::socket.io::msg send event sender roomname: ', roomname1);
  for (let i = 0; i < Players.length; ++i) {
      if (receiverId === Players[i].id) {
          roomname2 = Players[i].roomname;
          socket2 = Players[i].socket;
          break;
      }
  }
  console.log('::Server::socket.io::msg send event receiver roomname: ', roomname2);

  if (roomname1 !== roomname2) {
      socket.emit('no opponent', receiverId);
      return false;
  }
  return socket2;
};

utilFunctions.areTwoPlayersInRoom = (Players, player) => {
  let count = 0;
  for (let i = 0; i < Players.length; ++i) {
      if (Players[i].roomname === player.roomname) {
          count++;
      }
      if (count >= 2) {
          return true;
      }
  }
  return false;
};

utilFunctions.removePlayer = (Players, socketId) => {
  for (let i = 0; i < Players.length; ++i) {
    if (Players[i].id === socketId) {
      Players.splice(i, 1);
      return Players;
    } 
  }
  return Players;
};
