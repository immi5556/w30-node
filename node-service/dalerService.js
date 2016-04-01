var wrapper = function (opt) {
	var opts = opt;
	var dbaudit,  dbclient, dbcustomers, dbschedule;

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

  opts.mongoClient.connect("mongodb://localhost:27017/Schedule", function(err, db) {
      if(err) { return console.dir(err); }
      dbschedule = db;
      opts.muted = true;
  });

	DeAsync();

	var LogTrace = function(obj){
	  var collection = dbaudit .collection('LogClients');
	  obj.createdat = Date.now();
	  collection.insert(obj);
	};

  var LogCount = function(userId){
    var collection = dbaudit.collection('LogCount');
    collection.update({"userId":userId.toString()}, {$inc : { count: 1}, $set: {lastmodified: Date.now()}},{upsert:true});
  }

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

	var GetMyServices = function(obj, callback){
    console.log(obj.services);
		var serviceid = obj.services;
		for(i in serviceid){
		     serviceid[i] = opts.objectId(serviceid[i]);
		}
    	dbclient.collection('Services').find({ "_id" : {$in: serviceid}}).toArray(function(err, docs) {
            if (err){ 
                callback(err);
                return;
            }
            callback(docs);
        });
	}

	var GetMyCustomers = function(bodyObj, servicesAvail, callback) {
    var accessToService = false;
    for(var i in servicesAvail){
      if(servicesAvail[i] == bodyObj.serviceId){
        accessToService = true;
        break;
      }
    }
    if(accessToService){
      //Logic to get customers available in miles provided.
      var meterValue = 1609.34; //for converting miles to meters. Query purpose
      dbcustomers.collection('Customers').ensureIndex({"geo":"2dsphere"});
      dbcustomers.collection('Customers').find({$and:[{ "serviceId" : bodyObj.serviceId}, {"geo" : { $nearSphere : {$geometry: { type: "Point",  coordinates: [ Number(bodyObj.longitude), Number(bodyObj.latitude) ] }, $maxDistance: bodyObj.miles*meterValue}} }]}).toArray(function(err, docs) {
        if (err){
          callback(err, undefined);
        }else{
          CheckCustomersAvailInTime(docs, bodyObj, callback);
        }
      });
    }else{
      callback(undefined, "NoAccess");
    }
  }

  var CheckCustomersAvailInTime = function(customersResult, bodyObj, callback){
    console.log(customersResult);
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    var today = yyyy+'-'+mm+'-'+dd;
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var timeString = hours+':'+minutes;

    //Logic to get customers available in minutes provided.
    var i = 0;    
    for( i in customersResult){
      var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='+bodyObj.latitude+','+bodyObj.longitude+'&destinations='+customersResult[i].geo.coordinates[1]+','+customersResult[i].geo.coordinates[0]+'&key='
      var response = opts.syncRequest('GET', url);
      var jsonData = JSON.parse(response.body);
      
      if(jsonData.rows[0].elements[0].status === "OK"){
        var requiredTime = jsonData.rows[0].elements[0].duration.value/60;
        
        if(requiredTime > bodyObj.minutes || ( timeString < customersResult[i].startHour && timeString >= customersResult[i].endHour)){
          delete customersResult[i];
        }else{
          customersResult[i].expectedTime = requiredTime;
        }
      }else{
        delete customersResult[i];
      }
    }

    var temp = [];
    i = 0;
    for (i in customersResult) {
        if (customersResult[i] != null) {
            temp.push(customersResult[i]);
        }
    }
    customersResult = temp;

    //Logic to get slots available in minutes provided.
    if(customersResult.length){      
      var loop = 0;
      var maxTimeString = [];
      for(i = 0; i < customersResult.length; i++){
        hours = date.getHours();
        minutes = date.getMinutes();
        minutes += Number(customersResult[i].expectedTime);
        minutes = minutes.toFixed(0);
        if(minutes > 60){
          minutes -= 60;
          hours += 1;
        }

        maxTimeString[i] = hours+':'+minutes;

        dbschedule.collection(customersResult[i].subdomain).find({ "selecteddate" : today}).toArray(function(err, docs) {
          if (err){ 
            callback(err, undefined);
          }else{
            if(docs.length < customersResult[loop].perdayCapacity){
              //customersResult[loop].timeperperson = 10;
              var timeperperson = 10;
              var maxSlots = (bodyObj.minutes/timeperperson)*customersResult[loop].concurrentCount;
              var slotsFilled = 0;
              for(j in docs){
                if((maxTimeString[loop] >= docs[j].data.startTime && maxTimeString[loop] < docs[j].data.endTime)){
                  slotsFilled++;
                }
              }
              customersResult[loop].slotsAvailable = maxSlots - slotsFilled;
            }else{
              delete customersResult[i];
            }
            if (loop++ == customersResult.length-1) {
              GetSlotsCount(customersResult, callback);
            }
          }
        });
      }
    }else{
      callback(undefined, "NoCustomersAvailable");
    }
  }

  var GetSlotsCount = function(customersResult, callback){
    var temp = [];
    i = 0;
    for (i in customersResult) {
        if (customersResult[i] != null) {
            temp.push(customersResult[i]);
        }
    }
    customersResult = temp;
    callback(undefined, customersResult);
  }

	return {
		logTrace: LogTrace,
    logCount: LogCount,
		authenticate: Authenticate,
		getMyServices: GetMyServices,
		getMyCustomers: GetMyCustomers
	}
}

module.exports.daler = wrapper;