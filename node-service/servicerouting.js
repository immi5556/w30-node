module.exports = function(opts){
  opts.app.use(opts.bodyParser.json());
  opts.app.post('/endpoint/service/:action', function(req, res){
  	 var obj = req.body;
     if (req.params.action == "insert"){
       var robj = opts.daler.insertService(obj, true);
    	 res.send(robj);
     }

     if (req.params.action == "update"){
       var robj = opts.daler.updateService(obj, true);
       res.send(robj);
     }

     if (req.params.action == "delete"){
       var robj = opts.daler.deleteService(obj, true);
       res.send(robj);
     }

     if (req.params.action == "getservices"){
       res.send(opts.context.services);
     }
  });
}