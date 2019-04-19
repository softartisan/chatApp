const socket = io();

//Elements
const messageForm = document.querySelector('#messageForm');
const messageButton = document.querySelector('#messageFormButton');
const messageInput = document.querySelector('#messageInput');
const sendLocationButton = document.querySelector('#sendLocation');
const messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationMessageTemplate = document.querySelector('#locationMessageTemplate').innerHTML;

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm:ss a')
    });
    messages.insertAdjacentHTML('beforeend',html);
});

socket.on('locationMessage',(message) => {
    const html = Mustache.render(locationMessageTemplate,{
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm:ss a')
    });
    messages.insertAdjacentHTML('beforeend',html);
});

document.querySelector('#nombre').addEventListener('blur', () => {
    document.querySelector('#nombre').readOnly = true;
});

messageForm.addEventListener('submit', (e) =>{

    e.preventDefault();
    messageButton.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage',document.querySelector('#nombre').value+': '+messageInput.value, (error) => {
        messageButton.removeAttribute('disabled');
        messageInput.value = '';
        messageInput.focus();
        if(error) return console.log(error);
        console.log('message delivered');
    });
    
});

sendLocationButton.addEventListener('click',() => {
    sendLocationButton.setAttribute('disabled', 'disabled');
    if(!navigator.geolocation) return alert('Geolocation is not supported.');
    navigator.geolocation.getCurrentPosition((position) => {
        sendLocationButton.removeAttribute('disabled');
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!');
        });
    });
});



// socket.on('countUpdated', (count) => {
//     document.querySelector('#count').innerHTML=`El contador se ha actualizado: ${count}`;
// });

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked');
//     socket.emit('increment');
// });