var MongoClient = require('mongodb').MongoClient,
ObjectId = require('mongodb').ObjectId;

var wrapper = function() {

    var dbservices, dbAccessRules, dbSchedule;
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

    MongoClient.connect("mongodb://localhost:27017/Schedule", function(err, db) {
        if (err) {
            console.log(err);
        }
        dbSchedule = db;
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

    var GetServiceById = function(subServiceId, callback){
        dbservices.collection('subservices').find({"_id" : ObjectId(subServiceId)}).toArray(function(err, docs) {
            if (err){
                ReturnErrorCallback(err, callback);
            }
            callback(undefined, docs);
        });
    }

    var GetTodaysBookingDetails = function(subServiceId, start, end, callback){
        dbSchedule.collection('details').find({"subServiceId" : subServiceId.toString(), "slotBooked" : { $gt: start}, "slotBooked" : { $lt: end} }).toArray(function(err, result) {
            if (err){
                ReturnErrorCallback(err, callback);
            }
            callback(undefined, result);
        });
    }

    var InsertSlotBookingData = function(data, callback){
        dbSchedule.collection('details').insertOne(data, function(err, result){
            if(err){
                callback(true, undefined);
            }

            if(result.insertedCount == 1){
                callback(undefined, "SlotBooked");
            }else{
                callback(undefined, "ErrorWhileInsert");
            }
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
        getSpecificSubServices	:   GetSpecificSubServices,
        getServiceById          :   GetServiceById,
        getTodaysBookingDetails :   GetTodaysBookingDetails,
        insertSlotBookingData   :   InsertSlotBookingData
    }
}

module.exports.daler = wrapper();