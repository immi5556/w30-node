//$(function(){
	var milesValue = 30;
	var minutesValue = 30;
	var customers = [];
	var markers = [];
	var infowindows = [];
	var map = null;
	var latitude = 0, longitude = 0;
	var circle = null;
	var mapProp = null;
	var selectedBusiness = null;
	var bookedBusiness = null;

	$('.sec-carousel').gbcarousel({});

	$('.grid-tile').on('click',function(){
		$(this).addClass('active');
		var tt = $(this).data("bustype");
		$(".item-client").hide('slow');
		$("." + tt).show('slow');
		$('.pageShadow').show();
		$('.close-arrow').show();
	});

	$('.close-arrow').on('click',function(){
		closeShadow();
	});

	$("#btnReg-Submit").on("click", function(){
		if (!$("#email-txt").val() || !isValidEmailAddress($("#email-txt").val())){
			$("#email-txt").css({
				'border-color': 'red'
			});

			return;
		}
		var request = $.ajax({
            //url: "http://landing.que.one/endpoint/ccreate",
            url: "http://49.206.64.209:9095/endpoint/ccreate",
            //url: "http://localhost:9095/endpoint/ccreate",
            //url: "/endpoint/ccreate",
            type: "POST",
            data: JSON.stringify({
                regis : { 
                	name : 'From W30', 
                	email: $("#email-txt").val() 
                }
            }),
            contentType: "application/json; charset=UTF-8"
        });

        request.success(function(result) {
        	//alert(result);
        	$("#reg-blck").css("display", "none");;
        	$("#reg-msg").css("display", "block");
        	$("#email-txt").val("");
        	$("#email-txt").css({
				'border-color': 'green'
			});
        	setInterval(function(){
        		$("#reg-blck").css("display", "block");;
        		$("#reg-msg").css("display", "none");;
        	}, 30000);
        });
        request.fail(function(jqXHR, textStatus) {
        	$(".modal-title").text('Registration Result');
        	$(".modal-body").text('Error occured while request for Registration.');
        	$("#myModal").modal('show');
        });
	});

	$(document).on('keyup',function(e){
		if(e.keyCode == 27) {
			closeShadow();
		}
	})

	function closeShadow(){
		$('.grid-tile').removeClass('active');
		$(".item-client").show('slow');
		$('.pageShadow').hide();
		$('.close-arrow').hide();
	}

	var item = $('.select-drop').find('li');
	var labelDATA = $('.text-label');
	
	$('.text-label').on('click',function(e){
		e.stopPropagation();
		if(!$('.select-drop').is(':visible')){
			$(this).next('.select-drop').slideDown();
		}else {
			$('.select-drop').slideUp();
		}
		$('#city-text').text('City');
		$('.city-tlt').text('City');
	});

	$('.stateArrow').on('click', function(e){
		e.stopPropagation();
		if(!$('.select-drop').is(':visible')){
			$('#stateList').slideDown();
		}else {
			$('#stateList').slideUp();
		}
		
		$('#city-text').text('City');
		$('.city-tlt').text('City');
	});

	$('.cityArrow').on('click', function(e){
		e.stopPropagation();
		if(!$('.select-drop').is(':visible')){
			$('#cityList').slideDown();
		}else {
			$('#cityList').slideUp();
		}
	});

	$("#filterSearch").keyup(function(event){
	    if(event.keyCode == 13){
	        searchByName();
	    }
	});

	$(document).keypress(function(e){
		if($('#stateList').is(':visible')){
		  	var key = String.fromCharCode(e.which);
		  	var count = 0;
		  	var limit = 0;
		  	$("#stateList").find("li").each(function(idx,item){
			    if ($(item).text().charAt(0).toLowerCase() == key) {
			    	if(limit == 0){
			      		$("#stateList").animate({scrollTop: count*35}, 100);
			    		limit++;
			    	}
			    }
			    count++;
		  	});
		}else if($('#cityList').is(':visible')){
		  	var key = String.fromCharCode(e.which);
		  	var count = 0;
		  	var limit = 0;
			$("#cityList").find("li").each(function(idx,item){
			    if ($(item).text().charAt(0).toLowerCase() == key) {
			    	if(limit == 0){
			      		$("#cityList").animate({scrollTop: count*35}, 100);
			    		limit++;
			    	}
			    }
			    count++;
		  	});
		}
	});

	$("#nameSearch").on("click", function(){
		searchByName();
	});
	
	$(document).on('click',function(){
		$('.select-drop').slideUp();
	});
	
	var loadAjax = function(data, action, callback){
		data = data || {};
		data.country = $("#stateText").text();
		$.ajax({
            url: "/endpoint/" + action,
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=UTF-8",
            success: function(cdat) {
            	if (callback){
            		callback(cdat);
            	}
            }
        });
	}

	var loadCity = function(cdat){
		cdat.forEach(function(item){
    		var ll = $("<li />").addClass(item.City.replace(/ /g, '-')).text(item.City);
    		$('#cityList').append(ll);
    		ll.on("click", function(){

    			$(this).closest('.selectbx').find(labelDATA).text($(this).text());
    			$('.city-tlt').text($('#city-text').text());
    			var geocoder =  new google.maps.Geocoder();
			    geocoder.geocode( { 'address': $('#city-text').text() }, function(results, status) {
		          if (status == google.maps.GeocoderStatus.OK) {
		            $('#city-text').data("city-latlong", {
		            	lat: results[0].geometry.location.lat(),
		            	lng: results[0].geometry.location.lng()
		            } );
		          } else {
		            $(".modal-title").text('Get Cities');
	        		$(".modal-body").text('Error occured while getting Cities.');
	        		$("#myModal").modal('show');
		          }
		        });
			    //$("#applyFilter").click();
			    cityChange();
    		});
    	});
	}

	var loadStates = function(cdat){
    	cdat.forEach(function(item){
    		var ll = $("<li />").addClass(item.replace(/ /g, '-')).text(item);
    		$('#stateList').append(ll);
    		ll.on("click", function(){

			$(this).closest('.selectbx').find(labelDATA).text($(this).text());
			
			$('.country-tlt').text($('#stateText').text());
			$('#cityList').html('');
    			requestAPI("getcities", {"name":$('#stateText').text()}, loadCity);
    		});
    	});
	}

	var requestAPI = function(action, obj, callback){
		var request = $.ajax({
			url: "http://49.206.64.209:9012/endpoint/api/"+action,
            //url: "http://localhost:9012/endpoint/api/"+action,
            type: "POST",
            beforeSend: function (xhr) {
            	//xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-HQGQ:zxosxtR76Z80"));
			    xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-a37f:kMEKlE0Ujovo"));
			},
            data: JSON.stringify(obj),
            contentType: "application/json; charset=UTF-8"
        });

        request.success(function(result) {
        	if(result.Status == "Ok"){
    			callback(result.Data);	
    		}else{
        		console.log("Error Occured While request API.");
        	}
        });
        request.fail(function(jqXHR, textStatus) {
        	console.log(textStatus);
        });
	}

	requestAPI("getstates", {}, loadStates);
	
	var successFunction = function(pos){
		latitude = pos.coords.latitude;
		longitude = pos.coords.longitude;
		getLocation(latitude, longitude);
		getCustomerAPICall(latitude, longitude, milesValue, minutesValue, minutesValue);
	}
	var errorFunction = function(err){
		//Dallas location.
		latitude = 32.7767;
		longitude = 96.7970;
		getLocation(latitude, longitude);
		getCustomerAPICall(latitude, longitude, milesValue, minutesValue, minutesValue);
	}

	function getLocation(lat, lng) {
	  var latlng = new google.maps.LatLng(lat, lng);
	  var geocoder = new google.maps.Geocoder();
	  geocoder.geocode({latLng: latlng}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	      if (results[1]) {
	        var arrAddress = results;
	        $.each(arrAddress, function(i, address_component) {
	          if (address_component.types[0] == "locality") {
	            $("#city-text").text(address_component.address_components[0].long_name);
	          }
	          if (address_component.types[0] == "administrative_area_level_1") {
	            $("#stateText").text(address_component.address_components[0].long_name);
	          }
	        });
	      } else {
	        console.log("No results found");
	      }
	    } else {
	      console.log("Geocoder failed due to: " + status);
	    }
	  });
	}

	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
	} else {
		$(".modal-title").text('GeoLocation');
    	$(".modal-body").text('Error occured while getting Customers.');
    	$("#myModal").modal('show');
	}
	
	var loadMap = function(docs){
		markers = [];
		infowindows = [];

		mapProp = {
		    center:new google.maps.LatLng(latitude,longitude),
		    zoom:9,
		    mapTypeId:google.maps.MapTypeId.ROADMAP
		  };
	  	map=new google.maps.Map(document.getElementById("googleMap"), mapProp);
		var userMarker = new google.maps.Marker({
					    position: {lat: latitude, lng: longitude},
					    map: map,
					    title: "Your Location",
					    icon: "/content/images/userLocationMarker.png"
				  	});

		for(var i = 0; i < docs.length; i++){
			var myLatLng = {lat: docs[i].geo.coordinates[1], lng: docs[i].geo.coordinates[0]}
		  	var icon;

		  	if(docs[i].slotsAvailable > 0){
		  		icon = "/content/images/greenMarker1.png";
		  	}else if(docs[i].slotsAvailable == 0){
		  		icon = "/content/images/redMarker1.png";
		  	}
		  	if(docs[i].premium){
		  		icon = "/content/images/premiumMarker.png";
		  	}

		  	var marker = new google.maps.Marker({
			    position: myLatLng,
			    map: map,
			    title: docs[i].fullName,
			    icon: icon
		  	});
		  	markers.push(marker);

		  	var infowindow1 = new google.maps.InfoWindow();

	        var companyAddr = "";
	        if(docs[i].geo.address){
	        	if(docs[i].geo.address.premise){
		        	companyAddr += docs[i].geo.address.premise+", ";
		        }
		        if(docs[i].geo.address.sublocality){
		        	companyAddr += docs[i].geo.address.sublocality+", ";
		        }
		        if(docs[i].geo.address.city){
		        	companyAddr += docs[i].geo.address.city+", ";
		        }
	        }

	        var rating = 0;
		  	if(docs[i].rating){
		  		rating =docs[i].rating;
		  	}
	        
	        if(companyAddr){
	        	companyAddr = companyAddr.substring(0, companyAddr.length-2);
	        }else{
	        	companyAddr = "Sorry Address Not Provided."
	        }
	        if(docs[i].slotsAvailable > 0){
		  		contentString = '<div class="popHeader"><h2>'+docs[i].fullName+'</h2><div class="ratingRow"><div id="rate"><div id="rateYo"></div><span>'+rating+' (0)</span></div> <div id="miles">'+docs[i].destinationDistance.toFixed(2)+' Miles</div></div></div><div class="address"><p>'+companyAddr+'</p></div><div class="estimated"><span>Travel Time(Est.):</span><span id="Time"> '+docs[i].expectedTime.toFixed(2)+' min</span></div><div style="padding-bottom:10px;"><input type="text" class="mapInput" placeholder="Cell #" onkeypress="return mobileNumberValidation(event)" id="mobileNum'+docs[i].subdomain+'" style="display:none;"></div><input type="button" class="book" id="bookSlot'+docs[i].subdomain+'" value="Schedule"><span class="bottomArrow"></span>';
		  	}else if(docs[i].slotsAvailable == 0){
		  		contentString = '<div class="popHeader"><h2>'+docs[i].fullName+'</h2><div class="ratingRow"><div id="rate"><div id="rateYo"></div><span>'+rating+' (0)</span></div> <div id="miles">'+docs[i].destinationDistance.toFixed(2)+' Miles</div></div></div><div class="address"><p>'+companyAddr+'</p></div><div class="estimated"><span></span><span id="Time"> '+docs[i].message+'</span></div><div style="padding-bottom:10px;"><input type="text" placeholder="Cell #" class="mapInput" id="mobileNum'+docs[i].subdomain+'" onkeypress="return mobileNumberValidation(event)" style="display:none;"></div><input type="button" class="book" id="bookSlot'+docs[i].subdomain+'" value="Schedule" disabled><span class="bottomArrow"></span>';
		  	}
	        
		  	var subdomain = docs[i].subdomain;
		  	infowindow1.setContent(contentString);
	  		infowindows.push(infowindow1);						
		  	google.maps.event.addListener(marker, 'click', (function(marker, contentString, infowindow1, rating, subdomain, i) {
			    return function() {
	        		for(var j = 0; j < infowindows.length; j++){
	        			if(infowindows[j]){
	        				infowindows[j].close();
	        				if(docs[j].slotsAvailable > 0){
						  		icon = "/content/images/greenMarker1.png";
						  	}else if(docs[j].slotsAvailable == 0){
						  		icon = "/content/images/redMarker1.png";
						  	}
						  	if(docs[j].premium){
						  		icon = "/content/images/premiumMarker.png";
						  	}
						  	if(bookedBusiness == j){
						  		icon = "/content/images/checkedInMarker1.png";
						  	}
						  	
						  	markers[j].setIcon(icon);
	        			}
	        		}
	        		var oldMarker = marker.icon;
			    	marker.setIcon("/content/images/on-clickMarker.png");
	        		infowindow1.open(map,marker);
	        		$('.gm-style-iw').parent('div').css('z-index','99999');
	        		$('.gm-style-iw').next('div').addClass('infoboxclose');
	        		$('.infowindow1').closest('.gm-style-iw').next('div').removeClass('infoboxclose');
			    	selectedBusiness = subdomain;
			    	if(bookedBusiness){
			    		$("#bookSlot"+subdomain).attr("disabled","disabled");
			    	}
			    	/*$("#mobileNum"+subdomain).keyup(function(evt){
			    		var charCode = (evt.which) ? evt.which : evt.keyCode;
				          if (charCode != 46 && charCode > 31 
				            && (charCode < 48 || charCode > 57))
				             return false;

				          return true;
					    if($("#mobileNum"+selectedBusiness).val().length >= 10){
					    	
							  if(evt.keyCode != 8){
							  	return false;
							  }else{
							  	return true;
							  }
					    }
					});*/
			    	$("#bookSlot"+subdomain).on('click', function(){
			    		$("#bookSlot"+subdomain).val("Confirm");
			    		$("#mobileNum"+subdomain).css("display","block");
				  		if($("#mobileNum"+subdomain).val().length == 14){
				  			$("#mobileNum"+subdomain).css("color","green");
				  			var mobileNumber = $("#mobileNum"+subdomain).val();
							mobileNumber = mobileNumber.substring(1,4)+mobileNumber.substring(6,9)+mobileNumber.substring(10,14);
				  			bookSlot(subdomain, mobileNumber, i);
				  		}else{
				  			$("#mobileNum"+subdomain).css("color","red");
				  		}
				  	});
				  	$("#rateYo").rateYo({
					    rating: rating,
					    starWidth: "10px"
				  	});
			    };
		  	})(marker, contentString, infowindow1, rating, subdomain, i));

		  	google.maps.event.addListener(infowindow1,'closeclick', (function(marker, icon, i){
			   return function() {
				   	if(bookedBusiness == i){
				   		marker.setIcon("/content/images/checkedInMarker1.png");
				   	}else{
				   		marker.setIcon(icon);
				   	}
				}
			})(marker, icon, i));
		}
		changeCircle();
	  	$( "#milesSlide" ).slider({
		    orientation: "vertical",
		    range: "min",
		    max: 96560.6,
		    min: 500,
		    value: 48280.3,
		    slide: function( event, ui ) {
	     		updateMilesRadius(circle, ui.value);
	    	}
	  	});
	  	milesValue = 48280.2;
	  	
	  	$( "#minutesSlide" ).slider({
		    orientation: "vertical",
		    range: "min",
		    max: 60,
		    min: 1,
		    value: 25,
		    slide: function( event, ui ) {
	     		updateTimeRadius(circle, ui.value);
	    	}
	  	});
	  	minutesValue = 25;
	  	
	  	mapChanges();
	  	$("#minutesSlide.slideRageBar span strong").text(minutesValue +" Min");
	  	$("#milesSlide.slideRageBar span strong").text((milesValue*0.000621371).toFixed(1)+" Mi");
	  	
	  	if(minutesValue > milesValue) {
	  		$('#minutesSlide').addClass('myactive');
	  		$('#milesSlide').removeClass('myactive');
	  	}else if(minutesValue < milesValue) {
	  		$('#minutesSlide').removeClass('myactive');
	  		$('#milesSlide').addClass('myactive');
	  	}
	}

	function mobileNumberValidation(evt){
		var charCode = (evt.which) ? evt.which : evt.keyCode;
          if (charCode != 46 && charCode > 31 
            && (charCode < 48 || charCode > 57))
             return false;

        if($("#mobileNum"+selectedBusiness).val().length < 14){
	    	var key = evt.charCode || evt.keyCode || 0;
	    	var $phone = $("#mobileNum"+selectedBusiness);

	    	if (key !== 8 && key !== 9) {		
	    		if ($phone.val().length === 0) {
					$phone.val('('+ $phone.val());
				}
				if ($phone.val().length === 4) {
					$phone.val($phone.val() + ')');
				}
				if ($phone.val().length === 5) {
					$phone.val($phone.val() + ' ');
				}			
				if ($phone.val().length === 9) {
					$phone.val($phone.val() + '-');
				}
			}
	      	return true;
	    } else{
	  		return false;
	    }
	}

	function changeCircle(){
		circle = new google.maps.Circle({
	      strokeColor: '#808080',
	      strokeOpacity: 0.8,
	      strokeWeight: 1,
	      fillColor: '#FFFFFF',
	      fillOpacity: 0.35,
	      map: map,
	      center: {lat: latitude, lng: longitude},
	      radius: 48280.3
	    });

	    //circle.bindTo('center', markers[0], 'position');
	}

	function updateMilesRadius(circle, rad){
		$( "#milesSlide" ).slider({
			value: rad
		});
	  	circle.setRadius(rad);
	  	milesValue = rad;

	  	$("#milesSlide.slideRageBar span strong").text((milesValue*0.000621371).toFixed(1)+" Mi");
		$("#filterMiles").val((milesValue*0.000621371).toFixed(1));
		
		if(milesValue*0.000621371 < 30 ){
			map.setZoom(10);
		}
		if(milesValue*0.000621371 < 20 ){
			map.setZoom(11);
		}
		if(milesValue*0.000621371 < 10 ){
			map.setZoom(12);
		}
		var i = 0;
		$( ".sliderSection2 ul li" ).each(function( index ) {
			if(markers[i]){
				if(customers[i].expectedTime < minutesValue && customers[i].destinationDistance < (milesValue*0.000621371)){
			  		$(this).show();
			  		markers[i].setVisible(true);
			  	}else{
			  		$(this).hide();
			  		markers[i].setVisible(false);
			  		infowindows[i].close(map, markers[i]);
			  	}
			}
		  	i++;
		});

		if(minutesValue > milesValue*0.000621371) {
	  		$('#minutesSlide').addClass('myactive');
	  		$('#milesSlide').removeClass('myactive');
	  	}else if(minutesValue < milesValue*0.000621371) {
	  		$('#minutesSlide').removeClass('myactive');
	  		$('#milesSlide').addClass('myactive');
	  	}
	}

	$("#filterMiles").on("change", function(){
		updateMilesRadius(circle, ($("#filterMiles").val()*1609.34));
	})

	function updateTimeRadius(circle, min){
		minutesValue = min;
		$("#minutesSlide.slideRageBar span strong").text(minutesValue +" Min");

		var i = 0;
		$( ".sliderSection2 ul li" ).each(function( index ) {
			if(markers[i]){
				if(customers[i].expectedTime < minutesValue && customers[i].destinationDistance < (milesValue*0.000621371)){
			  		$(this).show();
			  		markers[i].setVisible(true);
			  	}else{
			  		$(this).hide();
			  		markers[i].setVisible(false);
			  		infowindows[i].close(map, markers[i]);
			  	}
			}
		  	i++;
		});

		if(minutesValue > milesValue*0.000621371) {
	  		$('#minutesSlide').addClass('myactive');
	  		$('#milesSlide').removeClass('myactive');
	  	}else if(minutesValue < milesValue*0.000621371) {
	  		$('#minutesSlide').removeClass('myactive');
	  		$('#milesSlide').addClass('myactive');
	  	}
	}
	var mapChanges = function(){ 
		$('.gm-style-iw').parent('div').css('z-index','99999');
		$('.slideRageBar span').append('<strong class="ribbenSlide"></strong>');
	 }

	 function bookSlot(subdomain, mobile, i){
	 	var request1 = $.ajax({
			url: "http://49.206.64.209:9012/endpoint/api/bookslot",
            //url: "http://localhost:9012/endpoint/api/bookslot",
            type: "POST",
            beforeSend: function (xhr) {
            	//xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-HQGQ:zxosxtR76Z80"));
			    xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-a37f:kMEKlE0Ujovo"));
			},
            data: JSON.stringify({"subDomain":subdomain,"date":moment(new Date()).format('YYYY-MM-DD HH:MM'),"email":"","mobile":mobile,"minutes":"30", "userId":""}),
            contentType: "application/json; charset=UTF-8"
        });

        request1.success(function(result) {
        	$(".modal-title").text('Appointment Status');
        	if(result.Status == "Ok"){
        		if(result.startTime < new moment ().add({'minutes':30}).format("HH:mm")){
        			$(".modal-body").text('Slot Booked Successfully. See you Within 30 Minutes');
        		}else{
        			$(".modal-body").text('Slot Booked Successfully. See you At '+result.startTime);
        		}
    			$("#myModal").modal('show');
    			$(".book").prop("disabled",true);
    			infowindows[i].close(map, markers[i]);
    			markers[i].setIcon("/content/images/checkedInMarker1.png");
        		bookedBusiness = i;
        	}else{
        		$(".modal-body").text("Your Appointment was not booked. Desired slot is out of Business Hours");
    			$("#myModal").modal('show');
        	}
        });
        request1.fail(function(jqXHR, textStatus) {
        	$(".modal-title").text('Appointment Result');
        	$(".modal-body").text('Error Occured.');
        	$("#myModal").modal('show');
        });
	 }

	 function cityChange(){
	 	var geocoder =  new google.maps.Geocoder();
		var addr = $('#city-text').text()+","+$('#stateText').text();
		geocoder.geocode( { 'address': addr}, function(results, status) {
      	if (status == google.maps.GeocoderStatus.OK) {
      		var miles = 30;
      		var lat = results[0].geometry.location.lat();
      		var lng = results[0].geometry.location.lng();
      		var min = 30;
      		latitude = lat;
      		longitude = lng;
      		circle.setMap(null);
      		changeCircle();
      		getCustomerAPICall(lat, lng, miles, min, min);
        } else {
        	$(".modal-title").text('City Change');
        	$(".modal-body").text('Error while getting selected city lat,long');
        	$("#myModal").modal('show');
        }
	 });
	}

	function searchByName(){
		if($("#filterSearch").val() != ""){
			var i = 0;
			$( ".sliderSection2 ul li" ).each(function( index ) {
			  if(!$( this ).hasClass($("#filterSearch").val())){
			  	$(this).hide();
			  	markers[i].setVisible(false);
			  	infowindows[i].close(map, markers[i]);
			  }else{
			  	$(this).show();
			  	markers[i].setVisible(true);
			  }
			  i++;
			});
		} else{
			var i = 0;
			$( ".sliderSection2 ul li" ).each(function( index ) {
			  	$(this).show();
			  	markers[i].setVisible(true);
			  	i++;
			});
		}	
	}

	function getCustomerAPICall(lat, lng, miles, min, reqMin){
		miles = Number(miles);
		min = Number(min);
		reqMin = Number(reqMin);
		var request1 = $.ajax({
			url: "http://49.206.64.209:9012/endpoint/api/getmycustomers",
            //url: "http://localhost:9012/endpoint/api/getmycustomers",
            type: "POST",
            beforeSend: function (xhr) {
            	//xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-HQGQ:zxosxtR76Z80"));
			    xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-a37f:kMEKlE0Ujovo"));
			},
            data: JSON.stringify({"serviceId":"56f90f2e1c05d5734eec3271","latitude":lat, "longitude":lng,"miles": miles,"minutes":min, "userId":""}),
            //data: JSON.stringify({"serviceId":"56fe3b8bf597ef0f052db7f7","latitude":lat, "longitude":lng,"miles": miles,"minutes":min, "userId":""}),
            contentType: "application/json; charset=UTF-8"
        });

        request1.success(function(result) {
        	var missingCount = 0;
        	if(result.Status == "Ok"){
        		if(result.Data.length < 8){
        			missingCount = 8 - result.Data.length;
        			if(miles < 60 || min < 60){
        				miles += miles;
        				min += min;
        				if(miles > 60){
        					miles = 60;
        				}
        				if(min > 60){
        					min = 60;
        				}
        				getCustomerAPICall(lat, lng, miles, min, reqMin);
        			}else{
        				var data = changeObjOrder(result.Data, reqMin);
    					customerObjApplication(data, miles, min);
        			}
        		}else{
        			var data = changeObjOrder(result.Data, reqMin);
					customerObjApplication(data, miles, min);
        		}
        	}else if(result.Message == "No customers available"){
        		if(miles < 60 || min < 60){
        				miles += miles;
        				min += min;
        				if(miles > 60){
        					miles = 60;
        				}
        				if(min > 60){
        					min = 60;
        				}
        				getCustomerAPICall(lat, lng, miles, min, reqMin);
        			}else{
        				var emptySet = [];
    					customerObjApplication(emptySet, miles, min);
        				//TODO: Show no customers available in Slider and clear map.
        			}
        	}else{
        		$(".modal-title").text('Get Customers');
	        	$(".modal-body").text('Failed to get Customers.');
	        	$("#myModal").modal('show');
        	}
        	
        });
        request1.fail(function(jqXHR, textStatus) {
        	$(".modal-title").text('Get Customers');
        	$(".modal-body").text('Error occured while getting Customers.');
        	$("#myModal").modal('show');
        });
	}

	function changeObjOrder(cdat, reqMin){
		var premiumCustomers = [];
		var nonPremiumCustomers = [];
		customers = [];

		for(var i = 0; i < cdat.length; i++){
			if(cdat[i].expectedTime > reqMin){
				cdat[i].suggest = true;
			}
		}
		if(cdat.length > 8){
			if(cdat[8].suggest){
				for(var i = 8; i < cdat.length; i++){
					delete cdat[i];
				}
			}
		}
		
		for(var i = 0; i < cdat.length; i++){
			if(cdat[i]){
				if(cdat[i].premium){
					premiumCustomers.push(cdat[i]);
				}else{
					nonPremiumCustomers.push(cdat[i]);
				}
			}
		}

		for(var i = 0; i < premiumCustomers.length; i++){
			customers.push(premiumCustomers[i]);
		}
		for(var i = 0; i < nonPremiumCustomers.length; i++){
			customers.push(nonPremiumCustomers[i]);
		}
		return customers;
	}

	function customerObjApplication(data, miles, min){
		$( ".sliderSection2 ul").html('');
		loadClients(data);
		loadMap(data);
		updateMilesRadius(circle, miles*1609.34);
		updateTimeRadius(circle, min);
		$( "#milesSlide" ).slider({
			"value": miles*1609.34
		});
		$( "#minutesSlide" ).slider({
			"value": min
		});
		$("#filterMiles").val(miles);
		if($("#filterSearch").val()){
			var j = 0;
			$( ".sliderSection2 ul li" ).each(function( index ) {
			  if(!$( this ).hasClass($("#filterSearch").val())){
			  	$(this).hide();
			  	markers[j].setVisible(false);
			  	infowindows[j].close(map, markers[i]);
			  }else{
			  	$(this).show();
			  	markers[j].setVisible(true);
			  }
			  j++;
			});
		}
	}
	/*var loadNearCities = function(ncdat){
		$(".near-citi").html("");
		(ncdat || []).forEach(function(item){
			var tt = $("<div class='near-c " + item.city.replace(" ", "-") + "' style='background:grey;padding:5px;margin:5px;border-radius: 25px;text-align:center;vertical-align:middle;'><a href='javascript:void(0)'> " + item.city + "</a> (" + parseInt(item.distance) + " km)</div>");
			$(".near-citi").append(tt);
		});
	}*/

	/*$(document).on("change", "#rngsel", function(){
		document.getElementById("range").innerHTML= $(this).val();
		if (isCitySelected()){
			var ti = $('#city-text').data("city-latlong");
			var tt = {
				lat: (ti.lat || 17.413828),
				long: (ti.lng || 78.439758),
				dist: $(this).val()
			}
			loadAjax(tt, "getNearestCities", loadNearCities);		
		}
	});*/
	
	//slide mode simple
//using data attributes
//$(".live-tile").liveTile();

//without data-attributes
//$("#tile1").liveTile();
//$("#tile2").liveTile({ direction:'horizontal' });
	
// carousel mode: simple
//$("#tile3").liveTile();

/*
// without data- atrributes
$("#tile1").liveTile({
    delay: 3000,
    startNow: true,
    direction: 'horizontal'    
});
*/
	function isCitySelected(){
		return $("#stateText").text();
	}

	function isValidEmailAddress(emailAddress) {
    	var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    	return pattern.test(emailAddress);
	};
	
var loadClients = function(customers){
		
		$('.sliderSection2').gbCarousel({
		  slideItems:1,
		  showItems:4,
		  slideItem:'.slide',
		  slidePrev:'.leftArrow',
		  slideNext:'.rightArrow',
		  autoSlide:false,
		  slideDelay:2000,
		  slideSpeed:700,
		  slideWrap:'.sliderWrapper',
		  slider:'.slider',
		  screen1060Removeitems :1,
		  screen960Removeitems :2,
		  screen768Removeitems :3,
		  premium: false,
		  myDataCallback:customers
		});
	}


		
	$(window).scroll(function() {
    if($(window).scrollTop() > 50) {
        $('body').addClass('scroll_Icon');
    } else {
        $('body').removeClass('scroll_Icon');
    } 
});
$('.bottomScroll').click(function(){ 
      $('html,body').animate({scrollTop: $(document).height()}, 600);
      return false;
   });

var getMapView = function(subdomain){
	var DH = $(window).height() - 150;
 	for(var i = 0; i < customers.length; i++){
 		if(customers[i].subdomain == subdomain){
 			new google.maps.event.trigger( markers[i], 'click' );
 			$('html,body').animate({scrollTop: DH}, 600);
 		}
 	}
}

