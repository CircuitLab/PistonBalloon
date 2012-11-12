$(function() {
  var socket = io.connect();
  console.log('connected : ', socket);

  $('input#go').on('click', function(e) {
    socket.emit('go');
  });

  socket.on("turnOn", function() {
    console.log('turn on switch.');
    $("#go").attr("disabled", false);
  });

  socket.on("turnOff", function() {
    console.log('turn off switch.');
    $("#go").attr("disabled", true);
  });
});
