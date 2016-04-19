var chokidar = require('chokidar');
var fs = require('fs');
var path = require('path');

// One-liner for current directory, ignores .dotfiles
chokidar.watch('./../node-regis/content/uploads/logos', {ignored: /[\/\\]\./}).on('all', function(event, fnn) {
//fs.watch('./../node-regis/content/uploads/logos', {persistent: true}).on('all', function(event, fnn) {
  console.log(event, fnn);
  if (event == 'add'){
  	var fnn1 = path.basename(fnn);
  	console.log("Regis : " + fnn1);
  	fs.createReadStream(fnn).pipe(fs.createWriteStream('./../node-sched/public/images/logos/' + fnn1));
  }
});

// One-liner for current directory, ignores .dotfiles
chokidar.watch('./../node-service/content/uploads/service', {ignored: /[\/\\]\./}).on('all', function(event, fnn) {
//fs.watch('./../node-service/content/uploads/service', {persistent: true}).on('all', function(event, fnn) {
  if (event == 'add'){
  	var fnn1 = path.basename(fnn);
  	console.log("Service : " + fnn1);
  	fs.createReadStream(fnn).pipe(fs.createWriteStream('./../node-regis/content/uploads/logos' + fnn1));
  }
});