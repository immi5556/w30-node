module.exports = function(opts){

  opts.app.get('/admin', opts.passport.authenticate('basic', { session: false }), function (req, res) {
  //opts.app.get('/admin', opts.passport.authenticate('digest', { session: false }), function (req, res) {
  	//console.log(req.user);
    res.sendFile(__dirname + "/views/index/static.html");
  });
}