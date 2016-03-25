module.exports = function(opts){
  opts.app.post('/endpoint/api/:action', opts.passport.authenticate('basic', { session: false }),  function(req, res){
  	 var obj = req.body;
     if (req.params.action == "getmyservices"){
       res.send(opts.dalerService.getMyServices(req.user));
     }
  });
}