module.exports = function(opts){
  //opts.app.use(opts.bodyParser.json());
  opts.app.post('/endpoint/service/:action', function(req, res){
  	 var obj = req.body, tbl = 'Services';
     if (req.params.action == "insert"){
       var robj = opts.daler.insert(tbl, obj, true);
    	 res.send(robj);
     }

     if (req.params.action == "update"){
       var robj = opts.daler.update(tbl, obj, true);
       res.send(robj);
     }

     if (req.params.action == "delete"){
       var robj = opts.daler.delete(tbl, obj, true);
       res.send(robj);
     }

     if (req.params.action == "getservices"){
       res.send(opts.daler.get(tbl, obj, true));
     }
  });
}