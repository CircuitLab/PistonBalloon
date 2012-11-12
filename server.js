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
  res.render('index', { title: 'top' });
});

var server = http.createServer(app).listen(3000);
console.log('server start: ', 3000);

var io = require('socket.io').listen(server);
var pb = new PistonBalloon();

io.sockets.on('connection', function(socket) {
  console.log(socket.id, 'connected.');

  socket.on('go', function() {
    val = pb.getCounter();
    console.log('getCounter : ' + pb.getCounter());
    pb.setCounter(++val);
  });

  pb.on('turnOn', function() {
    io.sockets.emit('turnOn');
  });

  pb.on('turnOff', function() {
    io.sockets.emit('turnOff');
  });

  pb.on('tick', function() {
    io.sockets.emit('tick');
  });
});
