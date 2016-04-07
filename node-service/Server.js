var express = require('express');
var upload = require('jquery-file-upload-middleware');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session'), localSession = {};
var jade = require('jade');
var url = require('url');
var path = require('path');
var favicon = require('serve-favicon');
var deasync = require('deasync');
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var objectId = mongo.ObjectId;
var requestIp = require('request-ip');
var geoip = require('geoip-lite');
var deasync = require('deasync');
var rndstring = require("randomstring");
var passport = require("passport");
var digestStrategy = require("passport-http").DigestStrategy;
var basicStrategy = require("passport-http").BasicStrategy;
var syncRequest = require("sync-request");

app.use(favicon(__dirname + '/favicon.ico'));
app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'jade');

upload.configure({
    uploadDir: __dirname + '/content/uploads/service',
    uploadUrl: '/uploads/'
});

app.use('/upload', upload.fileHandler());

var opts ={
	app: app,
	bodyParser: bodyParser,
	jade: jade,
	mongo: mongo,
	mongoClient: mongoClient,
	requestIp: requestIp,
	geoip: geoip,
	upload: upload,
	path: path,
	deasync: deasync,
	muted: false,
	rndstring: rndstring,
	passport: passport,
	digestStrategy: digestStrategy,
  syncRequest: syncRequest,
  objectId: objectId
}

opts.app.use(opts.bodyParser.json());

var daler = require('./daler.js').daler(opts);
var dalerService = require('./dalerService.js').daler(opts);
var statr = require('./staticrouting.js')(opts);
var htmlr = require('./htmlrouting.js')(opts);
var servr = require('./servicerouting.js')(opts);
var spec = require('./specialityrouting.js')(opts);
var servc = require('./clientrouting.js')(opts);
var serva = require('./apirouting.js')(opts);
var utils = require('./utils.js').utils(opts);

opts.daler = daler;
opts.dalerService = dalerService;
opts.staticrouting = statr;
opts.htmlrouting = htmlr;
opts.servicerouting = servr;
opts.specialityrouting = spec;
opts.clientrouting = servc;
opts.apirouting = serva;
opts.utils = utils;

opts.getObjectId = function(id){
	return objectId(id);
}

opts.context = {
	Services: daler.get('Services', null, true),
	Clients: daler.get('Clients', null, true)
};

app.use(function(req, res, next){
	opts.localSession = req.session || {};
    if (!opts.localSession.city){
    var ip = requestIp.getClientIp(req);
    ip = ip.replace('::ffff:', '');
    var geo = (geoip.lookup(ip) || {});
    //console.log("The IP is %s, city : %s", geoip.pretty(ip),(geo.city || 'Nil'));
      opts.localSession.city = geo.city || 'Nil';
      opts.localSession.geo = geo;
      daler.logTrace(geo);
      next();
    }
    else {
    	next();
    }
});

passport.use(new digestStrategy({ qop: 'auth' },
  function(username, done) {
    console.log("Digest Auth");
    if (!username) return done("Access Denied", false);
    if (username.toLowerCase() != "admin") return done("Access Denied", false);
    done(null, {}, "123");
  },
  function(params, done) {
    // validate nonces as necessary
    done(null, true)
  }
));


passport.use(new basicStrategy(function(un, pw, done) {
    console.log('un: ' + un + ', pw: ' + pw);
    if ((un || "").toLowerCase() == "admin" && (pw || "").toLowerCase() == "123") {
      return done(null, {
       un: un,
       pw: pw 
      });
    }
    var usr = dalerService.authenticate({ un: un, pw: pw}, true);
    if (!usr || !usr.length){
      return done("Access denied", false);
    }else{
      dalerService.logCount(usr[0]._id);
      return done(null, usr[0]);
    }
  },
  function(params, done) {
    // validate nonces as necessary
    //done(null, true)
  }
));

var server = app.listen(9012, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Schedule app listening at http://%s:%s', host, port);
});