var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;

var dbaudit, dbcustomers;

mongoClient.connect("mongodb://localhost:27017/Audit", function(err, db) {
  if(err) { return console.dir(err); }
  dbaudit = db;
});

mongoClient.connect("mongodb://localhost:27017/Customers", function(err, db) {
  	if(err) { return console.dir(err); }
  	dbcustomers = db;
});

function _insert(data, callback) {
	return new Promise(function(resolve, reject){
		dbaudit.collection('Test1').insert(data, function(err, docs){
			if (err)
				reject(err);
			resolve("Stared");
		});
	});
}
var i = 0;
var finalfunc = function(data){
	//var ty = JSON.stringify(data);
	console.log(data);
	return data + i;
}

var error = function(err){
	err(this);
	//console.log(err);
}

var sync = function(gen) {
	return function(){
		var generator = gen.apply(this, arguments);
		function handle(result){
			if (result.done) return result.value;
			console.log(result.value);
			return result.value.then(function(res){
				console.log('1111');
				return handle(generator.next(res));
			}, function(err){
				console.log('1111');
				return handle(generator.throw(err));
			});
		}

		return handle(generator.next());
	}
}
function *genfn(){
	var tt = yield _insert({ 
		'aaaaaa': '111111' 
	}).then(finalfunc);
	console.log(tt);
	return tt;
}
//var tt = promise1("pa1").then(promise2).then(promise3).catch(error);
//console.log(tt);
var pr =	new Promise(function(resolve, reject){
		resolve("Lord Jesus my Shepard");
	});
setTimeout(function(){
	//var tt = sync(genfn);
	//var t1 = tt().then(finalfunc);
	//console.log(t1);
	//console.log(t1.next());
	//console.log(t1.next("Lord Jesus my Saviour"));

	//_insert({ 'kkkkkkkk': 444444 }).then(finalfunc).then(finalfunc).then(finalfunc);

	//pr.then(finalfunc).then(error);

}, 500);


error.call("I am context", function(err, res) {
	//console.log(err);
})

var mongoInsert = function(data, fn) {
	//console.log(arguments);
	console.log(slice.call(arguments, 0));
	dbaudit.collection('Test1').insert(data, fn);
}

var mongoBase = function(fn) {
	var ctx = this;
	return new Promise(function(resolve, reject) {
		fn.call(ctx, { 'eeeeee':'5555555' }, function(err, res) {
			if (err) return reject(err);
			if (arguments.length > 2) res = slice.call(arguments, 1);
				resolve(res);
		});
	});
}

var normalRetuen = function(data){
	return Promise.resolve(data);
}

setTimeout(function(){
	var tt = mongoBase(mongoInsert).then(function(dat){
		//console.log(dat);
	});
}, 500);

normalRetuen("sdfs").then(function(dd){ console.log(dd); });