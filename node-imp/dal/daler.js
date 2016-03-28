var MongoClient = require('mongodb').MongoClient;

var wrapper = function () {

		var Landing = { 
	  	title: 'Within 30', 
	  	message: 'My Saviour!',
	  	header: {
	  		sections: [
	  		{
	  			content: 'Within 30'
	  		},
	  		{
	  			content: 'detailed expression about the site'
	  		}
	  		]
	  	},
	  	companyContent: {
	  	},
	  	tileContent: {	
	  		sections: [
	  		{
	  			content: 'Saloon'
	  		},
	  		{
	  			content: 'Dentist'
	  		},
	  		{
	  			content: 'Doctor'
	  		}
	  		]
	  	}
	  };

	  var dbaudit, dbcustomer;
	  MongoClient.connect("mongodb://localhost:27017/Audit", function(err, db) {
		if(err) { return console.dir(err); }
		dbaudit = db;
	  });

	  MongoClient.connect("mongodb://localhost:27017/Customers", function(err, db) {
		if(err) { return console.dir(err); }
		dbcustomer = db;
	  });

	 var LogTrace = function(obj){
		obj.createdat = Date.now();
		dbaudit.collection('logusers').insert(obj);
	 }
	 var GetClients = function(obj, callback){
	 	dbcustomer.collection('Customers').find().toArray(function(err, docs) {	
			if (err) console.dir(err);
			//console.log(docs);
			callback(undefined, docs);
		});
	 }
	return {
		landing : Landing,
		logTrace: LogTrace,
		getClients: GetClients
	}
}


module.exports.daler = wrapper();