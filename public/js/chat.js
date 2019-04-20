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
const sideBarTemplate = document.querySelector('#sideBarTemplate').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
    //New message element
    const newMessage = messages.lastElementChild;
    //Height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    //Visible height
    const visibleHeight = messages.offsetHeight;

    //Height of messages container
    const containerHeight = messages.scrollHeight;

    //How far have i scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm:ss a')
    });
    messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
});

socket.on('locationMessage',(message) => {
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm:ss a')
    });
    messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});


messageForm.addEventListener('submit', (e) =>{

    e.preventDefault();
    messageButton.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage',messageInput.value, (error) => {
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

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});



// socket.on('countUpdated', (count) => {
//     document.querySelector('#count').innerHTML=`El contador se ha actualizado: ${count}`;
// });

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked');
//     socket.emit('increment');
// });