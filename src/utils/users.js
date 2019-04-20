const users = [];

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    //clean the data
    username = username.trim();
    room = room.trim().toLowerCase();

    //Validate the data
    if (!username || !room) {
        return {
            error: 'Nick y sala es requerida.'
        }
    }

    //Check for existing user
    const existingUser = users.find( user => room === user.room && username.toLowerCase() === user.username.toLowerCase());
    //Validate username
    if(existingUser){
        return {
            error: 'Nick ya esta en uso.'
        }
    }

    //Store user
    const user = {id,username,room};
    users.push(user);
    return {user};

}

const removeUser = (id) => {
    const index = users.findIndex( user => user.id===id );

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
