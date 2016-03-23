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
		console.log("dsfdssfd");
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

	var Get = function(tbl, obj, deasync, callback){
		var ddoc;
		dbclient.collection(tbl).find({}).toArray(function(err, docs){
			ddoc = docs;
			if (deasync) opts.muted = true;
			if (callback){
				callback(docs);
			}
		});
		if (deasync){
			DeAsync();
			//console.log(ddoc);
			return ddoc;
		}
	};

	var Insert = function(tbl, obj, deasync, callback){
		var insdocs;
		obj.createdat = Date.now();
		dbclient.collection(tbl).insert(obj, function(err, docs){
			insdocs = docs.ops[0];
			if (deasync) opts.muted = true;
			if (callback){
				callback(insdocs);
			}
		});
		if (deasync){
			DeAsync();
			return insdocs;
		}
	};

	var Update = function(tbl, obj, deasync, callback){
		var __id = opts.getObjectId(obj._id);
		delete obj._id;
		var upsdocs;
		dbclient.collection(tbl).replaceOne({ _id:  __id }
		,obj
		, function(err, docs){
			if (deasync) opts.muted = true;
			if (callback){
				callback(upsdocs);
			}
		});
		if (deasync){
			DeAsync();
			return upsdocs;
		}
	};

	var Delete = function(tbl, obj, deasync, callback){
		var upsdocs, __id = opts.mongo.ObjectId(obj._id);
		dbclient.collection(tbl).remove({ _id:  __id }
		, function(err, docs){
			upsdocs = docs;
			if (deasync) opts.muted = true;
			if (callback){
				callback(upsdocs);
			}
		});
		if (deasync){
			DeAsync();
			return upsdocs;
		}
	}

	return {
		logTrace: LogTrace,
		insert: Insert,
		update: Update,
		get: Get,
		delete: Delete
	}
}


module.exports.daler = wrapper;