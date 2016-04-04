var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var objectId = mongo.ObjectId;
var wrapper = function () {
	var dbaudit, dbland, dbcustomer, dbsched;
	MongoClient.connect("mongodb://localhost:27017/Audit", {server: {poolSize: 1}}, function(err, db) {
	  if(err) { return console.dir(err); }
	  dbaudit = db;
	});

	MongoClient.connect("mongodb://localhost:27017/Customers", {server: {poolSize: 1}}, function(err, db) {
	  if(err) { return console.dir(err); }
	  dbcustomer = db;
	});

	MongoClient.connect("mongodb://localhost:27017/Schedule", {server: {poolSize: 1}}, function(err, db) {
	  if(err) { return console.dir(err); }
	  dbsched = db;
	});

	var LogSchedule = function(obj){
	  var collection = dbaudit .collection('logschedule');
	  obj.createdat = Date.now();
	  collection.insert(obj);
	}

	var GetDetails = function(data, callback){
		//dbclient.collection('Clients').find({ registration: { website:  { subdomain: data.registration.website.subdomain } } }).toArray(function(err, docs) {
		dbcustomer.collection('Customers').find({ 'subdomain' : data } ).toArray(function(err, docs) {	
			if (err) console.dir(err);
			if (!docs.length){
				callback("Invalid subdomain.");
			}else {
				callback(undefined, docs);
			}
		});
	}

	var GetAppts = function(data, callback){
		dbsched.collection(data.subdomain).find({ 'selecteddate' : data.selecteddate } ).toArray(function(err, docs) {	
			if (err) console.dir(err);
			callback(undefined, docs);
		});
	}

	var GetCounts = function(data, callback){
		dbsched.collection(data.subdomain).aggregate([
				{ $match: {"selecteddate": { $gte: data.selecteddate } } },
				{ $group: {"_id": "$selecteddate", "count": { $sum: 1 } } }
			]).toArray(function(err, docs) {	
			if (err) console.dir(err);
			callback(undefined, docs);
		});
	}

	var InsertSchedule = function(data){
		var collection = dbsched.collection(data.subdomain);
		data.createdat = Date.now();
		collection.insert(data);	
	}

	return {
		logSchedule: LogSchedule,
		getDetails: GetDetails,
		insertSchedule: InsertSchedule,
		getAppts: GetAppts,
		getCounts: GetCounts
	}
}


module.exports.daler = wrapper();