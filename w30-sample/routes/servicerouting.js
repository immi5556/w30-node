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

  app.post('/endpoint/getSubServices/:service/:id', function(req, res){
    daler.getAccessType(req.params.id, function(err, result){
      if(err){
        console.log(err);
        res.send("Error Occured");
      }
      
      if (result.length === 0) {
          daler.getAllSubServices(req.params.service, sendResponse);
      } else {
        daler.getSpecificSubServices(req.params.service, result[0].accessRules, sendResponse);
      }
    });

    var sendResponse = function(err, serviceResult){
      if(err){
        console.log(err);
        res.send("Error Occured");
      }
      res.send(serviceResult);
    }

    //TODO: return data based on given radius.
  });

  app.post('/endpoint/bookSlot/:subServiceId/:bookedBy', function(req, res){
    var date = new Date();
    var currentTimeStamp = Date.parse(new Date());
    var data = {};
    data.subServiceId = req.params.subServiceId;
    data.bookedBy = req.params.bookedBy;
    data.bookedAt = currentTimeStamp.toString();
    data.slotBooked = currentTimeStamp.toString();
    var start = new Date();
    start.setHours(0,0,0,0);

    var end = new Date();
    end.setHours(23,59,59,999);

    var timeString = date.getHours()+':'+date.getMinutes();

    daler.getServiceById(req.params.subServiceId, function(err, docs){
      if(err){
        console.log(err);
        res.send("Error Occured");
      }

      if(timeString > docs[0].startHour && timeString < docs[0].endHour){
        daler.getTodaysBookingDetails(req.params.subServiceId,Date.parse(start).toString(), Date.parse(end).toString(), function(err, result){
          if(err){
            console.log(err);
            res.send("Error Occured");
          }
                
          if(result.length != 0 ){
              if(result.length <= docs[0].perdayCapacity){

                  var availability = 0, personBooking = 0;
                  for(var i = 0; i < result.length; i++){
                      if((currentTimeStamp - result[i].slotBooked) < (docs[0].timeForPerson*60*1000)){
                          availability++;
                      }

                      if(result[i].bookedBy === req.params.bookedBy){
                          personBooking++;
                      }
                  }

                  if(availability >= docs[0].concurrentCount){
                      res.send("SlotsFilled");
                  }else if(personBooking < 3){
                      daler.insertSlotBookingData(data, sendResponse);
                  }else{
                      res.send("YourQuotaPerDayExceeded");
                  }
              }else{
                  res.send("LimitForTheDayReached");
              }
          }else{
              daler.insertSlotBookingData(data, sendResponse);
          }
        });
      }else{
          res.send("OutOfWorkingHours");
      }

      var sendResponse = function(err, serviceResult){
        if(err){
          console.log(err);
          res.send("Error Occured");
        }
        res.send(serviceResult);
      }

      //TODO: Find the time taken to reach destination and book the slot at that time.
    });
  });
}