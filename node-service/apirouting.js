module.exports = function(opts){
  opts.app.post('/endpoint/api/:action', opts.passport.authenticate('basic', { session: false }),  function(req, res){
 	var obj = req.body;

	if (req.params.action == "getmyservices"){
		opts.dalerService.getMyServices(req.user, function(data){
			res.send(data);
		});
	}
	if (req.params.action == "getmylocation"){
		console.log(req.body);
       	res.send(opts.utils.getAddressFromLatLong(req.body)); 	
 	}

 	if(req.params.action == "getmycustomers"){
	    opts.dalerService.getMyCustomers(req.body, req.user.services, function(err, result){
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