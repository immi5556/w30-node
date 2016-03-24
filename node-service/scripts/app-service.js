var serviceObject  = function() {
	var curItem = undefined, appscope;
	var modal = document.getElementById('myModal');
	var span = document.getElementsByClassName("close")[0];
	var btnCan = document.getElementById("btnCancel");

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

	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}

	var scopeFunction = function($scope) {

		var populateControls = function(item){
			curItem = item;
			$("#txtName").val(item.name);
			$("#txtDesc").val(item.descr);
			$("#img-item").attr("src", item.image);
			$("#mobileTxtDesc").val(item.mobileDecription);
			$("#mobile-img-item").attr("src", item.mobileImage);
		}

		$('#upl').fileupload({ dataType: 'json', autoUpload: true, 
			done: function(dd, edata){
				$("#img-item").attr("src", '/uploaded/si/' + edata.result.files[0].name);
				$("#img-cont").css("display", "block");
			} 
		});

		$('#mobileUpl').fileupload({ dataType: 'json', autoUpload: true, 
			done: function(dd, edata){
				$("#mobile-img-item").attr("src", '/uploaded/si/' + edata.result.files[0].name);
				$("#mobile-img-cont").css("display", "block");
			} 
		});
		
		$("#btnAdd").on("click", function(){
			$("#img-cont").css("display", "none");
			$("#mobile-img-cont").css("display", "none");
			$("#img-item").attr("src", "");
			$("#mobile-img-item").attr("src","");
	    	modal.style.display = "block";
	    	$("#btnSave").css("display", "inline-block");
	    	$("#btnDel").css("display", "none");
	    	populateControls({});
		});

		$(document).on("click", ".a-edit", function(){
			$("#img-cont").css("display", "none");
			$("#mobile-img-cont").css("display", "none");
			var fdat = $(this).data("serid");
			var fitm = $scope.services.filter(function(item){
				if (item._id == fdat)
					return item;
			});
			if (fitm.length) {
				populateControls(fitm[0]);
				$("#img-cont").css("display", "block");
				$("#mobile-img-cont").css("display", "block");
			}
	    	modal.style.display = "block";
	    	$("#btnSave").css("display", "inline-block");
	    	$("#btnDel").css("display", "none");
		});

		$(document).on("click", ".d-edit", function(){
			$("#img-cont").css("display", "none");
			$("#mobile-img-cont").css("display", "none");
			var fdat = $(this).data("serid");
			var fitm = $scope.services.filter(function(item){
				if (item._id == fdat)
					return item;
			});
			if (fitm.length) {
				populateControls(fitm[0]);
				$("#img-cont").css("display", "block");
				$("#mobile-img-cont").css("display", "block");
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
			
			curItem.name = $("#txtName").val();
			curItem.descr = $("#txtDesc").val();
			curItem.image = $("#img-item").attr("src");
			curItem.mobileDecription = $("#mobileTxtDesc").val();
			curItem.mobileImage = $("#mobile-img-item").attr("src");
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