var express = require('express');
var upload = require('jquery-file-upload-middleware');
var app = express();
var http = require('http').Server(app);
var socketio = require('socket.io');

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

var server = http.listen(8083);

socketio.listen(server).on('connection', function (socket) {
    
    socket.on('room', function(room) {
      socket.set('room', room, function() { console.log('room ' + room + ' saved'); } );
      socket.join(room);
    });
    
    socket.on('newAppointment', function (msg) {
      socket.broadcast.to(msg.subdomain).emit('newAppointment', msg);
    });

    socket.on('updateAppointment', function (msg) {
      socket.broadcast.to(msg.subdomain).emit('updateAppointment', msg);
    });

    socket.on('disconnect', function(){
      socket.leave(socket.room);
    });
});