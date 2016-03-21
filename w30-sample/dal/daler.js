var MongoClient = require('mongodb').MongoClient;

var wrapper = function() {

    var dbservices, dbAccessRules;
    MongoClient.connect("mongodb://localhost:27017/Services", function(err, db) {
        if (err) {
            console.log(err);
        }
        dbservices = db;
    });

    MongoClient.connect("mongodb://localhost:27017/AccessRules", function(err, db) {
        if (err) {
            console.log(err);
        }
        dbAccessRules = db;
    });

    var GetAccessType = function(obj, callback) {

        dbAccessRules.collection('details').find({"userId": obj }).toArray(function(err, docs) {
            if (err){
            	ReturnErrorCallback(err, callback);
            } 
            callback(undefined, docs);
        });
    }

    var GetAllServices = function(callback) {
        dbservices.collection('servicetypes').find().toArray(function(err, docs) {
            if (err){
            	ReturnErrorCallback(err, callback);
            } 
            callback(undefined, docs);
        });
    }

    var GetSpecificServices = function(serviceTypesArray, callback) {
        dbservices.collection('servicetypes').find({ "name": { $in: serviceTypesArray } }).toArray(function(err, docs) {
            if (err){
            	console.log(err);
            	callback(true, undefined);
            } 
            callback(undefined, docs);
        });
    }

    var GetAllSubServices = function(serviceType, callback) {
    	
    	dbservices.collection('servicetypes').find({"name": serviceType },{"_id": 1}).toArray(function(err, res){
    		if (err){
            	ReturnErrorCallback(err, callback);
            }

    		dbservices.collection('subservices').find({"serviceId" : (res[0]._id).toString()}).toArray(function(err, docs) {
	            if (err){
	            	ReturnErrorCallback(err, callback);
	            }
	            callback(undefined, docs);
	        });
    	});
    }

    var GetSpecificSubServices = function(serviceType, accessRules, callback) {
    	
    	dbservices.collection('servicetypes').find({"name": serviceType },{"_id": 1}).toArray(function(err, res){
    		if (err){
            	ReturnErrorCallback(err, callback);
            }

    		dbservices.collection('subservices').find({"serviceId" : (res[0]._id).toString(), "name" : {$in: accessRules.subServices}, "country" : {$in: accessRules.countries}}).toArray(function(err, docs) {
	            if (err){
	            	ReturnErrorCallback(err, callback);
	            }
	            callback(undefined, docs);
	        });
    	});
    }

    var ReturnErrorCallback = function(err, callback){
    	console.log(err);
    	callback(true, undefined);
    }

    return {
        getAccessType   		: 	GetAccessType,
        getAllServices          : 	GetAllServices,
        getSpecificServices 	: 	GetSpecificServices,
        getAllSubServices 		: 	GetAllSubServices,
        getSpecificSubServices	:   GetSpecificSubServices
    }
}

module.exports.daler = wrapper();