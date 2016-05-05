var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var dbaudit;

mongoClient.connect("mongodb://localhost:27017/Audit", function(err, db) {
  if(err) { return console.dir(err); }
  dbaudit = db;
});
