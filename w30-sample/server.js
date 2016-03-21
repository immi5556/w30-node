var express = require('express');
var app = express();
var daler = require('./dal/daler.js').daler;

require('./routes/servicerouting.js')(app, daler);

var server = app.listen(9091, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('sample App listening at http://%s:%s', host, port);
});