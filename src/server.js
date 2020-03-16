require('dotenv').config();

const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const cors = require('cors');

const dedupe = require('dedupe');

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(
  '/', (req, res) => {

    return res.json({
      message: 'Tem nada pra xeretar aqui nao tiw'
    });

  }
);

let users = [];
let saveMessages = [];

io.on('connection', socket => {
  console.log(`Socket conectado >> ${socket.id}`);

  socket.emit('receiveData', saveMessages);
  socket.emit('receiveUsersList', users);

  socket.on('sendUserInfo', username => {

    // Refresh users
    users.push({
      _socketId: socket.id,
      username
    });
    users = dedupe(users, u => u.username);

    // Event emit
    socket.emit('receiveUsersList', users);
    socket.broadcast.emit('receiveUsersList', users);

  });

  socket.on('sendChangeUsername', username => {
    let i = users.indexOf(users.filter(obj => {
      return obj._socketId === socket.id;
    })[0]);

    users[i].username = username

    socket.emit('receiveUsersList', users);
    socket.broadcast.emit('receiveUsersList', users);
  });

  socket.on('sendMessage', data => {

    // Refresh users
    users.push({
      _socketId: socket.id,
      username: data.username
    });
    users = dedupe(users);


    // Push messages
    data._socketId = socket.id
    data.active
    saveMessages.push(data);


    // Event emit
    socket.emit('receiveUsersList', users);
    socket.broadcast.emit('receiveUsersList', users);

    socket.emit('receiveData', saveMessages);
    socket.broadcast.emit('receiveData', saveMessages);
  });

  socket.on('disconnect', () => {
    // Treat on users
    let i = users.indexOf(users.filter(obj => {
      return obj._socketId === socket.id;
    })[0]);

    if (typeof users[i] !== 'undefined')
      users.splice(i, 1)

    // Event emit
    socket.emit('receiveUsersList', users);
    socket.broadcast.emit('receiveUsersList', users);
  })
});

server.listen(PORT, () => {
  console.log(`>> API ON <<`);
});
