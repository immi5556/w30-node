function meth1(argument) {
	console.log("meth1 called...");
	return "Meth 1";
}

function meth2(argument) {
	console.log("meth2 called...");
	return "Meth 2";
}

function sync(generator) {
  var iterable, resume, check, vals, ops;

  vals = [];
  ops  = 0;

  check = function() {
    if (vals.length == ops) {
      if (ops == 1) iterable.next(vals[0]);
      else iterable.next(vals);
    }
  }

  resume = function(err, retVal) {
    var slot = ops;
    ops++;

    return function(err, retVal) {
      if (err) iterable.raise(err);
      vals[slot] = retVal;
      check();
    };
  };

  iterable = generator(resume);
  iterable.next();
}

sync(function* (resume) {
  var responses = yield [meth1, meth2];
  console.log(responses);
});
