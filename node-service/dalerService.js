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
          console.log(bodyObj);
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
    var date = new Date();
    var today = GetFormattedDay(date);
    var timeString = GetFormattedTime(0, date);

    //Logic to get customers available in minutes provided.
    var i = 0;
    var distanceLoop = 0;
    if(customersResult.length){
      var url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins="+bodyObj.latitude+','+bodyObj.longitude+"&destinations=";
      for( i in customersResult){
        url += customersResult[i].geo.coordinates[1]+','+customersResult[i].geo.coordinates[0]+"|";
      }
      url = url.substring(0, (url.length-1))+"&key=AIzaSyAjBEUatDTwvyslQtJYGxNATrh30BJHpH0";
      var jsonData = JSON.parse(opts.syncRequest('GET', url).body);
      if(jsonData.status === "OK"){
        for( var i = 0; i < jsonData.rows[0].elements.length; i++){
          if(jsonData.rows[0].elements[i].status === "OK"){
            var requiredTime = jsonData.rows[0].elements[i].duration.value/60;
            
            if(requiredTime > bodyObj.minutes){
              delete customersResult[i];
            }else{
              customersResult[i].destinationDistance = jsonData.rows[0].elements[i].distance.value * 0.000621371; //Meters to miles conversion value
              customersResult[i].expectedTime = requiredTime;
            }
          }else{
            delete customersResult[i];
          }
        }
        customersResult = RemoveNulls(customersResult);
        GetSlotsAvailable(customersResult, bodyObj, callback);
      }else{
        response.Message = "No customers available";
        callback(response);
      }
    }else{
      response.Message = "No customers available";
      callback(response);
    }
  }

  var GetSlotsAvailable = function(customersResult, bodyObj, callback){
    //Logic to get slots available in minutes provided.
    var response = {
      "Status": "Failed",
      "Message": "",
      "Data": []
      }
    var date = new Date();
    var timeString = GetFormattedTime(0, date);
    var today = GetFormattedDay(date);
    if(customersResult.length){
      var loop = 0;
      var slotsFilled = [],
          timeperperson = [],
          maxSlots = [],
          slotSearchFrom = [],
          slotSearchTo = GetFormattedTime(bodyObj.minutes, date);

      for(i = 0; i < customersResult.length; i++){
        slotSearchFrom[i] = GetFormattedTime(customersResult[i].expectedTime, date);
        dbschedule.collection(customersResult[i].subdomain).find({ "selecteddate" : today}).toArray(function(err, docs) {
          if (err){
            response.Message = "ErrorOccured";
            callback(response);
          }else{
            customersResult[loop].slotBookedAt = "";
            if(timeString < customersResult[loop].startHour || timeString >= customersResult[loop].endHour){
              customersResult[loop].slotsAvailable = 0;
              customersResult[loop].message = "Out of working hours";
            }else{
              var currentTime = GetFormattedTime(0, new Date());
              
              for(k in docs){
                if(docs[k].userId != ""){
                  if(docs[k].userId == bodyObj.userId && docs[k].data.startTime > currentTime){
                    customersResult[loop].slotBookedAt = docs[k].data.startTime;
                    break;
                  }
                }
              }
              if(docs.length < customersResult[loop].perdayCapacity){
                customersResult[loop] = NextSlotAt(docs, customersResult[loop], -1, bodyObj.minutes);
                /*timeperperson[loop] = Number(customersResult[loop].defaultDuration);
                maxSlots[loop] = 0;
                if(customersResult[loop].concurrentCount){
                  maxSlots[loop] = customersResult[loop].concurrentCount
                }else{
                  maxSlots[loop] = customersResult[loop].concurrentCount
                }
                
                slotsFilled[loop] = 0;
                for(j in docs){
                  if(docs[j].data.startTime >= slotSearchFrom[loop] && docs[j].data.startTime < slotSearchTo || docs[j].data.endTime >= slotSearchFrom[loop] && docs[j].data.endTime < slotSearchTo){
                    slotsFilled[loop]++;
                  }
                }

                if((maxSlots[loop]-slotsFilled[loop]) > (Number(customersResult[loop].perdayCapacity)-docs.length)){
                  customersResult[loop].slotsAvailable = Number(customersResult[loop].perdayCapacity)-docs.length;
                }else{
                  customersResult[loop].slotsAvailable = maxSlots[loop] - slotsFilled[loop];
                }

                if(customersResult[loop].slotsAvailable <= 0){
                  customersResult[loop].slotsAvailable = 0;
                  customersResult[loop].nextSlotAt = NextSlotAt(docs, customersResult[loop], bodyObj.minutes);
                }else{
                  customersResult[loop].nextSlotAt = "";
                }*/
              }else{
                customersResult[loop].slotsAvailable = 0;
                customersResult[loop].message = "Slots filled for today";
              }
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
      response.Message = "No customers available";
      callback(response);
    }
  }

    var NextSlotAt = function(appointmentDocs, customerData, minutes, reqTime){
      var startTimeString = GetFormattedTime((Number(minutes)+1), new Date());
      var endTimeString = GetFormattedTime((Number(customerData.defaultDuration)+Number(minutes)), new Date());
      var availability = 0;
      for(var i = 0; i < appointmentDocs.length; i++){
        if(startTimeString >= appointmentDocs[i].data['startTime'] && startTimeString <= appointmentDocs[i].data['endTime'] || endTimeString >= appointmentDocs[i].data['startTime'] && endTimeString <= appointmentDocs[i].data['endTime']){
            availability++;
        }
      }
      if(!customerData.concurrentCount){
        customerData.concurrentCount = 1;
      }
      customerData.slotsAvailable = customerData.concurrentCount - availability;
        
      //we can remove this condition once we implement spec.  
      if(customerData.slotsAvailable < 0)
        customerData.slotsAvailable = 0;
    
      if(customerData.slotsAvailable === 0){
        var maxTime  = customerData.endHour;
        if(startTimeString <= maxTime){
          NextSlotAt(appointmentDocs, customerData, Number(minutes)+1, reqTime);
        }else{
          customerData.nextSlotAt = "Slots filled for today";
        }
      }else{
        if(startTimeString <= GetFormattedTime((Number(reqTime)), new Date())){
          customerData.nextSlotAt = "";
        }else{
          customerData.nextSlotAt = startTimeString;
          customerData.slotsAvailable = 0;
        }
      } 
      return customerData;
    }


  var BookASlot = function(bodyObj, servicesAvail, callback){
    var response ={
      "Status": "Failed",
      "Message": ""
    };
    
    dbcustomers.collection("Customers").find({ "subdomain" : bodyObj.subDomain}).toArray(function(err, docs) {
      if(err){
        console.log(err);
        response.Message = "Error Occured";
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
            bodyObj.maxEndTime = GetFormattedTime(bodyObj.minutes, new Date(bodyObj.date));
            bookSlotProcess(docs, bodyObj, callback);
          }else{
            response.Message = "No Access";
            callback(response);
          }
        } else{
          response.Message = "Domain Not Found";
          callback(response);
        }
      }
    });
  }

  var bookSlotProcess = function(docs, bodyObj, callback){
    var response ={
      "Status": "Failed",
      "Message": ""
    };
    var timeperperson = docs[0].defaultDuration;
    var date = new Date(bodyObj.date);
    var start = date.getHours() * 60* 60 + date.getMinutes() * 60;
    var end = start + timeperperson * 60;
    var startTimeString = GetFormattedTime(0, date);
    var endTimeString = GetFormattedTime(Number(timeperperson), date);
    var date = GetFormattedDay(date);
    var data = formatBookSlotInsertDate(date, bodyObj, docs, start, end, startTimeString, endTimeString);
    
    if(startTimeString >= docs[0].startHour && endTimeString < docs[0].endHour){
      dbschedule.collection(bodyObj.subDomain).find({ "selecteddate" : date}).toArray(function(err, result) {
        if(err){
          console.log(err);
          response.Message = "Error Occured";
          callback(response);
        }else{
          if(result.length < docs[0].perdayCapacity){
            var availability = 0, personBooking = 0;
            for(var i = 0; i < result.length; i++){
              if(startTimeString >= result[i].data['startTime'] && startTimeString <= result[i].data['endTime'] || endTimeString >= result[i].data['startTime'] && endTimeString <= result[i].data['endTime']){
                  availability++;
              }
            }
            if(!docs[0].concurrentCount){
              docs[0].concurrentCount = 1;
            }
            if(availability >= docs[0].concurrentCount){
              var maxTime  = bodyObj.maxEndTime;
              var newDate = GetFormattedDay(new Date(date));
              var newTime = GetFormattedTime(1, new Date(bodyObj.date));
              if(newTime <= maxTime){
                bodyObj.date = newDate+" "+newTime;
                bookSlotProcess(docs, bodyObj, callback);
              }else{
                response.Message = "Slots Filled";
                callback(response);
              }
            }else{
              dbschedule.collection(bodyObj.subDomain).insert(data,function(err, output){
                if(err){
                  console.log(err);
                  response.Message = "Error Occured";
                  callback(response);
                }else{
                  response.action = "insert"
                  response.Status = "Ok";
                  response.Message = "Slot Booked";
                  response.startTime = startTimeString;
                  callback(response);    
                }
              });
            }
          }else{
            response.Message = "Limit For The Day Reached";
            callback(response);
          }
        }
      });
    }else{
      response.Message = "Out Of Working Hours";
      callback(response);
    }
  }

  var formatBookSlotInsertDate = function(date, bodyObj, docs, start, end, startTimeString, endTimeString){
    var GeneralTimeline = 0;

    for(i in docs[0].specialities){
      if(docs[0].specialities[i].name == "General"){
        GeneralTimeline = i;
      }
    }

    return {
              "userId" : bodyObj.userId,
              "action" : "insert",
              "selecteddate" : date,
              "subdomain" : bodyObj.subDomain,
              "data" : {
                  "timeline" : GeneralTimeline,
                  "start" : start,
                  "end" : end,
                  "startTime" : startTimeString,
                  "endTime" : endTimeString,
                  "text" : "",
                  "autoAcknowledge": docs[0].autoAcknowledge,
                  "confirm" : true,
                  "data" : {
                      "email" : bodyObj.email,
                      "mobile" : bodyObj.mobile,
                      "details" : "",
                      "resources" : []
                  }
              },
              "createdat" : Date.parse(new Date())
            };
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

  var SubmitRating = function(obj, user, callback){
    //input: rating, customerId, user email or mobile(optional).
    var responseObj = {
      status: "Ok",
      Message: ""
    }
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
