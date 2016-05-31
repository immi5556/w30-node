module.exports = function(app){
  var path = require('path');
  var staticoptions = {
    dotfiles: 'deny',
    headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    };  

  app.get('/uploaded/:imgType/:afile', function(req, res){
      res.sendFile(path.resolve('./persistent-storage/uploads/'+req.params.imgType+'/' + req.params.afile), staticoptions, null);
  });
}