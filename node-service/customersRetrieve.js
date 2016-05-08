var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var syncRequest = require("sync-request");
var fs = require('fs');
var circular = require('circular-json')

var wrapper = function (opt) {
	var opts = opt;
	var dbaudit, dbcustomers, dbschedule;
	var ctx = this;

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

	var baseFuncs = {
		logFile:  function(obj){
			fs.writeFile("./sample.json", JSON.stringify(obj), function(err) {
			    if(err) {
			        return console.log(err);
			    }
			    console.log("The file was saved!");
			    return obj;
			}); 
		},
		GetFormattedTime : function(minutesToAdd, date){
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
		},
		GetFormattedDay : function(date){
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
		},
		mongoGet : function(detail){
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
	}

	var rules = {
		setDateTimes : function(bodyObj){
			bodyObj.userdate = bodyObj.userdate || new Date();
			bodyObj.timestring = baseFuncs.GetFormattedTime(0, bodyObj.userdate);
			bodyObj.today = baseFuncs.GetFormattedDay(bodyObj.userdate);
		},
		accessToService : function(obj) {
			if (obj.servicesAvail.indexOf(obj.bodyObj.serviceId) > -1)
				return Promise.resolve(obj);

			reject({
		      "Status": "Failed",
		      "Message": "Access denied to service.",
		      "Data": []
		    });
		},
		customerWithinPerimeter : function(obj) {
			return new Promise(function(resolve, reject){
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
				baseFuncs.mongoGet(obj).then(function(data){
					if (!data.docs.length){
				    	return reject({
				    		"Status": "Failed",
				      		"Message": "No customers found."
				    	});
				    }
				    return resolve(data);
				});
			});
		},
		customersWithinTime : function(data){
			return new Promise(function(resolve, reject){
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
		},
		customerSchedules: function(obj) {
			return new Promise(function(resolve, reject){
				//var date = new Date();
				var date = obj.bodyObj.userdate;
			    var timeString = baseFuncs.GetFormattedTime(0, date);
			    var today = baseFuncs.GetFormattedDay(date);
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
			    Promise.all(alldomains.map(baseFuncs.mongoGet)).then(function(data){
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
		},
		customersWithinWorkinghours: function(obj){
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
		},
		//TO DO: what far this?
		userAlreadyBooked: function(obj) {
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
		},
		customersPerdayCapacity: function(obj) {
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
		},
		customersAvailableSlot : function(obj){
			return new Promise(function(resolve, reject){
				obj.availables.forEach(function(item){
					if (item.processed)
						return true;
					var slotSearchFrom = baseFuncs.GetFormattedTime(item.expectedTime, obj.bodyObj.userdate);
					var slotSearchTo = baseFuncs.GetFormattedTime((item.expectedTime + Number(item.defaultDuration)), obj.bodyObj.userdate);
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
				return resolve(obj);
			});
		},
		error : function(data) {
			console.log(data);
		}
	}


	var GetMyCustomers = function(obj) {
		rules.setDateTimes(obj.bodyObj);
		rules.accessToService(obj)
		.then(rules.customerWithinPerimeter)
		.then(rules.customersWithinTime)
		.then(rules.customerSchedules)
		.then(rules.customersWithinWorkinghours)
		//.then(userAlreadyBooked)
		.then(rules.customersPerdayCapacity)
		.then(rules.customersAvailableSlot)
		.then(function(data){
			console.log(data);
		})
		.catch(function(error){
			console.log(error);
		});

		/*runGenerator( function *main(){ //Generator works
		    var result1 = yield rules.accessToService(obj);
		    console.log(result1);

		    var result2 = yield rules.customerWithinPerimeter(result1);
		    console.log(result2);
		} );*/
	}

	function runGenerator(g) {
	    var it = g(), ret;

	    // asynchronously iterate over generator
	    (function iterate(val){
	        ret = it.next( val );

	        if (!ret.done) {
	            // poor man's "is it a promise?" test
	            if ("then" in ret.value) {
	                // wait on the promise
	                ret.value.then( iterate );
	            }
	            // immediate value: just send right back in
	            else {
	                // avoid synchronous recursion
	                setTimeout( function(){
	                    iterate( ret.value );
	                }, 0 );
	            }
	        }
	    })();
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
		bodyObj: {
			miles: 100,
			minutes: 200,
			longitude: 78.4744,
			latitude: 17.3753,
			serviceId: '56f90f2e1c05d5734eec3271',
			userdate: new Date("2016-05-04 11:10:00")
		}, 
		servicesAvail: [ '56f90f2e1c05d5734eec3271' ]
	});
}, 500);