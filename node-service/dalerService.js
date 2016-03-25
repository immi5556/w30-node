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

	var RefreshContextService = function(obj, deasync, callback){
		opts.context.services = GetServices(obj, true, callback);
	}

	var RefreshContextClients = function(obj, deasync, callback){
		opts.context.clients = GetClients(obj, true, callback);
	}

	var GetClients = function(obj, deasync, callback){
		var ddoc;
		dbclient.collection('Clients').find({}).toArray(function(err, docs){
			ddoc = docs;
			opts.muted = true;
			if (callback){
				callback(docs);
			}
		});
		if (deasync){
			DeAsync();
			return ddoc;
		}
	}

	var InsertClient = function(obj, deasync, callback){
		var insdocs;
		obj.createdat = Date.now();
		//obj.webkey = opts.rndstring.generate(12);
		dbclient.collection('Clients').insert(obj, function(err, docs){
			insdocs = docs.ops[0];
			opts.muted = true;
			if (callback){
				callback(insdocs);
			}
		});
		if (deasync){
			DeAsync();
			RefreshContextClients(null, true);
			return insdocs;
		}
	}

	var UpdateClient = function(obj, deasync, callback){
		//console.log(obj);
		var __id = opts.getObjectId(obj._id);
		//console.log(__id);
		delete obj._id;
		var upsdocs;
		dbclient.collection('Clients').replaceOne({ _id:  __id }
		,obj
		, function(err, docs){
			opts.muted = true;
			if (callback){
				callback(upsdocs);
			}
		});
		if (deasync){
			DeAsync();
			RefreshContextClients(null, true);
			return upsdocs;
		}
	}

	var DeleteClient = function(obj, deasync, callback){
		var upsdocs, __id = opts.mongo.ObjectId(obj._id);
		dbclient.collection('Clients').remove({ _id:  __id }
		, function(err, docs){
			opts.muted = true;
			if (callback){
				callback(upsdocs);
			}
		});
		if (deasync){
			DeAsync();
			RefreshContextClients(null, true);
			return upsdocs;
		}
	}

	var GetServices = function(obj, deasync, callback){
		var ddoc;
		dbclient.collection('Services').find({}).toArray(function(err, docs){
			ddoc = docs;
			opts.muted = true;
			if (callback){
				callback(docs);
			}
		});
		if (deasync){
			DeAsync();
			return ddoc;
		}
	}

	var InsertService = function(obj, deasync, callback){
		var insdocs;
		obj.createdat = Date.now();
		dbclient.collection('Services').insert(obj, function(err, docs){
			insdocs = docs.ops[0];
			opts.muted = true;
			if (callback){
				callback(insdocs);
			}
		});
		if (deasync){
			DeAsync();
			RefreshContextService(null, true);
			return insdocs;
		}
	}

	var UpdateService = function(obj, deasync, callback){
		console.log(obj);
		var __id = opts.getObjectId(obj._id);
		console.log(__id);
		delete obj._id;
		var upsdocs;
		dbclient.collection('Services').replaceOne({ _id:  __id }
		,obj
		, function(err, docs){
			//console.log(err); //docs is always null
			//upsdocs = docs.ops[0];
			opts.muted = true;
			if (callback){
				callback(upsdocs);
			}
		});
		if (deasync){
			DeAsync();
			RefreshContextService(null, true);
			return upsdocs;
		}
	}

	var DeleteService = function(obj, deasync, callback){
		var upsdocs, __id = opts.mongo.ObjectId(obj._id);
		dbclient.collection('Services').remove({ _id:  __id }
		, function(err, docs){
			opts.muted = true;
			if (callback){
				callback(upsdocs);
			}
		});
		if (deasync){
			DeAsync();
			RefreshContextService(null, true);
			return upsdocs;
		}
	}

	return {
		logTrace: LogTrace,
		insertService: InsertService,
		updateService: UpdateService,
		getServices: GetServices,
		deleteService: DeleteService,
		insertClient: InsertClient,
		updateClient: UpdateClient,
		getClients: GetClients,
		deleteClient: DeleteClient
	}
}


module.exports.daler = wrapper;