module.exports = function(opts){
  //opts.app.use(opts.bodyParser.json());
  opts.app.post('/endpoint/specialities/:action', function(req, res){
  	 var obj = req.body, tbl = 'Specialities';

     if (req.params.action == "update"){
       var robj = opts.daler.update(tbl, obj, true);
       res.send(robj);
     }

     if (req.params.action == "get"){
       var robj = opts.daler.get(tbl, obj, true);
       res.send(robj);
     }
  });
}