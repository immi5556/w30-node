module.exports = function(opts){
  var staticoptions = {
    //root: __dirname,
    dotfiles: 'deny',
    headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    };  

  opts.app.get('/uploaded/si/:afile', function(req, res){
      console.log(opts.path.resolve('./content/uploads/service/' + req.params.afile));
      res.sendFile(opts.path.resolve('./content/uploads/service/' + req.params.afile), staticoptions);
  });

  opts.app.get('static/:folder/:afile', function(req, res){
      res.sendFile(opts.path.resolve('./content/public/' + req.params.folder + '/' + req.params.afile), staticoptions);
  });

  opts.app.get('/scripts/:jsfile', function(req, res){
      res.sendFile(opts.path.resolve('./scripts/' + req.params.jsfile), staticoptions);
  });

  opts.app.get('/scripts/upl/:jsfile', function(req, res){
      res.sendFile(opts.path.resolve('./scripts/upload-js/' + req.params.jsfile), staticoptions);
  });

  opts.app.get('/styles/:cssfile', function(req, res){
      res.sendFile(opts.path.resolve('./styles/' + req.params.cssfile), staticoptions);
  });

  opts.app.get('/content/uploads/logos/:imgfile', function(req, res){
      res.sendFile(opts.path.resolve('./content/uploads/logos/' + req.params.imgfile));
  });

  opts.app.get('/images/:imgfile', function(req, res){
      res.sendFile(opts.path.resolve('./content/uploads/img/' + req.params.imgfile), staticoptions);
  });
}