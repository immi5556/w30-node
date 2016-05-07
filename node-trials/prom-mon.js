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

/*
 { 
	filter: data, 
	collection: collection,
	db: db
 }
*/
var mongoGet = function(data){
 	var ctx = this;
 	return new Promise(function(resolve, reject){
 		//console.log(data);
 		//dbcustomers.collection('Customers').ensureIndex({geo:"2dsphere"});
 		data.db.collection(data.collection).find(data.filter).toArray(function(err, res){
 			if (err)
 				return reject(err);
 			resolve(res);
 		});
 	});
}

var callMongo = function(){
	var meterValue = 1609.34;
	var bodyObj = {
		miles: 100,
		longitude: 78.4744,
		latitude: 17.3753,
		serviceId: '56f90f2e1c05d5734eec3271'
	}
	return mongoGet({
		filter: { $and: [ 
					{ serviceId : bodyObj.serviceId}, 
					{geo : 
						{ $nearSphere : 
							{ $geometry: 
								{ type: "Point",  
									coordinates: [ Number(bodyObj.longitude), Number(bodyObj.latitude) ] }, 
								  $maxDistance: bodyObj.miles*meterValue
						}
					} 
				} ]
			},
		collection: 'Customers',
		db: dbcustomers
	});
};

setTimeout(function() {
	callMongo().then(function(data){
		console.log(data.length);
		data.push({});
		return data;
	}).then(function(data){
		console.log(data.length);
		data.push({});
		return data;
	});
}, 500);