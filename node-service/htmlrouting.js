module.exports = function(opts){

  opts.app.get('/admin', function (req, res) {
    res.sendFile(__dirname + "/views/index/static.html");
  });
}