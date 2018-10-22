var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// -------- Game
io.on('connection', function(socket){
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
    socket.broadcast.emit('position', pos); // broadcast to everybody except this socket
    //io.emit('position', pos); // broadcasts to everybody in the room
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
