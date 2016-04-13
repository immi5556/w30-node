module.exports = function(opts){
  opts.app.use(opts.bodyParser.json());
  opts.app.post('/endpoint/:action', function(req, res){
  	 var obj = req.body;
     if(req.params.action == "getSpecialists"){
        opts.daler.getSpecialists(obj, function(err, result){
          if(err){
            res.status(500).send(err);
            return;
          }else{
            res.send(result);
          }
       });
     }else{
      opts.daler.checkDomain(obj, function(err){
        if(err){
          res.status(500).send(err);
          return;
        }else{
          res.send(req.body);
        }
      });
     }
  });
}