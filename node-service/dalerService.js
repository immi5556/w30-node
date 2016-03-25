var wrapper = function (opt) {
	var opts = opt;
	var dbaudit,  dbclient;

	opts.mongoClient.connect("mongodb://localhost:27017/Audit", function(err, db) {
	  if(err) { return console.dir(err); }
	  dbaudit = db;
	});

	var DeAsync = function(){
		opts.muted = false;
		opts.deasync.loopWhile(function(){
        	return !opts.muted;
     	});
	}

	opts.mongoClient.connect("mongodb://localhost:27017/Clients", function(err, db) {
	  	if(err) { return console.dir(err); }
	  	dbclient = db;
	  	opts.muted = true;
	});
	DeAsync();

	var LogTrace = function(obj){
	  var collection = dbaudit .collection('LogClients');
	  obj.createdat = Date.now();
	  collection.insert(obj);
	};

	var Authenticate = function(obj, deasync, callback){
		var usdocs;
		//console.log(obj);
		dbclient.collection('Clients').find({ 'webunkey':  obj.un, 'webpwkey': obj.pw })
		.toArray(function(err, docs){
			usdocs = docs;
			opts.muted = true;
			if (callback){
				callback(upsdocs);
			}
		});
		if (deasync){
			DeAsync();
			return usdocs;
		}
	}

	var GetMyServices = function(obj){
		return obj.services;
	}

	return {
		logTrace: LogTrace,
		authenticate: Authenticate,
		getMyServices: GetMyServices
	}
}


module.exports.daler = wrapper;