'use strict';

module.exports = (io) => {

let availableChatters = [];
io.on('connection', (socket) => {

  socket.emit('user connected', socket.id);


  socket.on('available for chat', () => {
    console.log('\nsocket id avail', socket.id);
    availableChatters.push(socket.id);
    availableChatters = unique(availableChatters);
    console.log('after unique', availableChatters);
    // if there was only one available person (therefore no one to talk with),
    // emit event to tell that one that someone is available now so they can,
    // resume trying to connect.
    if (availableChatters.length === 2) {
      socket.broadcast.to(availableChatters[0]).emit('someone is available');
    }
  });

  socket.on('unavailable for chat', () => {
    console.log('\nsocket id unavail', socket.id);
    availableChatters.splice(availableChatters.indexOf(socket.id), 1);
  });

  // this gets run when user closes the app
  socket.on('disconnect', () => {
    // console.log('USER DISCONNECTED', socket.id);
    availableChatters.splice(availableChatters.indexOf(socket.id), 1);
  });


  socket.on('message sent', (msg) => {
    let socketIdArr = [];
    socketIdArr = io.sockets.sockets.map((socket) => socket.id);
    if (socketIdArr.indexOf(msg.room) === -1)
      socket.emit('user got disconnected');
    else
      socket.broadcast.to(msg.room).emit('receive message', msg);
  });

  // receiving step 1 in finding person, sends back user array
  socket.on('finding people', (mySocketId, cb) => {
    let people = availableChatters.slice();
    people.splice(availableChatters.indexOf(mySocketId), 1);
    cb(people);
  });

  // receiving step 2 in finding person
  socket.on('attempt connection', (ids) => {
    // sending step 3 in finding person
    // console.log('\nIN ATTEMPT CONNECTIONS')
    console.log('\n\nids', ids);
    console.log('availableChatters', availableChatters);
    socket.broadcast.to(ids.receivingId).emit('can you connect', ids);
  });

  // receiving step 4 failure in finding person
  socket.on('busy', (ids) => {
    // sending step 5 failure in finding person
    console.log('busy ids', ids);
    socket.broadcast.to(ids.sendingId).emit('cannot connect');
  });

  // receiving step 4 success in finding person
  socket.on('lets chat', (ids) => {
    // sending step 5 success in finding person
    socket.broadcast.to(ids.sendingId).emit('ready to connect', ids);
  });

  socket.on('chat ended', (otherUserId) => {
    socket.broadcast.to(otherUserId).emit('chat is over');
  });

});

function unique(arr) {
  return arr.filter((el, index, array) => {
    return array.indexOf(el) === index;
  });
}

};