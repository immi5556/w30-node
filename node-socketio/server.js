var express = require('express');
var upload = require('jquery-file-upload-middleware');
var app = express();
var http = require('http').Server(app);
var socketio = require('socket.io')(http);

app.use('/uploadLogo', upload.fileHandler({
    uploadDir: __dirname + '/persistent-storage/uploads/logos',
    uploadUrl: '/uploads/'
}));
app.use('/uploadSpec', upload.fileHandler({
    uploadDir: __dirname + '/persistent-storage/uploads/specialities',
    uploadUrl: '/uploads/'
}));
/*Not Using now.
app.use('/uploadRes', upload.fileHandler({
    uploadDir: __dirname + '/persistent-storage/uploads/resources',
    uploadUrl: '/uploads/'
}));*/
app.use('/uploadService', upload.fileHandler({
    uploadDir: __dirname + '/persistent-storage/uploads/services',
    uploadUrl: '/uploads/'
}));

require('./routes/staticrouting.js')(app);

socketio.on('connection', function (socket) {
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

var server = http.listen(8083, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('images app listening at http://%s:%s', host, port);
});