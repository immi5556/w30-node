var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var dbaudit;

mongoClient.connect("mongodb://localhost:27017/Audit", function(err, db) {
  if(err) { return console.dir(err); }
  dbaudit = db;
});

function _insert(data, callback) {
	console.log(data);
	dbaudit.collection('Test1').insert(data, function(err, docs){
		//err = { err: "its the rr"};
		callback(err, docs);
	});
}


function sync(gen){
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
      if (err) iterable.throw(err);
      vals[slot] = retVal;
      check();
    };
  };

  iterable = gen(resume);
  iterable.next();
}

setTimeout(function(){
	sync(function* (resume) {
		try {
			var inss = yield [_insert({test: 'aaaaaa', 'test1': 111111 }, resume()),
							  _insert({test: 'bbbbbb', 'test1': 222222 }, resume()),
							  _insert({test: 'cccccc', 'test1': 333333 }, resume())];
			return inss;
		}
		catch(ert){
			//console.log("ddddddd");
			console.log(JSON.stringify(ert));
		}
	});	
}, 1000)