var express = require('express')
  , http = require('http')
  , app = express()
  , PistonBalloon = require('./lib/pistonballoon')
  ;

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
});

app.get('/', function(req, res) {
  res.render('index', { title: 'PistonBalloon' });
});

var port = 80;
var server = http.createServer(app).listen(port);
console.log('server start: ', port);

var io = require('socket.io').listen(server);
var pb = new PistonBalloon();

var num = 0;
var online  =0;
io.sockets.on('connection', function(socket) {
  console.log(socket.id, 'connected.');
  ++online;
  io.sockets.emit('onlineNum', { online: online });

  socket.on('disconnect',function(){
   --online;
   io.sockets.emit('onlineNum', { online: online });
  });

  socket.on('go', function() {
    val = pb.getCounter();
    console.log('getCounter : ' + pb.getCounter());
    pb.setCounter(++val);
    num++;
    io.sockets.emit('pump',num);
  });

  pb.on('turnOn', function() {
    io.sockets.emit('turnOn');
  });

  pb.on('turnOff', function() {
    io.sockets.emit('turnOff');
  });

  pb.on('tick', function() {
    io.sockets.emit('tick', pb.getCounter());
  });
});


