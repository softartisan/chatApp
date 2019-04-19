const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages')

const app = express();
//Creamos un server con http porque socketio espera uno creado con http.
const server = http.createServer(app);
const io = socketio(server);

//Constantes de entorno
const puerto = process.env.PORT || 3000;
const rutaDelDirectorioPublico = path.join(__dirname,'../public');


app.use(express.static(rutaDelDirectorioPublico));

let count = 0;

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('message',generateMessage('Bienvenido al chat'));
    socket.broadcast.emit('message',generateMessage('Un usuario ha entrado al chat'));

    socket.on('sendMessage', (message, callback) =>{
        const filter = new Filter();
        if(filter.isProfane(message)) return callback('Profanity is not allowed!');
        io.emit('message',generateMessage(message));
        callback();
    });

    socket.on('sendLocation', (location,callback) =>{
        callback();
        io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
    });


    socket.on('disconnect', () => {
        io.emit('message', generateMessage('Un usuario se ha desconectado'));
    });
    // socket.emit('countUpdated',count);
    // socket.on('increment', () => {
    //     count++;
    //     //socket.emit('countUpdated',count);
    //     io.emit('countUpdated', count);
    // });
});

server.listen(puerto, () => {
    console.log(`Server listening on port ${puerto}`);
});