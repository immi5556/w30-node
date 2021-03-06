module.exports = function(app, daler, localSession, bodyParser, logger, countries, nearCity){
  app.use(bodyParser.json());
  app.post('/endpoint/:action', function(req, res){
  	var lsession = req.session;
  	if (req.params.action == 'getCountries'){
  		var tosend = {
  			detectedCity: lsession.city,
  			detectedCountry: lsession.country,
  			countries: countries.getCountries()
  		}
  		if (tosend.detectedCountry){
  			tosend.cities = countries.getCities(tosend.detectedCountry)
  		}
  		res.send(tosend);
  		return;
  	}
  	if (req.params.action == 'getCities'){
  		var tosend = {
  			detectedCity: lsession.city,
  			detectedCountry: lsession.country,
  			country: req.body.country,
  			cities: countries.getCities(req.body.country)
  		}
  		if(tosend.detectedCity && tosend.cities.indexOf(tosend.detectedCity) < 0){
  			tosend.cities.push(tosend.detectedCity)
  		}
  		res.send(tosend);
  		return;
  	}
  	if (req.params.action == 'getClients'){
  		daler.getClients(req.body, function(err, data){
  			res.send(data);
  		});
  	}
    if (req.params.action == 'getNearestCities'){
      data = nearCity(req.body.lat || 48.8567, req.body.long || 2.3508, 30);
      var lst = (data || []).filter(function(item){
        return item.distance <= req.body.dist;
      });
      res.send(lst);
    }
  });
}