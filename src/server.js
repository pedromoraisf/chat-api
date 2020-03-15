require('dotenv').config();

const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

app.use(
    '/', (req, res) => {

        return res.json({
            message: 'Ta fazendo request pro Chat do Pedrão né...'
        });

    }
);

let saveMessages = [];

io.on('connection', socket => {
    console.log(`Socket conectado >> ${socket.id}`);

    socket.emit('receiveData', saveMessages);

    socket.on('sendMessage', data => {
        saveMessages.push(data);

        socket.emit('receiveData', saveMessages);
        socket.broadcast.emit('receiveData', saveMessages);
    });
});

server.listen(PORT, () => {
    console.log(`>> API ON <<`);
});
