var wrapper = function (opt) {
	var opts = opt;
	var getTypeVal = function(arrval, type){
		if (!arrval || !arrval.length)
			return ""
		var retn;

		arrval.every(function(itm){
			if ((itm.types || []).indexOf(type) == -1) {
				return true;
			} else {
				retn = itm.long_name;
				return false;
			}
		});
		return retn;
	}

	var formatGoogleGeocodeResponse = function(jsonData){
		if (jsonData && jsonData.results && jsonData.results.length){
			return {
				fulladdress: jsonData.results[0].formatted_address,
				premise: getTypeVal(jsonData.results[0].address_components, 'premise'),
				sublocality: getTypeVal(jsonData.results[0].address_components, 'sublocality_level_1'),
				locality: getTypeVal(jsonData.results[0].address_components, 'locality'),
				city: getTypeVal(jsonData.results[0].address_components, 'administrative_area_level_2'),
				state: getTypeVal(jsonData.results[0].address_components, 'administrative_area_level_1'),
				country: getTypeVal(jsonData.results[0].address_components, 'country'),
				postalcode: getTypeVal(jsonData.results[0].address_components, 'postal_code')
			}

		} else {
			return {
				message: "No data found"
			}
		}
	}
	
	var GetAddressFromLatLong = function(obj) {
		var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+obj.latitude+","+obj.longitude+"&key=";
		var response = opts.syncRequest('GET', url);
        var jsonData = JSON.parse(response.body);
        return formatGoogleGeocodeResponse(jsonData);
	}

	var formatGoogleDistanceResponse = function(jsonData, user, customer) {
		if(jsonData && jsonData.rows && jsonData.rows.length && jsonData.rows[0].elements
			&& jsonData.rows[0].elements.length && jsonData.rows[0].elements[0].status === "OK"
			&& jsonData.rows[0].elements[0].duration && jsonData.rows[0].elements[0].duration.value){
			var requiredTime = jsonData.rows[0].elements[0].duration.value/60;
			if(requiredTime > user.minutes || ( timeString < customer.startHour && timeString >= customer.endHour)){
	          return {
	          	message: "Not with in time"
	          }
	        }else{
	          customer.destinationDistance = jsonData.rows[0].elements[0].distance.value * 0.000621371; //Meters to miles conversion value
	          customer.expectedTime = requiredTime;
	        }
		}
		else {
			return {
				message:"No data found"
			}
		}
	}

	var GetDistanceBetweenLatLong = function(obj, customer){
		var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='+obj.latitude+','+obj.longitude+'&destinations='+customer.geo.coordinates[1]+','+customer.geo.coordinates[0]+'&key='
      	var rspns = opts.syncRequest('GET', url);
      	var jsonData = JSON.parse(rspns.body);
      	return formatGoogleDistanceResponse(jsonData, obj, customer)
	}

	return {
		getAddressFromLatLong: GetAddressFromLatLong
	}
}


module.exports.utils = wrapper;