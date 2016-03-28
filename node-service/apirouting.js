module.exports = function(opts){
  opts.app.post('/endpoint/api/:action', opts.passport.authenticate('basic', { session: false }),  function(req, res){
 	var obj = req.body;

	if (req.params.action == "getmyservices"){
		res.send(opts.dalerService.getMyServices(req.user));
	}

	if (req.params.action == "getmylocation"){
       res.send(opts.dalerService.getMyLocation(req.body.latitude, req.body.longitude)); 	
 	}

 	if(req.params.action == "getmycustomers"){
	    opts.dalerService.getMyCustomers(req.body.serviceId, req.user.services, req.body.latitude, req.body.longitude, req.body.miles, req.body.minutes,function(err, result){
	    	if(err){
	    		console.log(err);
	    		res.send("Error Occured");
	    	}else{
	    		res.send(result);
	    	}
	    });
 	}
  });
}