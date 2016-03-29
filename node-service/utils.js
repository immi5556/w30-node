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
        console.log(jsonData);
        return formatGoogleGeocodeResponse(jsonData);
	}

	return {
		getAddressFromLatLong: GetAddressFromLatLong
	}
}


module.exports.utils = wrapper;