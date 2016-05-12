$(function(){

	var websiteData = {};
	var customSpecialities = [];
	var customBussinessType;

	var getAccountData = function(){
		websiteData.landing = {
			_emailstore: $("#_emailstore").val(),
			_idstore: $("#_idstore").val(),
			_uniqueid: $("#_uniqueid").val(),
			_name: $("_name").val(),
			_status: $("#_status").val(),
			_createdlandingat: $("#_createdlandingat").val()
		};
		websiteData._clientid = $("#_idclient").val();
	};

	var getDisplayData = function(){
		websiteData.companyName = $("#fullName").val();
		websiteData.subdomain = $("#subdomain").val();
		websiteData.logoPath = $("#logoPath").attr("src");
		websiteData.logoUrl = $("#logoUrl").val();
	};

	var getCompanyData = function(){
		websiteData.fullName = $("#fullName").val();
		websiteData.businessType = $("#businessType").val();
		var mobileNumber = $("#mobile").val();
		websiteData.mobile = mobileNumber.substring(1,4)+mobileNumber.substring(6,9)+mobileNumber.substring(10,14);
		websiteData.companyEmail = $("#companyEmail").val();
		websiteData.companyCity = $("#companyCity").val();
		websiteData.details = $("#details").val();
		websiteData.premium = false;
		websiteData.rating = 0;
	};

	var getGeoData = function(){
		websiteData.geo = {};
		websiteData.geo.metro = $("#_idmetro").val();
		websiteData.geo.region = $("#_idregion").val();
		websiteData.geo.city = $("#companyCity").val();
		websiteData.geo.country = $("#companyCountry").val();
		websiteData.geo.ll = [
			$("#companyLat").val(),
			$("#companyLon").val()
		];
		websiteData.geo.address = {};
		websiteData.geo.address.fulladdress = $("#__idfuladr").val();
		websiteData.geo.address.premise = $("#companyAddr").val();
		websiteData.geo.address.sublocality = $("#companyStreet").val();
		websiteData.geo.address.city = $("#companyCity").val();
		websiteData.geo.address.state = $("#companyState").val();
		websiteData.geo.address.postalcode = $("#companyZip").val();
		websiteData.geo.address.country = $("#companyCountry").val();
	}

	var getAppointConfigData = function(){
			websiteData.concurrentCount = $("#concurrentCount").val();
			websiteData.startHour = $("#startHour").val();
			websiteData.endHour = $("#endHour").val();
			websiteData.perdayCapacity = $("#perdayCapacity").val();
			websiteData.defaultDuration = $("#defaultDuration").val();
			websiteData.overlap = $("#overlap").is(":checked");
			websiteData.allowCustom = $("#allowCustom").is(":checked");
			websiteData.autoAcknowledge = $("#autoAcknowledge").is(":checked");
			websiteData.contactMandatory = $("#contactMandatory").is(":checked");
			websiteData.disclaimer = $("#disclaimer").val();
	}

	var getSpecialityOptions = function(){
		websiteData.specialities =[];
		$(".splty-container").each(function(){
			var spl = {};
			$(this).find(".splty-row").each(function(){
				spl.name = $(this).find(".splty-name").val();
				if($(this).find(".splty-name").val() == 'General'){
					$(this).find(".splty-name").attr("readonly", true);
				}
				spl.mins = $(this).find(".splty-mins").val();
				spl.icon = $(this).find(".splty-icon").attr("src");
			});
			if (!spl.name){
				return true;
			}
			spl.resources = [];
			$(this).find(".ress-row").each(function(){
				var ress = {};
				ress.name = $(this).find(".res-name").val();
				ress.mins = $(this).find(".res-mins").val();
				ress.icon = $(this).find(".res-icon").attr("src");
				if (!ress.name){
					return true;
				}
				spl.resources.push(ress);
			});
			websiteData.specialities.push(spl);
		});
	}

	var addbluimp = function(ele){
		$(ele).find(".upload-splty, .upload-ress").each(function(){
			var that = this;
			$(this).fileupload({ dataType: 'json', autoUpload: true, 
				done: function(dd, edata){
					$(dd.target).closest(".addrow").find("img").attr("src", "/uploaded/" + edata.result.files[0].name);
				} 
			});
		});

		$(ele).find(".splty-name").on('input',function(){
        	if($(this).val() == 'General' || $(this).val() == 'general'){
        		alert("Cannot add another general speciality");
        	}
        });
	};

	var addSpeciality = function(data){
		if(data.icon.substring(0, 13) === "/uploaded/si/"){
			data.icon = "/uploaded/"+data.icon.substring(13, data.icon.length);
		}
		if(data.name == 'General'){
			var str1 = '<div class="splty-container">\
							<div class="addrow splty-row"> \
								<input type="text" class="fieldItem1 fieldwid1 splty-name" value="'+data.name+'" readonly="readonly"> \
								<input type="text" class="fieldItem1 fieldwid2 splty-mins" value="'+data.mins+'"> \
								<div class="file-upload"> \
									<i class="fa fa-upload"></i> \
									<input class="upload upload-splty" id="uploadBtn2" type="file" name="files[]" data-url="/upload"> \
								</div> \
								<div class="imgIcon"> \
									<img class="splty-icon" src="'+data.icon+'"> \
								</div> \
								<a class="delete del-splt" disabled><i class="fa fa-trash"></i></a> \
								<label style="display:none;"><a class="add_btn resource add-ress-btn"><i class="fa fa-plus"></i> Resource</a></label> \
							</div> \
						</div>';	
		}else{
			var str1 = '<div class="splty-container">\
							<div class="addrow splty-row"> \
								<input type="text" class="fieldItem1 fieldwid1 splty-name" value="'+data.name+'" > \
								<input type="text" class="fieldItem1 fieldwid2 splty-mins" value="'+data.mins+'"> \
								<div class="file-upload"> \
									<i class="fa fa-upload"></i> \
									<input class="upload upload-splty" id="uploadBtn2" type="file" name="files[]" data-url="/upload"> \
								</div> \
								<div class="imgIcon"> \
									<img class="splty-icon" src="'+data.icon+'"> \
								</div> \
								<a class="delete del-splt"><i class="fa fa-trash"></i></a> \
								<label style="display:none;"><a class="add_btn resource add-ress-btn"><i class="fa fa-plus"></i> Resource</a></label> \
							</div> \
						</div>';
		}
		
	        var $str = $(str1);
	        $(".ad-spl-btn").closest(".add-spl-data").append($str);
	        addbluimp($str);
	}

	var addResource = function(data){
		var str1 = '<div class="addrow ress-row">\
							<input type="text" class="fieldItem1 fieldwid1 res-name" value="'+data.name+'">\
							<input type="text" class="fieldItem1 fieldwid2 res-mins" value="'+data.mins+'">\
							<div class="file-upload">\
								<i class="fa fa-upload"></i> \
								<input class="upload upload-ress" id="uploadBtn1" type="file" name="files[]" data-url="/upload">\
							</div>\
							<div class="imgIcon">\
								<img class="res-icon" src="'+data.icon+'">\
							</div>\
							<a class="delete del-rsrc"><i class="fa fa-trash"></i></a> \
						</div>';
	        var $str = $(str1);
	        $(".add-ress-btn").closest(".splty-container").append($str);
	        addbluimp($str);
	}

	var checkTextBox = function(id){
		if (!$("#"+id).val() || $("#"+id).val().length > 30){
			$("#"+id).css({
				'border-color': 'red'
			});
			$("#"+id).focus();
			return false;
		}else{
			$("#"+id).css({
				'border-color': 'green'
			});
			return true;
		}
	}

	var checkFloatBox = function(id){
		function isFloat(n){
		    return Number(n) == n && n % 1 !== 0;
		}

		if (!$("#"+id).val() || $("#"+id).val().length > 15 || !isFloat($("#"+id).val() || $("#"+id).val() == 0))	{
			$("#"+id).css({
				'border-color': 'red'
			});
			$("#"+id).focus();
			return false;
		}else{
			$("#"+id).css({
				'border-color': 'green'
			});
			return true;
		}
	}

	var checkEmailBox = function(id){

		if (!$("#"+id).val())	{
			$("#"+id).css({
				'border-color': 'red'
			});
			$("#"+id).focus();
			return false;
		}else {
			var req = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		if(!req.test($("#"+id).val())){
    			$("#"+id).css({
					'border-color': 'red'
				});
				$("#"+id).focus();
    			return false;
    		}else{
    			$("#"+id).css({
					'border-color': 'green'
				});
				return true;
    		}
		}
	}

	var checkSelectBox = function(id){
		if ($("#"+id).val() == "Select")	{
			$("#"+id).css({
				'border-color': 'red'
			});
			$("#"+id).focus();
			return false;
		}else{
			$("#"+id).css({
				'border-color': 'green'
			});
			return true;
		}
	}

	var validations = function(){
		
		var textBoxIds = ['fullName','companyStreet','companyCity','companyState','companyZip','companyCountry','subdomain','startHour','endHour','defaultDuration','concurrentCount','perdayCapacity'];
		for(var i = 0; i < textBoxIds.length; i++){
			if(!checkTextBox(textBoxIds[i])){
				return false;
			}
		}
		
		if($("#mobile").val().length == 14){
			return true;
			$("mobile").css("border-color", "green")
		}else{
			return false;
			$("#mobile").css("border-color", "red");
			$("#mobile").focus();
		}

		var emailBoxIds = ['companyEmail'];
		for(var i = 0; i < emailBoxIds.length; i++){
			if(!checkEmailBox(emailBoxIds[i])){
				return false;
			}
		}

		var floatBoxIds = ['companyLat','companyLon'];
		for(var i = 0; i < floatBoxIds.length; i++){
			if(!checkFloatBox(floatBoxIds[i])){
				return false;
			}
		}

		var selectBoxIds = ['businessType'];
		for(var i = 0; i < selectBoxIds.length; i++){
			if(!checkSelectBox(selectBoxIds[i])){
				return false;
			}
		}
		getSpecialityOptions();
		if(!websiteData.specialities.length){
			alert("Add Atleast 1 speciality");
			return false;
		}

		return true;
	}

	var request1 =function() { 
		
		getAccountData();
		getDisplayData();
		getCompanyData();
		getGeoData();
		getAppointConfigData();
		getSpecialityOptions();
		var generalCount = 0;
		for(var i = 0; i < websiteData.specialities.length; i++){
			if(websiteData.specialities[i].name == "General" || websiteData.specialities[i].name == "general"){
				generalCount++;
			}
		}
		if(generalCount > 1){
			alert('Cannot add more than 1 general speciality');
			return false;
		}
		var tt = JSON.stringify(websiteData);
		var request = $.ajax({
	        url: "/endpoint/cupdate",
	        type: "POST",
	        data: tt, 
	        contentType: "application/json; charset=UTF-8"
	    });

	    request.success(function(result) {
	        $("#resp-cont").html('<p>Your customized business page is Ready!<br>Share this URL with your Customers: <a target="_blank" href="http://' + $("#subdomain").val()  + '.que.one" style="color:blue;"><b>' +  ($("#subdomain").val() || 'test') + '.que.one</b></a><br> Share this URL with Admin users: <a target="_blank" href="http://' + $("#subdomain").val()  + '.que.one/'+$("#_uniqueid").val()+'" style="color:blue;"><b>' +  ($("#subdomain").val() || 'test') + '.que.one/'+$("#_uniqueid").val()+'</b></a><p>');
	        Custombox.open({
		      target: '#alert-pop',
		      effect: 'fadein'
		    });
		    customSpecialities = websiteData.specialities;
		    customBussinessType = websiteData.businessType;
	    });
	    request.fail(function(jqXHR, textStatus) {
	        $("#resp-cont").text('Errored: ' + jqXHR.responseText);
	        Custombox.open({
		      target: '#alert-pop',
		      effect: 'fadein'
		    });
	    });
	}

	var checkdomain = function(query, subDomainSugg, callback){
		var request = $.ajax({
	        url: "/endpoint/checkdomain",
	        type: "POST",
	        data: JSON.stringify(query), 
	        contentType: "application/json; charset=UTF-8"
	    });

	    request.success(function(result) {
	        //console.log(result);
	    });
	    request.fail(function(jqXHR, textStatus) {
	    	if(jqXHR.responseText == "Subdomain already taken"){
	    		if(query.subdomain.substring(query.subdomain.length - 8,query.subdomain.length) != "services"){
	    			query.subdomain = query.subdomain+"services";
	    		}else if($("#companyCity").val()){
	    			query.subdomain = query.subdomain+$("#companyCity").val();
	    		}else if(isNaN(query.subdomain.substring(query.subdomain.length -2 ,query.subdomain.length))){
	    			query.subdomain = query.subdomain+Math.floor((Math.random() * 100) + 1)
	    		}else{
	    			query.subdomain = query.subdomain.substring(0,query.subdomain.length-2)+Math.floor((Math.random() * 100) + 1)
	    		}
	    		query.subdomain = query.subdomain+Math.floor((Math.random() * 100) + 1);
	     		checkdomain(query, subDomainSugg, callback);
	     	} else if(jqXHR.responseText == "Subdomain not exists"){
	    		subDomainSugg.push(query.subdomain);
	    		if(subDomainSugg.length == 3){
	    			callback(subDomainSugg);
	    		}else{
	    			if(query.subdomain.substring(query.subdomain.length - 8,query.subdomain.length) != "services"){
		    			query.subdomain = query.subdomain+"services";
		    		}else if($("#companyCity").val()){
		    			query.subdomain = query.subdomain+$("#companyCity").val();
		    		}else if(isNaN(query.subdomain.substring(query.subdomain.length -2 ,query.subdomain.length))){
		    			query.subdomain = query.subdomain+Math.floor((Math.random() * 100) + 1)
		    		}else{
		    			query.subdomain = query.subdomain.substring(0,query.subdomain.length-2)+Math.floor((Math.random() * 100) + 1)
		    		}
	    			checkdomain(query, subDomainSugg, callback);
	    		}
	    	}
	    });
  	}

  	var calculate = function(){
  		var time1 = $("#startHour").val().split(':'), time2 = $("#endHour").val().split(':');
	 	var hours1 = parseInt(time1[0], 10), 
		     hours2 = parseInt(time2[0], 10),
		     mins1 = parseInt(time1[1], 10),
		     mins2 = parseInt(time2[1], 10);
		 var hours = hours2 - hours1, mins = 0;

		 // get hours
		 if(hours < 0) hours = 24 + hours;

		 // get minutes
		 if(mins2 >= mins1) {
		     mins = mins2 - mins1;
		 }
		 else {
		     mins = (mins2 + 60) - mins1;
		     hours--;
		 }

		 // convert to fraction of 60
		 minss = mins;
		 mins = mins / 60; 

		 hours += mins;
		 hours = hours.toFixed(0);
		 var conCount = ((hours * 60 + minss)/$("#defaultDuration").val())*$("#concurrentCount").val();
		 $("#perdayCapacity").val(conCount.toFixed(0));
  	}

	$("#sveCli").on("click", function(){

	});

	$("#apptConfig").on("click", function(){

	});
	$("#subdomain").on("focusout", function(){
		$(this).css({
			"border": "1px solid #a9d3bd"
		});
	})

	$("#sveWs").on("click", function(e) {
		if(validations()){
			request1();	
		}
		
		e.preventDefault();
	});

	$("select").on("change", function(){
		if ($(this).val() == 'other'){
			$(this).next().next().css("display", "block");
		}else {
			$(this).next().next().css("display", "none");
		}
	});

	$('#overlap').change(function() {
        if($(this).is(":checked")) {
            $("#concurrentCount").attr("readonly", false);
        }else{
        	$("#concurrentCount").val(1);
        	$("#concurrentCount").attr("readonly", true);
        	calculate();
        }      
    });

    $('#startHour').change(function() {
    	if($('#startHour').val && $('#endHour').val() && $('#defaultDuration').val()){
    		if(!$('#concurrentCount').val()){
    			$('#concurrentCount').val(1);
    		}
    		calculate();
    	}else{
    		$('#concurrentCount').val(1);
    		$('#perdayCapacity').val(50);
    	}
    });

    $('#endHour').change(function() {
    	if($('#startHour').val && $('#endHour').val() && $('#defaultDuration').val()){
    		if(!$('#concurrentCount').val()){
    			$('#concurrentCount').val(1);
    		}
    		calculate();
    	}else{
    		$('#concurrentCount').val(1);
    		$('#perdayCapacity').val(50);
    	}
    });

    $('#concurrentCount').on('input', function() {
    	if(!$('#concurrentCount').val()){
			$('#concurrentCount').val(1);
		}
    	if($('#startHour').val && $('#endHour').val() && $('#defaultDuration').val()){
    		calculate();
    	}
    });

    $('#defaultDuration').on('input', function() {
    	if($('#startHour').val && $('#endHour').val() && $('#defaultDuration').val()){
    		if(!$('#concurrentCount').val()){
    			$('#concurrentCount').val(1);
    		}
    		calculate();
    	}else{
    		$('#perdayCapacity').val(50);
    	}
    });

	$( "#fullName" )
	  .focusout(function() {
	  	if(!websiteData._clientid){
	  		var subDomainSugg = [];
	  		var subDomain = $( "#fullName" ).val().toLowerCase().replace(/[^a-zA-Z]/g, '');
	  		var query = {
				subdomain: subDomain,
				checkDomain: true
			};
	  		checkdomain(query, subDomainSugg, function(result){
	  			$("#subDomainSuggestions div").html('');
	  			$("#subDomainSuggestions label").html("URL Suggestions:");
	  			for(var i = 0; i < result.length; i++){
	  				$("#subDomainSuggestions div").append("<input type='radio' class='selectedSubDomain' name='subDomain' value='"+result[i]+"'> "+result[i]+"<br>");
	  			}
	  			$("#subDomainSuggestions div").click(function () {
			        $.each($("input[name='subDomain']:checked"), function(){
		                $("#subdomain").val($(this).val());
		                $("#logoUrl").val($(this).val()+".que.one");
		            });
			    });

	  		});	
	  	}
	  });

  	$("#subdomain").on('change keyup paste', function() {
	    if($(this).val()){
	  		$("#logoUrl").val($(this).val()+".que.one");
	  	}else{
	  		$("#logoUrl").val("");
	  	}
	});

	$(document).ready(function(){
		customBussinessType = $("#businessType").val();
		getSpecialityOptions();
		customSpecialities = websiteData.specialities;
		websiteData._clientid = $("#_idclient").val();
		
		if($("#mobile").val()){
			var mobileNumber = $("#mobile").val();
			var temp = '('+mobileNumber.substring(0,3)+') '+mobileNumber.substring(3,6)+'-'+mobileNumber.substring(6,10);
			$("#mobile").val(temp);
		}
	});
	$("#businessType").on("change", function(){
		if($("#businessType").val() != "Select"){
			if($("#businessType").val() == customBussinessType){
				$(".splty-container").remove();
				for(i in customSpecialities){
		        	addSpeciality(customSpecialities[i]);
					for( j in customSpecialities[i].resources){
						addResource(customSpecialities[i].resources[j]);
					}
		        }
			}else{
				var query = {
					name: $("#businessType").val()
				};
				var request = $.ajax({
			        url: "/endpoint/getSpecialists",
			        type: "POST",
			        data: JSON.stringify(query), 
			        contentType: "application/json; charset=UTF-8"
			    });

			    request.success(function(result) {
			        if(result.length){
			        	websiteData.specialities = result[0].specialities;
			        }else{
			        	websiteData.specialities = [];
			        }
			        $(".splty-container").remove();
			        for(i in websiteData.specialities){
			        	addSpeciality(websiteData.specialities[i]);
						for( j in websiteData.specialities[i].resources){
							addResource(websiteData.specialities[i].resources[j]);
						}
			        }
			    });
			    request.fail(function(jqXHR, textStatus) {
			        alert("Errored..");
			    });
			}
		}else{
			$(".splty-container").remove();
		}
	});

	function makeid() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    return text;
	}

	

	$(document).on("click", ".del-splt", function() {
		if($(this).closest(".splty-container").find('.splty-name').val() == "General"){
			alert("Can't delete General Speciality.");
		}else{
			$(this).closest(".splty-container").remove();
		}
	});

	$(document).on("click", ".ad-spl-btn", function() {
		var str1 = '<div class="splty-container">\
						<div class="addrow splty-row"> \
							<input type="text" class="fieldItem1 fieldwid1 splty-name" /> \
							<input type="text" class="fieldItem1 fieldwid2 splty-mins" /> \
							<div class="file-upload"> \
								<i class="fa fa-upload"></i> \
								<input class="upload upload-splty" id="uploadBtn2" type="file" name="files[]" data-url="/upload"> \
							</div> \
							<div class="imgIcon"> \
								<img class="splty-icon" src="static/images/sample-logo.jpg"> \
							</div> \
							<a class="delete del-splt"><i class="fa fa-trash"></i></a> \
							<label style="display:none;"><a class="add_btn resource add-ress-btn"><i class="fa fa-plus"></i> Resource</a></label> \
						</div> \
					</div>';
        var $str = $(str1);
        $(this).closest(".add-spl-data").append($str);
        addbluimp($str);

	});

	$(document).on("click", ".add-ress-btn", function(){
		var cnt = makeid();
		var str1 = '<div class="addrow ress-row">\
						<input type="text" class="fieldItem1 fieldwid1 res-name" />\
						<input type="text" class="fieldItem1 fieldwid2 res-mins" />\
						<div class="file-upload">\
							<i class="fa fa-upload"></i> \
							<input class="upload upload-ress" id="uploadBtn1" type="file" name="files[]" data-url="/upload">\
						</div>\
						<div class="imgIcon">\
							<img class="res-icon" src="static/images/sample-logo.jpg">\
						</div>\
						<a class="delete del-rsrc"><i class="fa fa-trash"></i></a> \
					</div>';
        var $str = $(str1);
        $(this).closest(".splty-container").append($str);
        addbluimp($str);
	});

	/*$(document).on("click", ".del-splt", function(){
		if($(this).closest(".splty-container").find('.splty-name').val() == "General"){
			alert("Can't delete General Speciality.");
		}else{
			$(this).closest(".splty-container").remove();
		}
	});*/

	$(document).on("click", ".del-rsrc", function(){
		$(this).closest(".addrow").remove();
	});

	$('#uploadBtn').fileupload({ dataType: 'json', autoUpload: true, 
		done: function(dd, edata){
			$("#logoPath").attr("src", 'uploaded/' + edata.result.files[0].name);
		} 
	});

	$('.upload-splty, .upload-ress').each(function(){
		var that = this;
		$(this).fileupload({ dataType: 'json', autoUpload: true, 
			done: function(dd, edata){
				$(dd.target).closest(".addrow").find("img").attr("src", "/uploaded/" + edata.result.files[0].name);
			} 
		});
	});

	$('.clockpicker').clockpicker();

});

function mobileNumberValidation(evt){
	var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode != 46 && charCode > 31 
        && (charCode < 48 || charCode > 57))
         return false;

    if($("#mobile").val().length < 14){
    	var key = evt.charCode || evt.keyCode || 0;
    	var $phone = $("#mobile");

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
