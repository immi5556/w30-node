var wrapper = function (opt) {
	var opts = opt;
	var dbaudit, dbcustomers;

	opts.mongoClient.connect("mongodb://localhost:27017/Audit", function(err, db) {
	  if(err) { return console.dir(err); }
	  dbaudit = db;
	});

	opts.mongoClient.connect("mongodb://localhost:27017/Customers", function(err, db) {
	  	if(err) { return console.dir(err); }
	  	dbcustomers = db;
	});

	var GetFormattedTime = function(minutesToAdd, date){
	    hours = date.getHours();
	    minutes = date.getMinutes();
	    minutes += Number(minutesToAdd);
	    minutes = minutes.toFixed(0);
	    if(minutes >= 60){
	      minutes -= 60;
	      hours += 1;
	    }
	    if(hours < 10){
	      hours = "0"+hours;
	    }
	    if(minutes < 10){
	      minutes = "0"+minutes;
	    }
	    return hours+":"+minutes;
	  }

	var GetFormattedDay = function(date){
	    var dd = date.getDate();
	    var mm = date.getMonth()+1;
	    var yyyy = date.getFullYear();
	    if(dd<10){
	        dd='0'+dd;
	    } 
	    if(mm<10){
	        mm='0'+mm;
	    }
	    return yyyy+'-'+mm+'-'+dd;
	  }

	var GetMyCustomers = function(bodyObj, servicesAvail) {
		//accessToService(bodyObj, servicesAvail).then()
	}

	var accessToService = function(bodyObj, servicesAvail){
		return new Promise(function(resolve, reject) {
			var allowed = false;
			try {
			    for(var i in servicesAvail){
			      if(servicesAvail[i] == bodyObj.serviceId){
			        allowed = true;
			        break;
			      }
			    }
			    resolve(allowed);
			}
			catch(exp) {
				reject(exp);
			}
		});
	}

	var customerWithinPerimeter = function() {
		var response = {
		      "Status": "Failed",
		      "Message": "",
		      "Data": []
		    }
		return new Promise(function(resolve, reject){
			  var meterValue = 1609.34; //for converting miles to meters. Query purpose
		      dbcustomers.collection('Customers').ensureIndex({geo:"2dsphere"});
		      dbcustomers.collection('Customers').find({ $and: [ 
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
				}).toArray(function(err, docs) {
			        if (err){
			          response.Message = "ErrorOccured";
			          reject(response);
			        }else{
			          resolve(docs)
			        }
			      });
		});
	}

	var customersAvailablity = function(bodyObj, customersResult){
		return new Promise(function(resolve, reject){
			var response = {
		      "Status": "Failed",
		      "Message": "",
		      "Data": []
		    }
		    var date = new Date();
		    var today = GetFormattedDay(date);
		    var timeString = GetFormattedTime(0, date);
		    var i = 0;
		    var distanceLoop = 0;
		});
	}

	var getDistance = function(bodyObj, customer){
		return new Promise(function(resolve, reject){
			opts.googleDistance.get({
			          index: i,
			          origin: bodyObj.latitude+','+bodyObj.longitude,
			          destination: customer.geo.coordinates[1]+','+customer.geo.coordinates[0],
			          mode: 'driving'
			        },
			        function(err, data) {
			        	if (err)
			        		reject(err)
			        	resolve(data);
			        });
		});
	}

	var customerDistances = function*(bodyObj, customersResult){
		return new Promise(function(resolve, reject) {
			for(i in customersResult){
				var data = yield getDistance(bodyObj, customersResult)
		        var requiredTime = data.durationValue/60;
		        if(requiredTime > bodyObj.minutes){
	              delete customersResult[data.index];
		        } else {
	              customersResult[i].destinationDistance = data.distanceValue * 0.000621371; //Meters to miles conversion value
	              customersResult[i].expectedTime = requiredTime;
	            }
		    }
		    customersResult = RemoveNulls(customersResult);
		});
	}

	return {
		getMyCustomers: GetMyCustomers
	}
}

module.exports.customers = wrapper;
