var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var objectId = mongo.ObjectId;
var wrapper = function () {
	var dbaudit, dbland, dbcustomers;
	MongoClient.connect("mongodb://localhost:27017/Audit", function(err, db) {
	  if(err) { return console.dir(err); }
	  dbaudit = db;
	});

	MongoClient.connect("mongodb://localhost:27017/Landing", function(err, db) {
	  if(err) { return console.dir(err); }
	  dbland = db;
	});

	MongoClient.connect("mongodb://localhost:27017/Customers", function(err, db) {
	  if(err) { return console.dir(err); }
	  dbcustomers = db;
	});

	var LogTrace = function(obj){
	  var collection = dbaudit .collection('logregisters');
	  obj.createdat = Date.now();
	  collection.insert(obj);
	}

	var GetRegisters = function(filter, callback){
		var result; 
		dbland.collection('userlanding').find((filter || {})).toArray(function(err, docs){
			result = docs;	
			console.log(result);
			if (callback)
				callback(result);
		});
	}

	var GetRegister = function(filter, callback){
		dbland.collection('userlanding').find((filter)).toArray(function(err, docs){
			if (docs.length && docs[0].referenceCustomerId){
				GetCustomer({_id: objectId(docs[0].referenceCustomerId)}, function(err1, doc1){
				  if (callback){
				  	if (doc1.length) {
				  		var nn = doc1[0];
				  		nn.landing = docs[0];
				  		callback(nn);
				  	}else {
				  		callback({
				  			landing: docs[0],
				  			customer: ''		
				  		});
				  	}
				  }
				});
			}
			else{
				callback({
					landing: docs[0],
					customer: undefined
				});
			}
		});
	}

	var UpdateRegisters = function(data, callback){
		dbland.collection('userlanding').findAndModify({ _id:  objectId(data.landing._idstore) }, []
		,{$set: { action : 'cupdate', referenceCustomerId: data.referenceCustomerId } }
		,function(err, docs){
			if (err) {
				console.dir(err);
				callback(err);
			}
			console.log("updated...");
			console.log(docs);
			LogTrace(docs);
		});
	}

	var CheckDomain = function(data, callback){
		dbcustomers.collection('Customers').find({ 'subdomain' : data.subdomain } ).toArray(function(err, docs) {	
			if (err) console.dir(err);
			if (docs.length && !data._customerid){
				callback("Subdomain already taken");
			}else if(data._customerid){
				UpdateCustomer(data, function(err2, docs2){
					if (err2) {
						console.dir(err2);
						callback(err2);
					}
					callback(undefined);
				});
			}
			else {
				console.log(docs);
				CreatetCustomer(data, function(err1, docs1){
					if (err1) {
						console.dir(err1);
						callback(err1);
					}
					console.log(docs1);
					data.referenceCustomerId = data._id;
					UpdateRegisters(data);
					callback(undefined);
				});
			}
		});
	}

	var GetCustomer = function(filter, callback){
		console.log(filter);
		dbcustomers.collection('Customers').find((filter)).toArray(function(err, docs){
			console.log(docs);
			if (callback)
				callback(undefined, docs);
		});
	}

	var UpdateCustomer = function(data, callback){
		var __id = objectId(data._customerid);
		dbcustomers.collection('Customers').findAndModify({ _id:  __id }, []
		,{$set: data }
		,function(err, docs){
			if (err) {
				console.dir(err);
				callback(err);
			}
			console.log("updated...");
			console.log(docs);
			LogTrace(docs);
			callback(undefined);
		});
	}

	var CreatetCustomer = function(data, callback) {
		var collection = dbcustomers.collection('Customers');
	  	data.createdat = Date.now();
	  	collection.insert(data, function(err, docs){
	  		if (err) {
				console.dir(err);
				callback(err);
			}
			console.log(docs);
			callback(undefined, docs);
	  	});
	};

	return {
		logTrace: LogTrace,
		getRegisters: GetRegisters,
		getRegister: GetRegister,
		updateRegister: UpdateRegisters,
		checkDomain: CheckDomain,
		createCustomer: CreatetCustomer
	}
}


module.exports.daler = wrapper();