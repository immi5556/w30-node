
var express = require('express');
var app = express();
var bodyParser = require('body-parser');


app.get('/',function(req,res){
     console.log('ddddddddd');
     res.sendFile(__dirname + '/index.html');

});
var server = app.listen(9099, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Landing app listening at http://%s:%s', host, port);
});