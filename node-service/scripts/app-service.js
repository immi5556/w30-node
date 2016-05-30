var serviceObject  = function() {
	var hostingIP = "49.206.64.209"; //49.206.64.209 server
	var curItem = undefined, appscope;
	var modal = document.getElementById('myModal');
	var specModal = document.getElementById('specModal');
	var span = document.getElementsByClassName("close")[0];
	var btnCan = document.getElementById("btnCancel");
	var specCan = document.getElementById("btnCancelSpec");
	var selectedServiceId;
	var specialities =[];

	span.onclick = function() {
		curItem = undefined;
		$("#merrr").text("");
		$("#errr").text("");
	    modal.style.display = "none";
	}
	btnCan.onclick = function() {
		curItem = undefined;
		$("#merrr").text("");
		$("#errr").text("");
	    modal.style.display = "none";
	}
	specCan.onclick = function() {
		curItem = undefined;
		$("#merrr").text("");
		$("#errr").text("");
	    specModal.style.display = "none";
	    clearSpecModal();
	}
	
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}

	function makeid() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    return text;
	}

	var addbluimp = function(ele){
		$(ele).find(".upload-splty, .upload-ress").each(function(){
			var that = this;
			$(this).fileupload({ dataType: 'json', autoUpload: true, 
				done: function(dd, edata){
					$(dd.target).closest(".addrow").find("img").attr("src", "http://"+hostingIP+":8083/uploaded/specialities/" + edata.result.files[0].name);
				} 
			});
		});
	};

	var clearSpecModal = function(){
		var i =0;
		$(".splty-container").each(function(){
			$(this).find(".splty-row").each(function(){
				$(this).find(".splty-name").val('');
				$(this).find(".splty-mins").val('');
				$(this).find(".splty-icon").attr("src", '/uploaded/si/sample-logo.jpg');
				if( i != 0){
					$(this).remove();
				}
				i++;
			});
			$(this).find(".ress-row").each(function(){
				$(this).find(".res-name").val('');
				$(this).find(".res-mins").val('');
				$(this).find(".res-icon").attr("src", '/uploaded/si/sample-logo.jpg');
				if( i != 0){
    				$(this).remove();
    			}
			});
		});
		$("#merrrSpec").html('');
	}

	var getSpecialityOptions = function(){
		
		$(".splty-container").each(function(){
			var spl = {};
			$(this).find(".splty-row").each(function(){
				spl.name = $(this).find(".splty-name").val();
				spl.mins = $(this).find(".splty-mins").val();
				spl.icon = $(this).find(".splty-icon").attr("src").substring(44, $(this).find(".splty-icon").attr("src").length);
			});
			if (!spl.name){
				return true;
			}
			spl.resources = [];
			$(this).find(".ress-row").each(function(){
				var ress = {};
				ress.name = $(this).find(".res-name").val();
				ress.mins = $(this).find(".res-mins").val();
				ress.icon = $(this).find(".res-icon").attr("src").substring(43, $(this).find(".res-icon").attr("src").length);
				if (!ress.name){
					return true;
				}
				spl.resources.push(ress);
			});
			specialities.push(spl);
		});
	}

	var scopeFunction = function($scope) {

		var populateControls = function(item){
			curItem = item;
			$("#txtName").val(item.name);
			$("#txtDesc").val(item.descr);
			$("#img-item").attr("src", "http://"+hostingIP+":8083/uploaded/services/"+item.image);
			$("#mobileTxtDesc").val(item.mobileDecription);
			$("#mobile-img-item").attr("src", "http://"+hostingIP+":8083/uploaded/services/"+item.mobileImage);
			$("#mobile-menu-img-item").attr("src", "http://"+hostingIP+":8083/uploaded/services/"+item.mobileMenuImage);
			$("#currentState").prop('checked', item.active);
		}

		$('#upl').fileupload({ dataType: 'json', autoUpload: true, 
			done: function(dd, edata){
				$("#img-item").attr("src", 'http://'+hostingIP+':8083/uploaded/services/' + edata.result.files[0].name);
				$("#img-cont").css("display", "block");
			} 
		});

		$('#mobileUpl').fileupload({ dataType: 'json', autoUpload: true, 
			done: function(dd, edata){
				$("#mobile-img-item").attr("src", 'http://'+hostingIP+':8083/uploaded/services/' + edata.result.files[0].name);
				$("#mobile-img-cont").css("display", "block");
			} 
		});

		$('#mobileMenuImageUpl').fileupload({ dataType: 'json', autoUpload: true, 
			done: function(dd, edata){
				$("#mobile-menu-img-item").attr("src", 'http://'+hostingIP+':8083/uploaded/services/' + edata.result.files[0].name);
				$("#mobile-menu-img-cont").css("display", "block");
			} 
		});
		
		$("#btnAdd").on("click", function(){
			$("#img-cont").css("display", "none");
			$("#mobile-img-cont").css("display", "none");
			$("#img-item").attr("src", "");
			$("#mobile-img-item").attr("src","");
			$("#mobile-menu-img-item").attr("src","");
	    	modal.style.display = "block";
	    	$("#btnSave").css("display", "inline-block");
	    	$("#btnDel").css("display", "none");
	    	populateControls({});
		});

		$(document).on("click", ".a-add", function(){
			specModal.style.display = "block";
			selectedServiceId = $(this).data("serid");
			$(".splty-container").remove();
			getSpecialities(function(result){
				if(result.length){
					for(var i in result[0].specialities){
						//console.log(result[0].specialities[i].name);
						var str1 = '<div class="splty-container">\
								<div class="addrow splty-row" style="background-color:red;"> \
									<input type="text" class="fieldItem1 fieldwid1 splty-name" value="'+result[0].specialities[i].name+'"> \
									<input type="text" class="fieldItem1 fieldwid2 splty-mins" value="'+result[0].specialities[i].mins+'"> \
									<div class="file-upload"> \
										<i class="fa fa-upload"></i> \
										<input class="upload upload-splty" id="uploadBtn2" type="file" name="files[]" data-url="http://'+hostingIP+':8083/uploadSpec"> \
									</div> \
									<div class="imgIcon"> \
										<img class="splty-icon" src="http://'+hostingIP+':8083/uploaded/specialities/'+result[0].specialities[i].icon+'"> \
									</div> \
									<a class="delete del-splt"><i class="fa fa-trash"></i></a> \
									<label><a class="add_btn resource add-ress-btn"><i class="fa fa-plus"></i> Resource</a></label> \
								</div> \
							</div>';
				        var $str = $(str1);
				        $(".ad-spl-btn").closest(".add-spl-data").append($str);
				        addbluimp($str);
				        for(var j in result[0].specialities[i].resources){
				        	var cnt = makeid();
							var str1 = '<div class="addrow ress-row">\
											<input type="text" class="fieldItem1 fieldwid1 res-name" value="'+result[0].specialities[i].resources[j].name+'">\
											<input type="text" class="fieldItem1 fieldwid2 res-mins" value="'+result[0].specialities[i].resources[j].mins+'">\
											<div class="file-upload">\
												<i class="fa fa-upload"></i> \
												<input class="upload upload-ress" id="uploadBtn1" type="file" name="files[]" data-url="http://'+hostingIP+':8083/uploadSpec">\
											</div>\
											<div class="imgIcon">\
												<img class="res-icon" src="http://'+hostingIP+':8083/uploaded/specialities/'+result[0].specialities[i].resources[j].icon+'">\
											</div>\
											<a class="delete del-rsrc"><i class="fa fa-trash"></i></a> \
										</div>';
					        var $str = $(str1);
					        $(".add-ress-btn").closest(".splty-container").append($str);
					        addbluimp($str);
				        }
					}
				}
			});
			
		});

		$(document).on("click", ".ad-spl-btn", function() {
			var str1 = '<div class="splty-container">\
							<div class="addrow splty-row" style="background-color:red;"> \
								<input type="text" class="fieldItem1 fieldwid1 splty-name" /> \
								<input type="text" class="fieldItem1 fieldwid2 splty-mins" /> \
								<div class="file-upload"> \
									<i class="fa fa-upload"></i> \
									<input class="upload upload-splty" id="uploadBtn2" type="file" name="files[]" data-url="http://'+hostingIP+':8083/uploadSpec"> \
								</div> \
								<div class="imgIcon"> \
									<img class="splty-icon" src="static/images/sample-logo.jpg"> \
								</div> \
								<a class="delete del-splt"><i class="fa fa-trash"></i></a> \
								<label><a class="add_btn resource add-ress-btn"><i class="fa fa-plus"></i> Resource</a></label> \
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
								<input class="upload upload-ress" id="uploadBtn1" type="file" name="files[]" data-url="http://'+hostingIP+':8083/uploadSpec">\
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

		$(document).on("click", "#specClose", function(){
			curItem = undefined;
			$("#merrr").text("");
			$("#errr").text("");
		    specModal.style.display = "none";
		    clearSpecModal();
		});

		$(document).on("click", ".del-splt", function() {
			$(this).closest("tr").remove();
		});

		$(document).on("click", ".del-splt", function(){
			$(this).closest(".splty-container").remove();
		});

		$(document).on("click", ".del-rsrc", function(){
			$(this).closest(".addrow").remove();
		});

		$(document).on("click", ".a-edit", function(){
			$("#img-cont").css("display", "none");
			$("#mobile-img-cont").css("display", "none");
			$("#mobile-menu-img-cont").css("display", "none");
			var fdat = $(this).data("serid");
			var fitm = $scope.services.filter(function(item){
				if (item._id == fdat)
					return item;
			});
			if (fitm.length) {
				populateControls(fitm[0]);
				$("#img-cont").css("display", "block");
				$("#mobile-img-cont").css("display", "block");
				$("#mobile-menu-img-cont").css("display", "block");
			}
	    	modal.style.display = "block";
	    	$("#btnSave").css("display", "inline-block");
	    	$("#btnDel").css("display", "none");
		});

		$(document).on("click", ".d-edit", function(){
			$("#img-cont").css("display", "none");
			$("#mobile-img-cont").css("display", "none");
			$("#mobile-menu-img-cont").css("display", "none");
			var fdat = $(this).data("serid");
			var fitm = $scope.services.filter(function(item){
				if (item._id == fdat)
					return item;
			});
			if (fitm.length) {
				populateControls(fitm[0]);
				$("#img-cont").css("display", "block");
				$("#mobile-img-cont").css("display", "block");
				$("#mobile-menu-img-cont").css("display", "block");
			}
	    	modal.style.display = "block";
	    	$("#btnSave").css("display", "none");
	    	$("#btnDel").css("display", "inline-block");
		});

		$("#btnSave").on("click", function(){
			$("#errr").text("");
			$("#merrr").text("");
			if (!$("#txtName").val()){
				$("#merrr").text("Enter Name");
				return;
			}
			if (!$("#txtDesc").val()){
				$("#merrr").text("Enter  Description");
				return;
			}
			if (!$("#img-item").attr("src")){
				$("#merrr").text("Select Image");
				return;
			}
			if (!$("#mobile-img-item").attr("src")){
				$("#merrr").text("Select mobile Image");
				return;
			}
			if (!$("#mobile-menu-img-item").attr("src")){
				$("#merrr").text("Select mobile menu Image");
				return;
			}
			
			curItem.name = $("#txtName").val();
			curItem.descr = $("#txtDesc").val();
			curItem.image = $("#img-item").attr("src").substring(40, $("#img-item").attr("src").length);
			curItem.mobileDecription = $("#mobileTxtDesc").val();
			curItem.mobileImage = $("#mobile-img-item").attr("src").substring(40, $("#mobile-img-item").attr("src").length);
			curItem.mobileMenuImage = $("#mobile-menu-img-item").attr("src").substring(40, $("#mobile-menu-img-item").attr("src").length);
			curItem.active = $("#currentState").prop("checked");

			if (curItem._id){
				ajaxCall("/endpoint/service/update", function(data){
					replace(curItem);
				});
			} else {
				ajaxCall("/endpoint/service/insert", function(data){
					add(data);
				});
			}
		});

		$("#btnSaveSpec").on("click", function(){
			$("#errr").text("");
			$("#merrr").text("");
			
			if (selectedServiceId){
				getSpecialityOptions();
				var obj = {
							serviceId : selectedServiceId,
							specialities : specialities
						};

				var request = $.ajax({
			        url: "/endpoint/specialities/update",
			        type: "POST",
			        data: JSON.stringify(obj),
			        contentType: "application/json; charset=UTF-8"
			    });

				request.success(function(result) {
			        specModal.style.display = "none";
			        $("#errr").text("Created Successfully...")
			        specialities = [];
			        clearSpecModal();
			    });
			    request.fail(function(jqXHR, textStatus) {
			        $("#errr").text("errored...");
			    });
			}
		});

		var getSpecialities = function(callback){
			var query = {
				serviceId : selectedServiceId
			};
			var request = $.ajax({
		        url: "/endpoint/specialities/get",
		        type: "POST",
		        data: JSON.stringify(query),
		        contentType: "application/json; charset=UTF-8"
		    });

			request.success(function(result) {
				callback(result);
		    });
		    request.fail(function(jqXHR, textStatus) {
		        $("#merrrSpec").text("errored...");
		    });
		}

		$("#btnDel").on("click", function(){
			if (curItem._id) {
				ajaxCall("/endpoint/service/delete", function(data) {
					remove(curItem);
				});
			}
		});

		var ajaxCall = function(url, callback){
			if (curItem) delete curItem.$$hashKey;
			var request = $.ajax({
		        //url: "http://landing.que.one/endpoint/ccreate",
		        url: url,
		        type: "POST",
		        data: JSON.stringify(curItem),
		        contentType: "application/json; charset=UTF-8"
		    });

		    request.success(function(result) {
		        modal.style.display = "none";
		        if (callback){
		        	callback(result);
		        }
		    });
		    request.fail(function(jqXHR, textStatus) {
		        $("#errr").text("errored...")
		    });
		}
	
		$scope.services = [];
		$scope.specialities = [];
		$scope.current = curItem;

		var add =  function(itm) {
        	$scope.services.push(itm);
        	$scope.$apply();
    	};

    	var replace =  function(itm) {
        	var lst = $scope.services.filter(function(item){
				if (item._id == itm._id)
					return item;
			});
			lst.forEach(function(itmm){
				var idx = $scope.services.indexOf(itmm);
				$scope.services.splice(idx, 1);
			});
			add(itm);
    	};

    	var remove = function(itm) {
    		var lst = $scope.services.filter(function(item){
				if (item._id == itm._id)
					return item;
			});
			lst.forEach(function(itmm){
				var idx = $scope.services.indexOf(itmm);
				$scope.services.splice(idx, 1);
			});
			$scope.$apply();
    	}

    	ajaxCall("/endpoint/service/getservices", function(data){
			data.forEach(function(item){
				add(item);
			});
		});
	} // scopeFunction complete

	var myapp = angular.module("myapp", []);
	myapp.controller('mainController', scopeFunction);

	return {
		getApp: function(){
			return myapp;
		},
		getservices: function(){
			var scope = angular.element(document.getElementById("lft-serv")).scope();
			return scope.services;
		}
	}
}();
