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
    var response = {
      "Status": "Failed",
      "Message": "",
      "Data": []
    }
		var serviceid = obj.services;
		for(i in serviceid){
		     serviceid[i] = opts.objectId(serviceid[i]);
		}
  	dbclient.collection('Services').find({ "_id" : {$in: serviceid}}).toArray(function(err, docs) {
      if (err){
        response.Message = "ErrorOccured";
      }else{
        response.Status = "Ok";
        response.Message = "Success";
        response.Data = docs;
      }
      callback(response);
    });
	}

	var GetMyCustomers = function(bodyObj, servicesAvail, callback) {
    var response = {
      "Status": "Failed",
      "Message": "",
      "Data": []
    }
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
      dbcustomers.collection('Customers').ensureIndex({geo:"2dsphere"});
      dbcustomers.collection('Customers').find({$and:[{ serviceId : bodyObj.serviceId}, {geo : { $nearSphere : {$geometry: { type: "Point",  coordinates: [ Number(bodyObj.longitude), Number(bodyObj.latitude) ] }, $maxDistance: bodyObj.miles*meterValue}} }]}).toArray(function(err, docs) {
        if (err){
          response.Message = "ErrorOccured";
          callback(response);
        }else{
          CheckCustomersAvailInTime(docs, bodyObj, callback);
        }
      });
    }else{
      response.Message = "NoAccess";
      callback(response);
    }
  }

  var CheckCustomersAvailInTime = function(customersResult, bodyObj, callback){
    var response = {
      "Status": "Failed",
      "Message": "",
      "Data": []
    }
     
    var today = GetFormattedDay();
    var timeString = GetFormattedTime(0);

    //Logic to get customers available in minutes provided.
    var i = 0;    
    for( i in customersResult){
      var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='+bodyObj.latitude+','+bodyObj.longitude+'&destinations='+customersResult[i].geo.coordinates[1]+','+customersResult[i].geo.coordinates[0]+'&key='
      var rspns = opts.syncRequest('GET', url);
      var jsonData = JSON.parse(rspns.body);
      
      if(jsonData.rows[0].elements[0].status === "OK"){
        var requiredTime = jsonData.rows[0].elements[0].duration.value/60;
        if(requiredTime > bodyObj.minutes || timeString < customersResult[i].startHour || timeString >= customersResult[i].endHour){
          delete customersResult[i];
        }else{
          customersResult[i].destinationDistance = jsonData.rows[0].elements[0].distance.value * 0.000621371; //Meters to miles conversion value
          customersResult[i].expectedTime = requiredTime;
        }
      }else{
        delete customersResult[i];
      }
    }
    customersResult = RemoveNulls(customersResult);

    //Logic to get slots available in minutes provided.
    if(customersResult.length){
      var loop = 0;
      var slotSearchFrom = [],
          slotSearchTo = GetFormattedTime(bodyObj.minutes);

      for(i = 0; i < customersResult.length; i++){
        slotSearchFrom[i] = GetFormattedTime(customersResult[i].expectedTime);

        dbschedule.collection(customersResult[i].subdomain).find({ "selecteddate" : today}).toArray(function(err, docs) {
          if (err){
            response.Message = "ErrorOccured";
            callback(response);
          }else{
            if(docs.length < customersResult[loop].perdayCapacity){
              var timeperperson = customersResult[loop].defaultDuration;
              var maxSlots = 0;
              if(customersResult[loop].concurrentCount){
                maxSlots = (((bodyObj.minutes-customersResult[loop].expectedTime)/timeperperson)+0.5).toFixed(0)*customersResult[loop].concurrentCount;
              }else{
                maxSlots = (((bodyObj.minutes-customersResult[loop].expectedTime)/timeperperson)+0.5).toFixed(0);
              }
              
              var slotsFilled = 0;
              for(j in docs){
                if(docs[j].data.startTime >= slotSearchFrom[loop] && docs[j].data.startTime < slotSearchTo || docs[j].data.endTime >= slotSearchFrom[loop] && docs[j].data.endTime < slotSearchTo){
                  slotsFilled++;
                }
              }
              
              if((maxSlots-slotsFilled) > (customersResult[loop].perdayCapacity-docs.length)){
                customersResult[loop].slotsAvailable = customersResult[loop].perdayCapacity-docs.length;
              }else{
                customersResult[loop].slotsAvailable = maxSlots - slotsFilled;
              }
            }else{
              delete customersResult[loop];
            }
            if (loop++ == customersResult.length-1) {
              response.Status = "Ok";
              response.Message = "Success";
              response.Data = RemoveNulls(customersResult);
              callback(response);
            }
          }
        });
      }
    }else{
      response.Message = "NoCustomersAvailable";
      callback(response);
    }
  }

  var RemoveNulls = function(customersResult){
    var temp = [];
    i = 0;
    for (i in customersResult) {
        if (customersResult[i] != null) {
            temp.push(customersResult[i]);
        }
    }
    return temp;
  }

  var GetFormattedDay = function(){
    var date = new Date();
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

  var GetFormattedTime = function(minutesToAdd){
    var date = new Date();
    hours = date.getHours();
    minutes = date.getMinutes();
    minutes += Number(minutesToAdd);
    minutes = minutes.toFixed(0);
    if(minutes > 60){
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


  var BookASlot = function(bodyObj, servicesAvail, callback){
    var response ={
      "Status": "Failed",
      "Message": ""
    };
    
    dbcustomers.collection("Customers").find({ "subdomain" : bodyObj.subDomain}).toArray(function(err, docs) {
      if(err){
        console.log(err);
        response.Message = "ErrorOccured";
        callback(response);
      }else{
        if(docs.length > 0){
          var accessToService = false;
          for(var i in servicesAvail){
            if(servicesAvail[i] == docs[0].serviceId){
              accessToService = true;
              break;
            }
          }
          if(accessToService){
            var timeperperson = docs[0].defaultDuration;
            var date = new Date(bodyObj.date);
            var dd = date.getDate();
            var mm = date.getMonth()+1;
            var yyyy = date.getFullYear();
            if(dd<10){
                dd='0'+dd
            } 
            if(mm<10){
                mm='0'+mm
            }
            var start = date.getHours() * 60* 60 + date.getMinutes() * 60;
            var end = start + timeperperson * 60;
            var startHours = date.getHours();
            var startMinutes = date.getMinutes();
            if(startHours < 10){
              startHours = "0"+startHours;
            }
            if(startMinutes < 10){
              startMinutes = "0"+startMinutes;
            }
            var startTimeString = startHours+":"+startMinutes;
            var endHours = date.getHours();
            var endMinutes = date.getMinutes() + Number(timeperperson);
            
            if(endMinutes > 60){
              endMinutes -= 60;
              endHours += 1;
            }
            if(endHours < 10){
              endHours = "0"+endHours;
            }
            if(endMinutes < 10){
              endMinutes = "0"+endMinutes;
            }
            var endTimeString = endHours+':'+endMinutes;
            var date = yyyy+'-'+mm+'-'+dd;
            var data = {
              "action" : "insert",
              "selecteddate" : date,
              "subdomain" : bodyObj.subDomain,
              "data" : {
                  "timeline" : 0,
                  "start" : start,
                  "end" : end,
                  "startTime" : startTimeString,
                  "endTime" : endTimeString,
                  "text" : "",
                  "data" : {
                      "email" : bodyObj.email,
                      "mobile" : bodyObj.mobile,
                      "details" : "",
                      "resources" : []
                  }
              },
              "createdat" : Date.parse(new Date())
            };
            if(startTimeString >= docs[0].startHour && endTimeString < docs[0].endHour){
              dbschedule.collection(bodyObj.subDomain).find({ "selecteddate" : date}).toArray(function(err, result) {
                if(err){
                  console.log(err);
                  response.Message = "ErrorOccured";
                  callback(response);
                }else{
                  if(result.length < docs[0].perdayCapacity){
                    var availability = 0, personBooking = 0;
                    for(var i = 0; i < result.length; i++){           
                      if(startTimeString >= result[i].data['startTime'] && startTimeString <= result[i].data['endTime']){
                          availability++;
                      }

                      //if((result[i].data.data.email.length > 0 && result[i].data.data.email == bodyObj.email) || (result[i].data.data.mobile.length > 0 && result[i].data.data.mobile == bodyObj.mobile)){
                      //    personBooking++;
                      //}
                    }
                    if(availability >= docs[0].concurrentCount){
                      response.Message = "SlotsFilled";
                      callback(response);
                    }else{
                      dbschedule.collection(bodyObj.subDomain).insert(data,function(err, output){
                        if(err){
                          console.log(err);
                          response.Message = "ErrorOccured";
                          callback(response);
                        }else{
                          response.Status = "Ok";
                          response.Message = "SlotBooked";
                          callback(response);    
                        }
                      });
                    }
                  }else{
                    response.Message = "LimitForTheDayReached";
                    callback(response);
                  }
                }
              });
            }else{
              response.Message = "OutOfWorkingHours";
              callback(response);
            }
          }else{
            response.Message = "NoAccess";
            callback(response);
          }
        } else{
          response.Message = "DomainNotFound";
          callback(response);
        }
      }
    });
  }

  var SubmitRating = function(obj, user, callback){
    //input: rating, customerId, user email or mobile(optional).
    var responseObj = {
      status: "Ok",
      Message: ""
    }
    console.log(obj);
    dbcustomers.collection("Customers").find({ _id: opts.objectId(obj.customerId)}).toArray(function(err, customersDocs) {
      if(err){
        responseObj.status = "Failed";
        responseObj.Message = "ErrorOccured";
        callback(responseObj);
      }else{
        if(customersDocs.length){
          var insertObj = {
            "customerId": obj.customerId,
            "userId": user._id.toString(),
            "rating": obj.rating,
            "user": {
              "email": obj.email,
              "mobile": obj.mobile
            }
          }

          dbaudit.collection("LogRating").insert(insertObj, function(err, result){
            if(err){
              responseObj.status = "Failed";
              responseObj.Message = "ErrorOccured";
              callback(responseObj);
            }else{
              dbaudit.collection("LogRating").find({ customerId: obj.customerId}).toArray(function(err, ratingDocs) {
                if(err){
                  callback(responseObj);
                }else{
                  var ratingValue = 0;
                  for(var i = 0; i < ratingDocs.length; i++){
                    ratingValue += Number(ratingDocs[i].rating);
                  }
                  dbcustomers.collection("Customers").update({_id:opts.objectId(obj.customerId)}, { $set: {rating: ratingValue/ratingDocs.length}},{upsert:true});
                  responseObj.status = "Success";
                  responseObj.Message = "UpdatedSuccessfully";
                  callback(responseObj);
                }
              });
            }
          });
        }else{
          responseObj.status = "Failed";
          responseObj.Message = "WrongCustomerId";
          callback(responseObj);
        }
      }
    });
  }

	return {
		logTrace: LogTrace,
    logCount: LogCount,
		authenticate: Authenticate,
		getMyServices: GetMyServices,
		getMyCustomers: GetMyCustomers,
    bookASlot: BookASlot,
    submitRating: SubmitRating
	}
}

module.exports.daler = wrapper;
