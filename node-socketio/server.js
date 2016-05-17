var socketio = require('socket.io');

socketio.listen(8083).on('connection', function (socket) {

    socket.on('room', function(room) {
      socket.join(room);
      socket.room = room;
    });
    
    socket.on('newAppointment', function (msg) {
      socket.in(msg.subdomain).emit('newAppointment', msg);
    });

    socket.on('updateAppointment', function (msg) {
      socket.in(msg.subdomain).emit('updateAppointment', msg);
    });

    socket.on('disconnect', function(){
      socket.leave(socket.room);
    });
});