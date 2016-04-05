var emitter = require('events').EventEmitter;

var loop = function () {
  var self = this;
  setTimeout(function(){
    self.emit("init", "loop");
  }, 1000);

  setTimeout(function(){
    self.emit("step1", "loop");
  }, 2000);
}

var circle = function () {
  var self = this;
  setTimeout(function(){
    self.emit("init", "circle");
  }, 2000);
}

loop.prototype = Object.create(emitter.prototype);
circle.prototype = Object.create(emitter.prototype);

var l = new loop();
l.on("init", function(arg){
  console.log(arg);
});

var c = new circle();
c.on("init", function(arg){
  console.log(arg);
});

process.stdin.resume();