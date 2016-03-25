var clientObject  = function() {
	var curItem = undefined, appscope;
	var modal = document.getElementById('clientModal');
	var span = document.getElementsByClassName("close")[1];
	var btnCan = document.getElementById("btnCancelClient");

	span.onclick = function() {
		curItem = undefined;
		$("#merrrClient").text("");
		$("#errrClient").text("");
	    modal.style.display = "none";
	}
	btnCan.onclick = function() {
		curItem = undefined;
		$("#merrrClient").text("");
		$("#errrClient").text("");
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
			$("#txtNameClient").val(item.name);
			$("#txtDescClient").val(item.descr);
			$("#txtKeyClient").val(item.webkey);
			$(".chk-ser").prop("checked", false);
			(item.services || []).forEach(function(item){
				$(".chk-ser[data-serid='" + item + "']").prop("checked", true);
			});
		}

		$("#btnAddClient").on("click", function(){
	    	modal.style.display = "block";
	    	$("#btnSaveClient").css("display", "inline-block");
	    	$("#btnDelClient").css("display", "none");
	    	populateControls({});
		});

		$(document).on("click", ".a-editClient", function(){
			var fdat = $(this).data("serid");
			var fitm = $scope.clients.filter(function(item){
				if (item._id == fdat)
					return item;
			});
			if (fitm.length) {
				populateControls(fitm[0]);
			}
	    	modal.style.display = "block";
	    	$("#btnSaveClient").css("display", "inline-block");
	    	$("#btnDelClient").css("display", "none");
		});

		$(document).on("click", ".d-editClient", function(){
			var fdat = $(this).data("serid");
			var fitm = $scope.clients.filter(function(item){
				if (item._id == fdat)
					return item;
			});
			if (fitm.length) {
				populateControls(fitm[0]);
			}
	    	modal.style.display = "block";
	    	$("#btnSaveClient").css("display", "none");
	    	$("#btnDelClient").css("display", "inline-block");
		});

		$("#btnSaveClient").on("click", function(){
			$("#errrClient").text("");
			$("#merrrClient").text("");
			if (!$("#txtNameClient").val()){
				$("#merrrClient").text("Enter Name");
				return;
			}
			if (!$("#txtDescClient").val()){
				$("#merrrClient").text("Enter  Description");
				return;
			}
			if (!$("#txtKeyClient").val()){
				$("#merrrClient").text("Generate  Key");
				return;
			}
			
			
			curItem.name = $("#txtNameClient").val();
			curItem.descr = $("#txtDescClient").val();
			curItem.webkey = $("#txtKeyClient").val();
			curItem.services = [];
			$(".chk-ser").each(function(){
				if ($(this).is(":checked")){
					curItem.services.push($(this).data("serid"));
				}
			});
			
			if (curItem._id){
				ajaxCall("/endpoint/clients/update", function(data){
					replace(curItem);
					modal.style.display = "none";
				});
			} else {
				ajaxCall("/endpoint/clients/insert", function(data){
					add(data);
					modal.style.display = "none";
				});
			}
		});

		$("#btnDelClient").on("click", function(){
			if (curItem._id) {
				ajaxCall("/endpoint/clients/delete", function(data) {
					remove(curItem);
					modal.style.display = "none";
				});
			}
		});

		$("#btnKeyRegen").on("click", function(){
			ajaxCall("/endpoint/clients/regen", function(data) {
				$("#txtKeyClient").val(data);
			});
		});

		var ajaxCall = function(url, callback) {
			if (curItem) delete curItem.$$hashKey;
			var request = $.ajax({
		        url: url,
		        type: "POST",
		        data: JSON.stringify(curItem),
		        contentType: "application/json; charset=UTF-8"
		    });

		    request.success(function(result) {
		        if (callback){
		        	callback(result);
		        }
		    });
		    request.fail(function(jqXHR, textStatus) {
		        $("#errrClient").text("errored...")
		    });
		}
	
		$scope.clients = [];

		$scope.getservices = function(){
			return serviceObject.getservices();
		}

		$scope.current = curItem;

		var add =  function(itm) {
        	$scope.clients.push(itm);
        	$scope.$apply();
    	};

    	var replace =  function(itm) {
        	var lst = $scope.clients.filter(function(item){
				if (item._id == itm._id)
					return item;
			});
			lst.forEach(function(itmm){
				var idx = $scope.clients.indexOf(itmm);
				$scope.clients.splice(idx, 1);
			});
			add(itm);
    	};

    	var remove = function(itm) {
    		var lst = $scope.clients.filter(function(item){
				if (item._id == itm._id)
					return item;
			});
			lst.forEach(function(itmm){
				var idx = $scope.clients.indexOf(itmm);
				$scope.clients.splice(idx, 1);
			});
			$scope.$apply();
    	}

    	ajaxCall("/endpoint/clients/getclients", function(data){
			data.forEach(function(item){
				add(item);
			});
		});
	} // scopeFunction complete

	serviceObject.getApp().controller('clientController', scopeFunction);

	return {
		
	}
}();