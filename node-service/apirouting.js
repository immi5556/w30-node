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
	    opts.dalerService.getMyCustomers(req.body, req.user.services, function(result){
	    	res.send(result);
	    });
 	}
 	if (req.params.action == "bookslot"){
       	opts.dalerService.bookASlot(req.body, req.user.services, function(result){
    		res.send(result);
	    });
	    /*var slot = opts.booker.createAgent(req.body, req.user.services);
	    slot.on("error", function(data) {
	    	res.send(data);
	    });
	    slot.on("slotBooked", function(data) {
	    	res.send(data);
	    });
	    slot.bookSlot();*/
 	}
 	if (req.params.action == "submitrating"){
		opts.dalerService.submitRating(obj, req.user, function(data){
			res.send(data);
		});
	}
	if (req.params.action == "getcities"){
		res.send(opts.cityReverseGeocoder(obj.latitude, obj.longitude, 200, 'mi'));
	}
  });
}