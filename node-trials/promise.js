var promise = new Promise(function(resolve, reject) {
  // do a thing, possibly async, then…

  if ( 1===1 /* everything turned out fine */) {
    resolve("Stuff worked!");
  }
  else {
    reject(Error("It broke"));
  }
});

promise.then(function( message ) {
  console.log( message );
},
function( err ) {
  console.log( err );
});

var someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    var x = 2;
    resolve(x + 2);
  });
};

var someOtherAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    reject('something went wrong');
  });
};

someAsyncThing().then(function(data) {
	console.log(data);
  	return someOtherAsyncThing();
}).catch(function(error) {
  console.log('oh no', error);
});