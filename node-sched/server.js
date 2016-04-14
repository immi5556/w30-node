var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jade = require('jade');
var daler = require('./dal/daler.js').daler;
var url = require('url');
var path = require('path');
var favicon = require('serve-favicon');

var opts ={
	app: app,
	bodyParser: bodyParser,
	daler: daler,
	jade: jade
}

app.use(favicon(__dirname + '/favicon.ico'));
app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'jade');

app.get('/uploaded/:imgfile', function(req, res){
      res.sendFile(path.resolve('./public/images/logos/' + req.params.imgfile), function(req, res){

      });
 });

var getsubDomain = function(req){
  var domain = req.headers.host;
  var subDomain = domain.split('.')[0];
  //console.log(req.headers);
    if (subDomain.indexOf('localhost') > -1) 
      subDomain = 'test2';
    else if(parseInt(subDomain) > 40){
      domain = req.headers.referer;
      domain = domain.replace('http://','').replace('https://','').split(/[/?#]/);
      subDomain = domain[0].split('.')[0];
    }
    else {
      var ur = req.headers;
      domain = ur.host;
      subDomain = domain.split('.')[0];
    }
    
    console.log(domain + ', Subdomain: ' + subDomain);
    return subDomain;
}

app.get("/", function(req, res){
  var subDomain = getsubDomain(req);
  daler.getDetails(subDomain, function(err, data) {
    if (err){
      res.status(500).send(err);
      return;
    }
    console.log(data[0]);
    res.render('index', { val: data[0] });
  });
});


app.get("/:uuid", function(req, res){
	var subDomain = getsubDomain(req);
	daler.getDetails(subDomain, function(err, data) {
		if (err){
			res.status(500).send(err);
			return;
		}
    if (data[0].landing._uniqueid == req.params.uuid){
      data[0].allowed = true;
    }
    console.log(data[0]);
		res.render('index', { val: data[0] });
	});
});

app.get("/sched", function(req, res){
	res.sendfile("schednd.html");
});


app.get("/hosp", function(req, res){
	res.sendfile("index.html");
});

app.get("/clock", function(req, res){
	res.sendfile("clock.html");
});

require('./routes/servicerouting.js')(opts);

var server = app.listen(8082, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Schedule app listening at http://%s:%s', host, port);
});