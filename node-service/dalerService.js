var wrapper = function (opt) {
	var opts = opt;
	var dbaudit,  dbclient, dbcustomers;

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

	var GetMyLocation = function(latitude, longitude){
		var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+latitude+","+longitude+"&key=";
		var response = opts.syncRequest('GET', url);
        var jsonData = JSON.parse(response.body);
        if(jsonData.results){
        	return jsonData.results[0].formatted_address;
        }else{
        	return "Error Occured";
        }
        console.log(jsonData);
	}

	var GetMyCustomers = function(serviceTypeId, servicesAvail, latitude, longitude, miles, minutes, callback) {
		//If we want to get customers based on distance minutes will be 0 and vice-versa.
        if(minutes == 0 ){
        	var meterValue = 1609.34;	//for converting miles to meters. Query purpose
            dbcustomers.collection('Customers').ensureIndex({"geo":"2dsphere"});
            dbcustomers.collection('Customers').find({$and:[{ "serviceId" : serviceTypeId}, {"serviceId" : {$in: servicesAvail}}, {"geo" : { $nearSphere : {$geometry: { type: "Point",  coordinates: [ Number(longitude), Number(latitude) ] }, $maxDistance: miles*meterValue}} }]}).toArray(function(err, docs) {
                if (err){ 
                    ReturnErrorCallback(err, callback);
                }
                callback(undefined, docs);
            });
        }else{
            dbcustomers.collection('Customers').find({$and: [{"serviceId" : serviceTypeId}, { "serviceId" : {$in: servicesAvail}}]}).toArray(function(err, docs) {
                if (err){ 
                    ReturnErrorCallback(err, callback);
                }
                callback(undefined,GetCustomersBasedOnTime(minutes, docs, latitude, longitude));
            });
        }
    }

    var GetCustomersBasedOnTime = function(minutes, customersResult, latitude, longitude){      
      for( i in customersResult){
        var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='+latitude+','+longitude+'&destinations='+customersResult[i].geo.coordinates[1]+','+customersResult[i].geo.coordinates[0]+'&key='
        var response = opts.syncRequest('GET', url);
        var jsonData = JSON.parse(response.body);
        
        if(jsonData.rows[0].elements[0].status === "OK"){
          var requiredTime = jsonData.rows[0].elements[0].duration.value/60;
          
          if(requiredTime > minutes ){
            delete customersResult[i];
          }else{
            customersResult[i].expectedTime = requiredTime;
          }
        }else{
          delete customersResult[i];
        }
      }

      var temp = [];
      var i;
      for (i = 0; i < customersResult.length; i++) {
          if (customersResult[i] != null) {
              temp.push(customersResult[i]);
          }
      }
      customersResult = temp;

      return customersResult;
    }

    var ReturnErrorCallback = function(err, callback){
        console.log(err);
        callback(true, undefined);
    }

	return {
		logTrace: LogTrace,
		authenticate: Authenticate,
		getMyServices: GetMyServices,
		getMyCustomers: GetMyCustomers,
		getMyLocation: GetMyLocation	
	}
}

module.exports.daler = wrapper;