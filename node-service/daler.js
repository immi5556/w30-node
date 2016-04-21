var wrapper = function (opt) {
	var opts = opt;
	var dbaudit,  dbclient, dbcustomers, dbschedule, dbenduser;

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


	opts.mongoClient.connect("mongodb://localhost:27017/Customers", function(err, db) {
	  	if(err) { return console.dir(err); }
	  	dbcustomers = db;
	});

	opts.mongoClient.connect("mongodb://localhost:27017/Schedule", function(err, db) {
      	if(err) { return console.dir(err); }
      	dbschedule = db;
  	});

	opts.mongoClient.connect("mongodb://localhost:27017/EndUsers", function(err, db) {
      	if(err) { return console.dir(err); }
      	dbenduser = db;
  	});

	DeAsync();

	var LogTrace = function(obj){
	  var collection = dbaudit .collection('LogClients');
	  obj.createdat = Date.now();
	  collection.insert(obj);
	};

	var Get = function(tbl, obj, deasync, callback){
		var ddoc;

		if(tbl == "Specialities"){
			dbclient.collection(tbl).find(obj).toArray(function(err, docs){
				ddoc = docs;
				if (deasync) opts.muted = true;
				if (callback){
					callback(docs);
				}
			});
		}else if(tbl == "EndUsers"){
			var response = {
		 		"Status":"Ok",
		 		"Data": []
		 	}
		 	obj._id = opts.getObjectId(obj._id);
			dbenduser.collection(tbl).find(obj).toArray(function(err, docs){
				if(err){
					console.log(err);
					response.Status = "Failed";
				}else{
					response.Data.push(docs);
				}
				if (deasync) opts.muted = true;
				if (callback){
					callback(response);
				}
			});
		}else{
			var filter = (obj && obj.filter) ? obj.filter : {};
			dbclient.collection(tbl).find({}).toArray(function(err, docs){
				ddoc = docs;
				if (deasync) opts.muted = true;
				if (callback){
					callback(docs);
				}
			});
		}
		if (deasync){
			DeAsync();
			//console.log(ddoc);
			return ddoc;
		}
	};

	var Insert = function(tbl, obj, deasync, callback){
		var insdocs;
		obj.createdat = Date.now();
		 if(tbl == "EndUsers"){
		 	var response = {
		 		"Status":"Ok",
		 		"Message":""
		 	}
			dbenduser.collection(tbl).insert(obj, function(err, docs){
				if(err){
					console.log(err);
					response.Status = "Failed";
				}else{
					response._id = docs.ops[0]._id;
					response.Message = "Inserted Succesfully";
				}
				if (deasync) opts.muted = true;
				if (callback){
					callback(response);
				}
			});
		}else{
			dbclient.collection(tbl).insert(obj, function(err, docs){
				insdocs = docs.ops[0];
				if (deasync) opts.muted = true;
				if (callback){
					callback(insdocs);
				}
			});
		}
		
		if (deasync){
			DeAsync();
			return insdocs;
		}
	};

	var Update = function(tbl, obj, deasync, callback){
		var __id = opts.getObjectId(obj._id);
		delete obj._id;
		var upsdocs;
		if(tbl == "Specialities"){
			dbclient.collection(tbl).update({ serviceId:  obj.serviceId }
			,obj
			,{upsert: true}
			, function(err, docs){
				if (deasync) opts.muted = true;
				if (callback){
					callback(upsdocs);
				}
			});
		}else if(tbl == "EndUsers"){
			var response = {
		 		"Status":"Ok",
		 		"Message":""
		 	};
			dbenduser.collection(tbl).replaceOne({ _id:  __id }
			,obj
			, function(err, docs){
				if(err){
					console.log(err);
					response.Status = "Failed";
				}else{
					response.Message = "Updated Succesfully";
				}
				if (deasync) opts.muted = true;
				if (callback){
					callback(response);
				}
			});
		}else {
			dbclient.collection(tbl).replaceOne({ _id:  __id }
			,obj
			, function(err, docs){
				if (deasync) opts.muted = true;
				if (callback){
					callback(upsdocs);
				}
			});
		}
		
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

	var GetCustomers = function(tbl, obj, callback){
		var filter = (obj && obj.filter) ? obj.filter : {}; 
		dbcustomers.collection(tbl).find(filter).toArray(function(err, docs){
			if (callback){
				callback(err, docs);
			}
		});
	};

	var GetSchedules = function(tbl, obj, callback) {
		var filter = (obj && obj.filter) ? obj.filter : {}; 
		dbschedule.collection(tbl).find(filter).toArray(function(err, docs){
			if (callback){
				callback(err, docs);
			}
		});	
	}

	var InsertSchedules = function(tbl, obj, callback) {
		obj.createdat = Date.now();
		dbschedule.collection(tbl).insert(obj, function(err, docs){
			if (callback){
				callback(err, docs.ops[0]);
			}
		});
	}

	var GetNearestCustomers = function(tbl, obj, callback){

	}

	return {
		logTrace: LogTrace,
		insert: Insert,
		update: Update,
		get: Get,
		delete: Delete,
		getCustomers: GetCustomers,
		getSchedules: GetSchedules,
		insertSchedules: InsertSchedules
	}
}


module.exports.daler = wrapper;
