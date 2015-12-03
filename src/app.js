'use strict';

const express = require('express'),
      router = express.Router(),
      logger = require('morgan'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      middleware = require('./config/middleware'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http);

// run some basic Express third-party middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// run application-level middleware (before all routes)
app.use(middleware.cors);

// let app know about all API routes and set to root '/' path
require('./config/routes')(router);
app.use('/', router);

// run application-level middleware (after all routes)
// ... no 'after middleware yet

// connect to mongoDB with apiStarter database
mongoose.connect('mongodb://localhost/close');

// run Express web server
http.listen(3000, () => {
  console.log(`Serving on port: ${http.address().port}`);
});

let chatters = [];
io.on('connection', (socket) => {

  if (chatters.length < 2) {
    socket.join('alpha room');
    socket.emit('user connected', 'alpha room');
  }

  console.log('a user connected');
  chatters.push(socket.id);

  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED', socket.id);
    console.log(chatters.indexOf(socket.id));
    chatters.splice(chatters.indexOf(socket.id), 1);
  });
  // socket.on('blast', (msg) => {
  //   console.log(msg, socket.id)
  // })
  socket.on('message sent', (msg) => {
    console.log('1', socket.id, socket.rooms);
    console.log('room', msg.room)
    socket.broadcast.to(msg.room).emit('receive message', msg);
    // socket.to(msg.otherRoom).send('receive message', msg);
  });

});

module.exports = app;
