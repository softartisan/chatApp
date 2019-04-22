const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
//Creamos un server con http porque socketio espera uno creado con http.
const server = http.createServer(app);
const io = socketio(server);

//Constantes de entorno
const puerto = process.env.PORT || 3000;
const rutaDelDirectorioPublico = path.join(__dirname,'../public');


app.use(express.static(rutaDelDirectorioPublico));

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    //Cuando usuario entra a la sala
    socket.on('join', ({username, room}, callback) => {

        //Validación de usuario
        const {error, user} = addUser({id: socket.id, username, room});
        if(error) return callback(error);
        
        socket.join(room);
        socket.emit('message',generateMessage('Admin', `Bienvenido a la sala "${user.room}", ${user.username}`));
        socket.broadcast.to(room).emit('message',generateMessage(`${username} ha entrado!`));
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();

    });

    //Cuando usuario envia mensaje
    socket.on('sendMessage', (message, callback) =>{
        const user = getUser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(message)) return callback('Profanity is not allowed!');
        io.to(user.room).emit('message',generateMessage(user.username, message));
        callback();

    });

    //Cuando usuario envia ubicación
    socket.on('sendLocation', (location,callback) =>{

        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();

    });

    //Cuando usuario se desconecta
    socket.on('disconnect', () => {

        const user = removeUser(socket.id);
        if(!user) return;
        if(user) io.to(user.room).emit('message', generateMessage(`${user.username} se ha desconectado`));
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        });

    });

});

server.listen(puerto, () => {
    console.log(`Server listening on port ${puerto}`);
});