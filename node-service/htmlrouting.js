module.exports = function(opts){

  opts.app.get('/admin', opts.passport.authenticate('basic', { session: false }), function (req, res) {

    res.sendFile(__dirname + "/views/index/static.html");
  });
}