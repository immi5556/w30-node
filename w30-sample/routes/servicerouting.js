var request = require("sync-request");

module.exports = function(app, daler){

  app.post('/endpoint/getServices/:id', function(req, res){

      daler.getAccessType(req.params.id, function(err, result){
        if(err){
          console.log(err);
          res.send("Error Occured");
        }

        if (result.length === 0) {
            daler.getAllServices(sendResponse);
        } else {
          daler.getSpecificServices(result[0].accessRules.services, sendResponse);  
        }
      });

    var sendResponse = function(err, serviceResult){
      if(err){
        console.log(err);
        res.send("Error Occured");
      }
      res.send(serviceResult);
    }
  });

  app.post('/endpoint/getSubServices/:serviceId/:lat/:long/:miles/:mins/:id', function(req, res){
    daler.getAccessType(req.params.id, function(err, result){
      if(err){
        console.log(err);
        res.send("Error Occured");
      }
      
      if (result.length === 0) {
          res.send("WrongAPIKey");
      } else {
        daler.getSubServices(req.params.serviceId, result[0].accessRules, req.params.lat, req.params.long, req.params.miles, sendResponse);
      }
    });

    var sendResponse = function(err, serviceResult){
      if(err){
        console.log(err);
        res.send("Error Occured");
      }
      
      for( i in serviceResult){
        var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='+req.params.lat+','+req.params.long+'&destinations='+serviceResult[i].geo.coordinates[1]+','+serviceResult[i].geo.coordinates[0]+'&key='
        var response = request('GET', url);
        var jsonData = JSON.parse(response.body);
        
        if(jsonData.rows[0].elements[0].status === "OK"){
          var requiredTime = jsonData.rows[0].elements[0].duration.value/60;
          
          if(requiredTime > req.params.mins ){
            delete serviceResult[i];
          }else{
            serviceResult[i].expectedTime = requiredTime;
          }
        }else{
          delete serviceResult[i];
        }
      }

      var temp = [];
      var i;
      for (i = 0; i < serviceResult.length; i++) {
          if (serviceResult[i] != null) {
              temp.push(serviceResult[i]);
          }
      }
      serviceResult = temp;

      res.send(serviceResult);
      
    }
  });

  app.post('/endpoint/bookSlot/:subServiceId/:bookedBy/:timeToReach', function(req, res){
    var date = new Date();
    var currentTimeStamp = Date.parse(new Date());
    var data = {};
    data.subServiceId = req.params.subServiceId;
    data.bookedBy = req.params.bookedBy;
    data.bookedAt = currentTimeStamp;
    data.slotBooked = currentTimeStamp + (req.params.timeToReach*60*1000);
    var start = new Date();
    start.setHours(0,0,0,0);

    var end = new Date();
    end.setHours(23,59,59,999);

    var hours = date.getHours();
    var minutes = date.getMinutes() + Number(req.params.timeToReach);
    
    if(minutes > 60){
      minutes -= 60;
      hours += 1;
    }
    var timeString = hours+':'+minutes;
    
    daler.getServiceById(req.params.subServiceId, function(err, docs){
      if(err){
        console.log(err);
        res.send("Error Occured");
      }

      if(docs.length > 0){
        if(timeString > docs[0].startHour && timeString < docs[0].endHour){
          daler.getTodaysBookingDetails(req.params.subServiceId, Date.parse(start), Date.parse(end), function(err, result){
            if(err){
              console.log(err);
              res.send("Error Occured");
            }
                  
            if(result.length <= docs[0].perdayCapacity){
                var availability = 0, personBooking = 0;
                var appointmentStart, appointmentEnd, appointmentRequestTime;
                for(var i = 0; i < result.length; i++){
                  appointmentStart = result[i].slotBooked;
                  appointmentEnd = result[i].slotBooked + (docs[0].timeForPerson*60*1000);
                  appointmentRequestTime = data.slotBooked;
            
                  if(appointmentRequestTime >= appointmentStart && appointmentRequestTime < appointmentEnd){
                      availability++;
                  }

                  if(result[i].bookedBy === req.params.bookedBy){
                      personBooking++;
                  }
                }

                if(availability >= docs[0].concurrentCount){
                    res.send("SlotsFilled");
                }else if(personBooking < 3){
                    //Need clarification on fixing 3 times for a person/day store in DB or not.
                    daler.insertSlotBookingData(data, sendResponse);
                }else{
                    res.send("YourQuotaPerDayExceeded");
                }
            }else{
                res.send("LimitForTheDayReached");
            }
          });
        }else{
            res.send("OutOfWorkingHours");
        }
      } else{
        res.send("wrongServiceType");
      }

      var sendResponse = function(err, serviceResult){
        if(err){
          console.log(err);
          res.send("Error Occured");
        }
        res.send(serviceResult);
      }
    });
  });
}