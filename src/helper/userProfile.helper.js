const UserProfileHelper = {
    // Thêm các phương thức broadcast
    broadcastUserInfo(connectedUsers, userId, data) {
        if (connectedUsers.has(userId)) {
            connectedUsers.get(userId).forEach(socket => {
                socket.emit('user info updated', data);
            });
        }
    },

    broadcastAvatar(connectedUsers, userId, avatarUrl) {
        if (connectedUsers.has(userId)) {
            connectedUsers.get(userId).forEach(socket => {
                socket.emit('avatar updated', avatarUrl);
            });
        }
    }
}

export default UserProfileHelper
