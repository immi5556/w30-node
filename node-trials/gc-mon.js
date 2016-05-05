var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var dbaudit;

mongoClient.connect("mongodb://localhost:27017/Audit", function(err, db) {
  if(err) { return console.dir(err); }
  dbaudit = db;
});

function _insert(data) {
	//console.log(data);
	return new Promise(function (resolve, reject) {
		dbaudit.collection('Test1').insert(data, function(err, docs){
			//if (data.test == 'bbbbbb')
			//	err = { err: "its the rr"};
			if (err)
				reject(err);
			resolve(docs)
		});
	});
}

var inss = [{test: 'aaaaaa', 'test1': 111111 },
		    {test: 'bbbbbb', 'test1': 222222 },
		    {test: 'cccccc', 'test1': 333333 }];

function invoke() {

	var insl = inss.map(_insert);

	Promise.all(insl)  
	  .then(function(results) {
	     // we only get here if ALL promises fulfill
	     console.log(results);
	     //results.forEach(function(item) {
	     //  console.log(item);
	     //});
	  })
	  .catch(function(err) {
	    // Will catch failure of first failed promise
	    console.log("Failed:", err);
	});
}

function oneinvoke(){
	_insert({test: 'dddddd', 'test3': 444444 }).then(function(data){
		console.log(data);
	}).catch(function(err){
		console.log(err);
	});
}

setTimeout(function(){
	invoke();
	//oneinvoke();
}, 1000)