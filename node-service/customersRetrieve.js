var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var syncRequest = require("sync-request");
var fs = require('fs');
var circular = require('circular-json')

var wrapper = function (opt) {
	var opts = opt;
	var dbaudit, dbcustomers, dbschedule;

	opts.mongoClient.connect("mongodb://127.0.0.1:27017/Audit", function(err, db) {
	  	if(err) { return console.dir(err); }
	  	dbaudit = db;
	});

	opts.mongoClient.connect("mongodb://127.0.0.1:27017/Customers", function(err, db) {
	  	if(err) { return console.dir(err); }
	  	dbcustomers = db;
	});

	opts.mongoClient.connect("mongodb://127.0.0.1:27017/Schedule", function(err, db) {
	    if(err) { return console.dir(err); }
	    dbschedule = db;
	});

	var logFile = function(obj){
		fs.writeFile("./sample.json", JSON.stringify(obj), function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("The file was saved!");
		    return obj;
		}); 
	}

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

	var setDateTimes = function(bodyObj){
		bodyObj.userdate = bodyObj.userdate || new Date();
		bodyObj.timestring = GetFormattedTime(0, bodyObj.userdate);
		bodyObj.today = GetFormattedDay(bodyObj.userdate);
	}

	var mongoGet = function(detail){
	 	var ctx = this;
	 	var data = detail.dbdetail;
	 	return new Promise(function(resolve, reject){
	 		//console.log(data);
	 		//dbcustomers.collection('Customers').ensureIndex({geo:"2dsphere"});
	 		data.db.collection(data.collection).find(data.filter).toArray(function(err, res){
	 			if (err)
	 				return reject(err);
	 			detail.docs = res;
	 			resolve(detail);
	 		});
	 	});
	}

	var accessToService = function(obj){
		if (obj.servicesAvail.indexOf(obj.bodyObj.serviceId) > -1)
			return Promise.resolve(obj);

		reject({
	      "Status": "Failed",
	      "Message": "Access denied to service.",
	      "Data": []
	    });
	}

	var customerWithinPerimeter = function(obj) {
		var meterValue = 1609.34;
		obj.dbdetail = {
			filter: { $and: [ 
						{ serviceId : obj.bodyObj.serviceId}, 
						{ geo : 
							{ $nearSphere : 
								{ $geometry: 
									{ type: "Point",  
										coordinates: [ Number(obj.bodyObj.longitude), Number(obj.bodyObj.latitude) ] 
									}, 
									$maxDistance: obj.bodyObj.miles*meterValue
								}
							} 
						} 	]
					},
			collection: 'Customers',
			db: dbcustomers
		};
		return mongoGet(obj);
	}

	var customersWithinTime = function(data){
		return new Promise(function(resolve, reject){
		    if (!data.docs.length){
		    	return reject({
		    		"Status": "Failed",
		      		"Message": "No customers found."
		    	});
		    }

		    var langlat = data.docs.map(function(item, idx){
		    	return item.geo.coordinates[1] +','+item.geo.coordinates[0];
		    });
		    var url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins="+data.bodyObj.latitude+','+data.bodyObj.longitude+"&destinations="+langlat.join('|')+"&key=AIzaSyAjBEUatDTwvyslQtJYGxNATrh30BJHpH0";
		    var jsonData = JSON.parse(opts.syncRequest('GET', url).body);
		    if(jsonData.status === "OK"){
		    	data.availables = jsonData.rows[0].elements.reduce(function(all, item, idx){
		    		var requiredTime = item.duration.value/60;
		    		if (requiredTime <= data.bodyObj.minutes){
		    			data.docs[idx].destinationDistance = item.distance.value * 0.000621371; //Meters to miles conversion value
		    			data.docs[idx].expectedTime = requiredTime;
		    			all.push(data.docs[idx]);
		    		}
		    		return all;
		    	}, []);
		    	if (!data.availables.length){
		    		return reject({
		    			"Status": "Failed",
		    			"Message": "No customers within limit."
		    		});
		    	}
		    	return resolve(data);
		    }
		    return reject({
		    	"Status": "Failed",
		    	"Message": "Not valid latlong to locate customers."
		    });
		});
	}

	var customerSchedules = function(obj) {
		return new Promise(function(resolve, reject){
			//var date = new Date();
			var date = obj.bodyObj.userdate;
		    var timeString = GetFormattedTime(0, date);
		    var today = GetFormattedDay(date);
		    var alldomains = obj.availables.map(function(item, idx){
		    	return { 
		    		dbdetail : {
		    			filter: { 
		    				selecteddate: today 
		    			},
		    			collection: item.subdomain,
		    			db: dbschedule
		    		}
		    	};
		    });
		    Promise.all(alldomains.map(mongoGet)).then(function(data){
		    	obj.availables.forEach(function(item, idx){
		    		item.schedule = data[idx].docs;
		    	});
		    	return resolve(obj);
		    }).catch(function(error){
		    	return reject({
			    	"Status": "Failed",
			    	"Message": error
			    });
		    });
		});
	}

	var customersWithinWorkinghours = function(obj){
		return new Promise(function(resolve, reject){
			obj.availables.forEach(function(item, idx){
				if(obj.bodyObj.timestring < item.startHour || obj.bodyObj.timestring >= item.endHour){
	              item.slotsAvailable = 0;
	              item.message = "Out of working hours";
	              item.processed = true;
	            }
			});
			return resolve(obj);
		});
	}

	//TO DO: what far this?
	var userAlreadyBooked = function(obj) {
		/*
			for(k in docs){
	            if(docs[k].userId != ""){
	              if(docs[k].userId == bodyObj.userId && docs[k].data.startTime > currentTime){
	                customersResult[loop].slotBookedAt = docs[k].data.startTime;
	                break;
	              }
	            }
	          }
		*/
	}

	var customersPerdayCapacity = function(obj) {
		return new Promise(function(resolve, reject){
			obj.availables.forEach(function(item, idx){
				if(!item.processed && item.schedule.length > item.perdayCapacity){
	              item.message = "Slots filled for the day.";
	              item.processed = true;
	            }
			});
			delete obj["dbdetail"];
			delete obj["docs"];
			//logFile(obj);
			return resolve(obj);
		});
	}

	var customersAvailableSlot = function(obj){
		return new Promise(function(resolve, reject){
			obj.availables.forEach(function(item){
				if (item.processed)
					return true;
				var slotSearchFrom = GetFormattedTime(item.expectedTime, obj.bodyObj.userdate);
				var slotSearchTo = GetFormattedTime((item.expectedTime + Number(item.defaultDuration)), obj.bodyObj.userdate);
				var slots = item.schedule.filter(function(schd){
					return ((schd.data.startTime >= slotSearchFrom && schd.data.startTime < slotSearchTo) || 
							(schd.data.endTime >= slotSearchFrom && schd.data.endTime < slotSearchTo));
				});
				if (slots.length < item.perdayCapacity) {
					item.nextSlotAt = slotSearchFrom;
					item.message = "Slots Available";
	              	item.processed = true;
				}
			});
			logFile(obj);
			return resolve(obj);
		});
	}

	var GetMyCustomers = function(bodyObj, servicesAvail) {
		setDateTimes(bodyObj)
		accessToService({ 
			bodyObj: bodyObj, 
			servicesAvail: servicesAvail})
		.then(customerWithinPerimeter)
		.then(customersWithinTime)
		.then(customerSchedules)
		.then(customersWithinWorkinghours)
		//.then(userAlreadyBooked)
		.then(customersPerdayCapacity)
		.then(customersAvailableSlot)
		.catch(function(error){
			console.log(error);
		});
	}

	return {
		getMyCustomers: GetMyCustomers
	}
}

//module.exports.customers = wrapper;

var tt = wrapper({
	mongo: mongo,
	mongoClient: mongoClient,
	syncRequest: syncRequest,
	fs: fs,
	circular: circular
});

setTimeout(function(){
	tt.getMyCustomers({
			miles: 100,
			minutes: 200,
			longitude: 78.4744,
			latitude: 17.3753,
			serviceId: '56f90f2e1c05d5734eec3271',
			userdate: new Date("2016-05-04 11:10:00")
		}, 
		[ '56f90f2e1c05d5734eec3271' ]);
}, 500);