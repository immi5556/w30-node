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
  });

}