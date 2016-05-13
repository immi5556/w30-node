var socketio = require('socket.io')
	, activeUsers = []
	, activeUserSubdomain = [];

var getsubDomain = function(req){
  var domain = req.headers.referer;
  var subDomain = domain.split('.')[0];

	if (subDomain.indexOf('localhost') > -1) 
	  subDomain = 'test2';
	else if(parseInt(subDomain) > 40){
	  domain = req.headers.referer;
	  domain = domain.replace('http://','').replace('https://','').split(/[/?#]/);
	  subDomain = domain[0].split('.')[0];
	}
	else {
	  var ur = req.headers;
	  domain = ur.referer;
	  domain = domain.replace('http://','').replace('https://','').split(/[/?#]/);
    subDomain = domain[0].split('.')[0];
	}
    
    return subDomain;
}

socketio.listen(8083).on('connection', function (socket) {
    activeUsers.push(socket.id);
    activeUserSubdomain.push(getsubDomain(socket.request));

    socket.on('newAppointment', function (msg) {
      for(var i = 0; i < activeUserSubdomain.length; i++){
        if(msg.subdomain == activeUserSubdomain[i]){
          socket.broadcast.to(activeUsers[i]).emit('newAppointment', msg);
        }
      }
    });

    socket.on('updateAppointment', function (msg) {
      for(var i = 0; i < activeUserSubdomain.length; i++){
        if(msg.subdomain == activeUserSubdomain[i]){
          socket.broadcast.to(activeUsers[i]).emit('updateAppointment', msg);
        }
      }
    });

    socket.on('disconnect', function(){
      for(var i = 0; i < activeUsers.length; i++){
        if(socket.id == activeUsers[i]){
          activeUsers.splice(i, 1);
          break;
        }
      }
    });
});