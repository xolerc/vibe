const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const ADMIN_ID = 'xoleric2003';
const PORT = process.env.PORT || 3000;

let activeUsers = {};
let userInfo = {};

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
  socket.on('register', (data) => {
    const uid = data.userId;
    socket.userId = uid;
    activeUsers[uid] = socket.id;
    userInfo[uid] = {
      joinedAt: Date.now(),
      userAgent: socket.handshake.headers['user-agent'] || 'unknown',
      ip: socket.handshake.address
    };
    console.log(`[${uid}] connected`);

    if (uid === ADMIN_ID) {
      const users = Object.entries(activeUsers).map(([id]) => ({
        id,
        info: userInfo[id] || {},
        online: true
      }));
      socket.emit('admin_users', users);
    }

    io.emit('user_count', Object.keys(activeUsers).length);
  });

  socket.on('send_message', (data) => {
    const { senderId, text } = data;
    const targetId = ADMIN_ID;

    if (activeUsers[targetId]) {
      io.to(activeUsers[targetId]).emit('receive_message', {
        senderId,
        text,
        time: Date.now()
      });
    }

    if (activeUsers[senderId] && senderId !== targetId) {
      io.to(activeUsers[senderId]).emit('receive_message', {
        senderId: 'me',
        text,
        time: Date.now()
      });
    }
  });

  socket.on('admin_send', (data) => {
    const { targetId, text } = data;
    if (socket.userId !== ADMIN_ID) return;

    if (activeUsers[targetId]) {
      io.to(activeUsers[targetId]).emit('receive_message', {
        senderId: ADMIN_ID,
        text,
        time: Date.now()
      });
    }

    io.to(activeUsers[ADMIN_ID]).emit('receive_message', {
      senderId: targetId,
      text,
      time: Date.now(),
      fromAdmin: true
    });
  });

  socket.on('disconnect', () => {
    const uid = socket.userId;
    if (uid) {
      delete activeUsers[uid];
      delete userInfo[uid];
      console.log(`[${uid}] disconnected`);
      io.emit('user_count', Object.keys(activeUsers).length);

      if (uid === ADMIN_ID) {
        io.emit('admin_offline');
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
