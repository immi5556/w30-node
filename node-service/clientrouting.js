module.exports = function(opts){
  opts.app.use(opts.bodyParser.json());
  opts.app.post('/endpoint/clients/:action', function(req, res){
  	 var obj = req.body;
     if (req.params.action == "insert"){
       var robj = opts.daler.insertClient(obj, true);
    	 res.send(robj);
     }

     if (req.params.action == "update"){
       var robj = opts.daler.updateClient(obj, true);
       res.send(robj);
     }

     if (req.params.action == "delete"){
       var robj = opts.daler.deleteClient(obj, true);
       res.send(robj);
     }

     if (req.params.action == "getclients"){
       res.send(opts.context.clients);
     }

     if (req.params.action == "regen"){
       res.send(opts.rndstring.generate(12));
     }
  });
}