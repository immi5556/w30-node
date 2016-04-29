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
        	alert(textStatus);
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
    		var ll = $("<li />").addClass(item.city.replace(/ /g, '-')).text(item.city);
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
		            alert("Something got wrong " + status);
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
    			requestAPI("getcities", {"state":$('#stateText').text()}, loadCity);
    		});
    	});
	}

	var requestAPI = function(action, obj, callback){
		var request = $.ajax({
			url: "http://49.206.64.209:9012/endpoint/api/"+action,
            //url: "http://localhost:9012/endpoint/api/"+action,
            type: "POST",
            beforeSend: function (xhr) {
			    xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-HQGQ:zxosxtR76Z80"));
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

	//requestAPI("getstates", {}, loadStates);
	
	var successFunction = function(pos){
		latitude = pos.coords.latitude;
		longitude = pos.coords.longitude;
		getCustomerAPICall(latitude, longitude, milesValue, minutesValue, minutesValue);
	}
	var errorFunction = function(err){
		console.log(err);
	}

	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
	} else {
	    alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
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
		        	companyAddr += docs[i].geo.address.premise+",";
		        }
		        if(docs[i].geo.address.sublocality){
		        	companyAddr += docs[i].geo.address.sublocality+",";
		        }
		        if(docs[i].geo.address.city){
		        	companyAddr += docs[i].geo.address.city+",";
		        }
	        }

	        var rating = 0;
		  	if(docs[i].rating){
		  		rating =docs[i].rating;
		  	}
	        
	        if(companyAddr){
	        	companyAddr = companyAddr.substring(0, companyAddr.length-1);
	        }else{
	        	companyAddr = "Sorry Address Not Provided."
	        }
	        if(docs[i].slotsAvailable > 0){
		  		contentString = '<div class="popHeader"><h2>'+docs[i].fullName+'</h2><div class="ratingRow"><div id="rate"><div id="rateYo"></div><span>'+rating+' (0)</span></div> <div id="miles">'+docs[i].destinationDistance.toFixed(2)+' Miles</div></div></div><div class="address"><p>'+companyAddr+'</p></div><div class="estimated"><span>Estimated Time :</span><span id="Time"> '+docs[i].expectedTime.toFixed(2)+' min</span></div><div style="padding-bottom:10px;"><input type="text" class="mapInput" placeholder="Cell #" id="mobileNum'+docs[i].subdomain+'" style="display:none;"></div><input type="button" class="book" id="bookSlot'+docs[i].subdomain+'" value="Schedule"><span class="bottomArrow"></span>';
		  	}else if(docs[i].slotsAvailable == 0){
		  		contentString = '<div class="popHeader"><h2>'+docs[i].fullName+'</h2><div class="ratingRow"><div id="rate"><div id="rateYo"></div><span>'+rating+' (0)</span></div> <div id="miles">'+docs[i].destinationDistance.toFixed(2)+' Miles</div></div></div><div class="address"><p>'+companyAddr+'</p></div><div class="estimated"><span></span><span id="Time"> '+docs[i].message+'</span></div><div style="padding-bottom:10px;"><input type="text" placeholder="Cell #" class="mapInput" id="mobileNum'+docs[i].subdomain+'" style="display:none;"></div><input type="button" class="book" id="bookSlot'+docs[i].subdomain+'" value="Schedule"><span class="bottomArrow"></span>';
		  	}
	        
		  	var subdomain = docs[i].subdomain;
		  	infowindow1.setContent(contentString);
	  		infowindows.push(infowindow1);						
		  	google.maps.event.addListener(marker, 'click', (function(marker, contentString, infowindow1, rating, subdomain, i) {
			    return function() {
	        		for(var i = 0; i < infowindows.length; i++){
	        			if(infowindows[i]){
	        				infowindows[i].close();
	        				if(docs[i].slotsAvailable > 0){
						  		icon = "/content/images/greenMarker1.png";
						  	}else if(docs[i].slotsAvailable == 0){
						  		icon = "/content/images/redMarker1.png";
						  	}
						  	if(docs[i].premium){
						  		icon = "/content/images/premiumMarker.png";
						  	}
						  	markers[i].setIcon(icon);
	        			}
	        		}
	        		var oldMarker = marker.icon;
			    	marker.setIcon("/content/images/on-clickMarker.png");
	        		infowindow1.open(map,marker);
	        		$('.gm-style-iw').parent('div').css('z-index','99999');
	        		$('.gm-style-iw').next('div').addClass('infoboxclose');
	        		$('.infowindow1').closest('.gm-style-iw').next('div').removeClass('infoboxclose');
			    	$("#bookSlot"+subdomain).on('click', function(){
			    		$("#bookSlot"+subdomain).val("Confirm");
			    		$("#mobileNum"+subdomain).css("display","block");
				  		if($("#mobileNum"+subdomain).val().length == 10){
				  			bookSlot(subdomain, $("#mobileNum"+subdomain).val(), i);
				  		}else{
				  			$("#mobileNum"+subdomain).css("border-color","red");
				  		}
				  	});
				  	$("#rateYo").rateYo({
					    rating: rating,
					    starWidth: "10px"
				  	});
			    };
		  	})(marker, contentString, infowindow1, rating, subdomain, i));

		  	google.maps.event.addListener(infowindow1,'closeclick', (function(marker, icon){
			   return function() {
			   		marker.setIcon(icon);
				}
			})(marker, icon));
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
		console.log($("#filterMiles").val());
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
			    xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-HQGQ:zxosxtR76Z80"));
			},
            data: JSON.stringify({"subDomain":subdomain,"date":moment(new Date()).format('YYYY-MM-DD HH:MM'),"email":"","mobile":mobile,"minutes":"30", "userId":""}),
            contentType: "application/json; charset=UTF-8"
        });

        request1.success(function(result) {
        	if(result.Status == "Ok"){
    			alert("Slot Booked Succesfully. See you At "+result.startTime);
    			$(".book").prop("disabled",true);
    			infowindows[i].close(map, markers[i]);
    			markers[i].setIcon("/content/images/checkedInMarker1.png");
        	}else{
        		alert("Failed to book Slot. "+result.Message);
        	}
        });
        request1.fail(function(jqXHR, textStatus) {
        	alert(textStatus);
        });
	 }

	 function cityChange(){
	 	var geocoder =  new google.maps.Geocoder();
		var addr = $('#city-text').text()+","+$('#stateText').text();
		geocoder.geocode( { 'address': addr}, function(results, status) {
      	if (status == google.maps.GeocoderStatus.OK) {
      		var miles = 30;
      		if($("#filterMiles").val()){
      			miles = $("#filterMiles").val();
      		}
      		var lat = results[0].geometry.location.lat();
      		var lng = results[0].geometry.location.lng();
      		var min = 30;
      		latitude = lat;
      		longitude = lng;
      		circle.setMap(null);
      		changeCircle();
      		getCustomerAPICall(lat, lng, miles, min, min);
        } else {
        	alert("error while getting lat,long");
        	//$('.push-down').text("Something got wrong " + status);
      	}
	 });
	}

	$("#applyFilter").on("click", function(){
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
	});

	function getCustomerAPICall(lat, lng, miles, min, reqMin){
		miles = Number(miles);
		min = Number(min);
		reqMin = Number(reqMin);
		var request1 = $.ajax({
			url: "http://49.206.64.209:9012/endpoint/api/getmycustomers",
            //url: "http://localhost:9012/endpoint/api/getmycustomers",
            type: "POST",
            beforeSend: function (xhr) {
			    xhr.setRequestHeader ("Authorization", "Basic " + btoa("win-HQGQ:zxosxtR76Z80"));
			},
            data: JSON.stringify({"serviceId":"56fe3b8bf597ef0f052db7f7","latitude":lat, "longitude":lng,"miles": miles,"minutes":min}),
            contentType: "application/json; charset=UTF-8"
        });

        request1.success(function(result) {
        	if(result.Status == "Ok"){
        		if(result.Data.length < 8){
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
        		alert("Failed to get clients.");
        	}
        	
        });
        request1.fail(function(jqXHR, textStatus) {
        	alert(textStatus);
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
		
		for(var i = 0; i < cdat.length; i++){
			if(cdat[i].premium){
				premiumCustomers.push(cdat[i]);
			}else{
				nonPremiumCustomers.push(cdat[i]);
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

//});