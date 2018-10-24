const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// -------- Game
io.on('connection', function(socket){
  let bcast = function(topic, msg) {
    socket.broadcast.emit(topic, msg); // broadcast to everybody except this socket
    //io.emit('position', pos); // broadcasts to everybody in the room
  }

  socket.on('joingame', function(pos) {
    console.log('User ' + socket.id + ' joined');
    socket.emit('id', socket.id);
    // there is a new player around
    pos.id = socket.id;
    socket.broadcast.emit('newplayer', pos);
  });

  socket.on('disconnect', function() {
    socket.broadcast.emit('leave', socket.id);
    //console.log('User ' + socket.id + ' disconnected');
  });

  socket.on('position', function(pos) {
    bcast('position', pos);
  });

  socket.on('shot', function(payload) {
    bcast('shot', payload);
  });

  socket.on('hit', function(id) {
    bcast('hit', id);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
