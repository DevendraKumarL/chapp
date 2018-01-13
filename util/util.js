let exportUtil = module.exports = {};

// util functions
exportUtil.checkBothPlayersInSameRoom = (ChatRoomUsers, socket, receiverId) => {
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
    console.log('::checkBothPlayersInSameRoom:: roomName1: ', roomName1, ' roomName2: ', roomName2);
    if (roomName1 !== roomName2) {
        socket.emit('no opponent', receiverId);
        return false;
    }
    return socket2;
};

exportUtil.areTwoPlayersInRoom = (ChatRoomUsers, player) => {
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

exportUtil.removePlayer = (ChatRoomUsers, socketId) => {
    for (let i = 0; i < ChatRoomUsers.length; ++i) {
        console.log('::Server::socket.io::util::removePlayer Player: ', ChatRoomUsers[i].id, ' socketId: ', socketId);
        if (ChatRoomUsers[i].id === socketId) {
            console.log('::Server::socket.io::util::removePlayer Removing playerId: ', socketId);
            ChatRoomUsers.splice(i, 1);
            return ChatRoomUsers;
        }
    }
    console.log('::Server::socket.io::util::removePlayer No usersInRoom removed');
    return ChatRoomUsers;
};
