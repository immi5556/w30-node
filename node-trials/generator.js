var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function _get(url, callback) {
  var x = new XMLHttpRequest();

  x.onreadystatechange = function() {
    if (x.readyState == 4) {
      callback(null, x.responseText);
    }
  };

  x.open("GET", url);
  x.send();
}

function sync(gen) {
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

  iterable = gen(resume);
  iterable.next();
}

sync(function* (resume) {
  var responses = yield [_get("https://23.22.9.157:4435/CarmaService.svc?wsdl", resume()), _get("https://23.22.9.157:4435/CarmaService.svc?wsdl", resume())]
  console.log(responses);
});
