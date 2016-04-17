var wrapper = function(opts){
	
	var BookSlot = function(bodyObj, servicesAvail){
		var self = this;

		var ServiceAllowed = function(serviceId){
			if ((servicesAvail || []).indexOf(serviceId) == -1){
				self.emit("error",  {
					"Status": "Failed",
	      			"Message": "Access Denied"
				});
				return false;
			}
			self.emit("serviceAllowed",  {
					"Status": "Success",
	      			"Message": "Service Allowed"
				});
			return true;
		}

		var GetCustomer = function() {
			opts.daler.getCustomers("Customers", { filter: { "subdomain": bodyObj.subDomain } }, function(err, data) {
		  		if (err){
		  			console.dir(err);
		  			self.emit("error",  {
						"Status": "Failed",
		      			"Message": "Error occured in customer retrieval"
					});
		  			return undefined;
		  		}
		  		if(!data.length){
		  			self.emit("error",  {
						"Status": "Failed",
		      			"Message": "Domain not found"
					});
					return undefined;
		  		}

		  		self.emit("customerRecieved", data[0]);
		  	});
		}

		var FormatData = function(){
			var timeperperson = (customer.defaultDuration || 30);
	        var date = new Date(bodyObj.date);
	        var dd = date.getDate();
	        var mm = date.getMonth()+1;
	        var yyyy = date.getFullYear();
	        if(dd<10){
	            dd='0'+dd
	        } 
	        if(mm<10){
	            mm='0'+mm
	        }
	        var start = date.getHours() * 60* 60 + date.getMinutes() * 60;
	        var end = start + timeperperson * 60;
	        var startHours = date.getHours();
            var startMinutes = date.getMinutes();
            if(startHours < 10){
              startHours = "0"+startHours;
            }
            if(startMinutes < 10){
              startMinutes = "0"+startMinutes;
            }
	        var startTimeString = startHours+":"+startMinutes;
	        var endHours = date.getHours();
	        var endMinutes = date.getMinutes() + Number(timeperperson);

	        if(endMinutes > 60){
              endMinutes -= 60;
              endHours += 1;
            }
            if(endHours < 10){
              endHours = "0"+endHours;
            }
            if(endMinutes < 10){
              endMinutes = "0"+endMinutes;
            }
            var endTimeString = endHours+':'+endMinutes;
            var date = yyyy+'-'+mm+'-'+dd;
            var format = {
              "action" : "insert",
              "selecteddate" : date,
              "subdomain" : bodyObj.subDomain,
              "data" : {
                  "timeline" : 0,
                  "start" : start,
                  "end" : end,
                  "startTime" : startTimeString,
                  "endTime" : endTimeString,
                  "text" : "",
                  "data" : {
                      "email" : bodyObj.email,
                      "mobile" : bodyObj.mobile,
                      "details" : "",
                      "resources" : []
                  }
              },
              "createdat" : Date.parse(new Date())
            };

            return format;
		}

		var ValidateWorkingHours = function(){
			console.log(appointData.data.startTime+" "+customer.startHour+" "+appointData.data.endTime+" "+customer.endHour)
			if(appointData.data.startTime >= customer.startHour && appointData.data.endTime < customer.endHour){
				self.emit("workingHours",  {
					"Status": "Success",
	      			"Message": "With in working hours"
				});
				return true;
			}
			else {
				self.emit("error",  {
					"Status": "Failed",
	      			"Message": "Out of working hours"
				});
				return false;
			}
		}

		var GetSchedule = function(){
			opts.daler.getSchedules(bodyObj.subDomain, { filter: { selecteddate: appointData.selecteddate } }, function(err, data){
				if (err){
					console.dir(err);
					self.emit("error", {
						"Status": "Failed",
						"Message": "Error occured in schedule retrieval"
					});
					return undefined;
				}
				self.emit("scheduleRecieved", data);
			});
		}

		var ValidateLimit = function(){
			if(schedules.length >= customer.perdayCapacity){
				self.emit("error", {
					"Status": "Failed",
					"Message": "Limit for the day reached"
				});
				return;
			}

			self.emit("withinLimit", {
				"Status": "Failed",
				"Message": "Limit for the day reached"
			});
		}

		var ValidateConcurrent = function(){

			var avails = schedules.filter(function(item) {
				if (appointData.data.startTime >= item.data.startTime && appointData.data.startTime <= item.data.endTime){
					return item;
				}
			});
			if(!customer.concurrentCount){
				customer.concurrentCount = 1;
			}
			if (avails.length >= customer.concurrentCount){
				self.emit("error", {
					"Status": "Failed",
					"Message": "Slots already booked"
				});
				return;
			}
			self.emit("slotsAvailable", {
				"Status": "Success",
				"Message": "Slots Available"
			});
		}

		var InsertSchedule = function(){
			opts.daler.insertSchedules(bodyObj.subDomain, appointData, function(err, data){
				if(err){
					self.emit("error", {
						"Status": "Failed",
						"Message": "Error occured in schedule insertion"
					});
					return;
				}
				self.emit("slotBooked", data);
			});
		}

		var customer, appointData, schedules;
		self.on("customerRecieved", function(data){
			customer = data;
			ServiceAllowed(customer.serviceId);
		});

		self.on("serviceAllowed", function(data){
			appointData = FormatData();
			ValidateWorkingHours();
		});

		self.on("workingHours", function(data){
			GetSchedule();
		});

		self.on("scheduleRecieved", function(data){
			schedules = data;
			ValidateLimit();
		});

		self.on("withinLimit", function(data){
			ValidateConcurrent();
		});

		self.on("slotsAvailable", function(data){
			InsertSchedule();
		});

		this.bookSlot = function(){
			GetCustomer();
		}
	}
	BookSlot.prototype = Object.create(opts.emitter.prototype);

	return {
		createAgent: function(bodyObj, servicesAvail){
			return new BookSlot(bodyObj, servicesAvail);
		}
	}
}

module.exports.wrapper = wrapper;