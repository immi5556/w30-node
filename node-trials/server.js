var emitter = require('events').EventEmitter;

var loop = function (myd) {
  var self = this;

self.emit("init", "loop1" + myd);

setTimeout(function(){
    self.emit("init", "loop2" + myd);
  }, 0);

  setTimeout(function(){
    self.emit("init", "loop3" + myd);
  }, 1000);

  setTimeout(function(){
    self.emit("init", "loop5" + myd);
  }, 1000);

  setTimeout(function(){
    self.emit("step1", "loop");
  }, 2000);
}

var circle = function (art) {
  var self = this;
  setTimeout(function(){
    self.emit("init", "circle" + art);
  }, 2000);

  self.on("init", function(arrr){
    console.log(arrr + "eeeee");
  });
}

loop.prototype = Object.create(emitter.prototype);
circle.prototype = Object.create(emitter.prototype);

var l = new loop('eeeeeee');
l.on("init", function(arg){
  console.log(arg);
});

/*
var l1 = new loop("ssss");
l1.on("init", function(arg){
  console.log(arg);
});

var c = new circle();
c.on("init", function(arg){
  console.log(arg);
});
*/

process.stdin.resume();