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
      activeUserSubdomain.forEach(function(item, index){
          if(msg.subdomain == item){
            socket.broadcast.to(activeUsers[index]).emit('newAppointment', msg);
          }
      });
    });

    socket.on('updateAppointment', function (msg) {
      activeUserSubdomain.forEach(function(item, index){
          if(msg.subdomain == item){
            socket.broadcast.to(activeUsers[index]).emit('updateAppointment', msg);
          }
      });
    });

    socket.on('disconnect', function(){
      var deleteIndex= 0; 
      activeUsers.forEach(function(item, index){
        if(socket.id == item){
          deleteIndex = index;
        }
      });
      activeUsers.splice(deleteIndex, 1);
      activeUserSubdomain.splice(deleteIndex, 1);
    });
});