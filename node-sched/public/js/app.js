jQuery(document).ready(function(){
    var days;
    var activeDay = "apptcnt1";
    var appointmentCount = [0, 0, 0, 0, 0, 0, 0];
    var dayProgressValue = [0, 0, 0, 0, 0, 0, 0];
    var daysOrder = ["", "", "", "", "", "", ""];
    var selectedDate = moment(new Date()).format("YYYY-MM-DD"), tline, $sc, selectedAppt;
    var openModal = function(date, idx, predata){
        $("#sHead").text(optdata.rows[idx].title);
        if (date){
            $("#startTime").val(date);
            $("#endTime").val($sc.formatTime($sc.calcStringTime(date) + optdata.defaultDuration));
        }
        $("#apName").val("");
        $("#apEmail").val("");
        $("#apMobile").val("");
        $("#apDet").val("");
        $("#ress-avail").html("");
        $("#ress-headd").css("display", "none");
        $("#id-err").html("");
        //$('.pop_up').fadeIn();
        //$('.shadow').fadeIn();
    }

    $('.slider li').on('click',function(e) {
        //var scdat = optdata.rows[$(this).find(".spl_title").data("que-idx")];
        //$("#sHead").text(scdat.title);
        //$("#ress-avail").html("");
        //$("#ress-headd").css("display", "none");
        /*(scdat.resources || []).forEach(function(item, idx){
            $("#ress-headd").css("display", "block");
            var htm = '<li> \
                    <figure><img class="img-res" src="/static/images/doctor-1.png"></figure> \
                    <span id="head-res">Doctor A</span> \
                </li>';
            var $htm = $(htm);
            $htm.find("#head-res").text(item.title);
            $htm.find(".img-res").attr("src", (item.url || "/static/images/doctor-1.png"));
            $("#ress-avail").append($htm);
        });*/
        //$('.pop_up').fadeIn();
        //$('.shadow').fadeIn();
        openModal(undefined, $(this).find(".spl_title").data("que-idx"));
    });

    var optdata = {
        startTime: "07:00", // schedule start time(HH:ii)
        endTime: "21:00",   // schedule end time(HH:ii)
        widthTime:60 * 10,  // cell timestamp example 10 minutes
        timeLineY:60,       // height(px)
        verticalScrollbar:20,   // scrollbar (px)
        timeLineBorder:2,   // border(top and bottom)
        debug:"#debug",     // debug string output elements
        overlap: true,
        overlapCount: 10,
        allowCustom: true,
        autoAcknowledge: true,
        defaultDuration: 30,
        rows : [],
        change: function(node,data){
            //console.log("change event");
        },
        init_data: function(node,data){
        	//console.log('init_data');
        },
        click: function(node,data){
            //console.log("click event");
        },
        dblclick: function(node,data){
            if (optdata.allowed != "1"){
                return;
            }
            //console.log("dbl click event");
            $("#sHead").text(optdata.rows[0].title);
            $('body').gblightbx();
            imgsrc = $(".logo a img").attr("src");
            $("#popupimg").attr("src", imgsrc);
            selectedAppt = data;
            selectedAppt._id = node.data("sc_data")._id;
            $("#startTime").val($sc.formatTime(data.start));
            $("#endTime").val($sc.formatTime(data.end));
            $("#txtDeta").val(data.text);
            if (data.data){
                $("#apName").val(data.data.name);
                $("#apEmail").val(data.data.email);
                $("#apDet").val(data.data.details);
                if(data.data.mobile){
                    var mobileNumber = data.data.mobile;
                    var temp = '('+mobileNumber.substring(0,3)+') '+mobileNumber.substring(3,6)+'-'+mobileNumber.substring(6,10);
                    $("#apMobile").val(temp);
                }else{
                    $("#apMobile").val(data.data.mobile);
                }
            }
            $("#ress-avail").html("");
            $("#ress-headd").css("display", "none");
            $("#id-err").html("");
            tline = data.timeline;
            if($("#autoAcknowledge").text() == "true"){
                $("#confirmAppId").attr('disabled', 'disabled');
            }
            
            if(data.confirm){
                $("#confirmAppId").prop("checked", true);
            }else{
                $("#confirmAppId").prop("checked", false);
            }

            //$('.pop_up').fadeIn();
            //$('.shadow').fadeIn();
            //openModal(undefined, 2, data);
            //$('body').gblightbx();
        },
        append: function(node,data){
            //console.log("append event.");
        },
        time_click: function(time,data){
            //console.log("time click event");
            $('body').gblightbx();
            if(!$("#admin").text()){
                $("#confirmationId").hide();
            }

            if($("#autoAcknowledge").text() == "true"){
                $("#confirmAppId").prop('checked', true);
                $("#confirmAppId").attr('disabled', 'disabled');
            }
            $("#popupimg").attr("src",$(".logo a img").attr("src"));
            /*(optdata.rows[tline].resources || []).forEach(function(item, idx){
                $("#ress-headd").css("display", "block");
                var htm = '<li> \
                        <figure><img class="img-res" src="/static/images/doctor-1.png"></figure> \
                        <span id="head-res">Doctor A</span> \
                    </li>';
                var $htm = $(htm);
                $htm.find("#head-res").text(item.title);
                $htm.find(".img-res").attr("src", (item.url || "/static/images/doctor-1.png"));
                $("#ress-avail").append($htm);
            });*/
            tline = $(time).data("timeline");
            selectedAppt = undefined;
            openModal(data, tline);
        },
        time_dblclick: function(time,data){
            //console.log("time dblclick event");
        }
    };

    //var $sc = jQuery("#schedule").timeSchedule(optdata);

    var validateOverlap = function(){
        var cc = $sc.checkOverlapCount(tline);
        
        if (!optdata.overlap && cc > 0){
            $("#id-err").html("<b>Overlap not allowed..</b>");
            return false;
        }
        if(selectedAppt){
            if (optdata.overlap && optdata.overlapCount && (cc > optdata.overlapCount)){
                $("#id-err").html("<b>Overlap count increased.. Choose other timings</b>");
                return false;
            }
        }else{
            if (optdata.overlap && optdata.overlapCount && (cc == optdata.overlapCount)){
                $("#id-err").html("<b>Overlap count increased.. Choose other timings</b>");
                return false;
            }
        }
        
        return true;
    }

    var validateDaysCount = function(){
        var cc = $sc.checkOverlapCount(tline);
        
        if (!optdata.overlap && cc > 0){
            $("#id-err").html("<b>Overlap not allowed..</b>");
            return false;
        }
        return true;
    }

	$(document).on("LordJesus", function(){
		schData.Name.schedule.push(bdata);
		$sc = jQuery("#schedule").timeSchedule(optdata);
	});

    $("#aptSubmit").on("click", function(){
        $("#id-err").html("");
        
        var s = $sc.calcStringTime($("#startTime").val());
        var e = $sc.calcStringTime($("#endTime").val());
        
        if (selectedAppt){
            if (!validateOverlap()){
                return;
            }
            if (optdata.contactMandatory){
                if (!$("#apName").val()){
                    $("#id-err").html("<b>name is mandatory</b>");
                    return;
                }
                if ($("#apMobile").val().length != 14){
                    $("#id-err").html("<b>mobile is mandatory</b>");
                    return;
                }
                if (!$("#apEmail").val()){
                    $("#id-err").html("<b>email is mandatory</b>");
                    return;
                }
            }
            var data = {};
            selectedAppt["timeline"] = tline;
            selectedAppt["start"] = s;
            selectedAppt["end"] = e;
            selectedAppt["startTime"] = $("#startTime").val();
            selectedAppt["endTime"] = $("#endTime").val();
            selectedAppt["text"] = $("#apDet").val();
            selectedAppt["autoAcknowledge"] = optdata.autoAcknowledge;
            if($("#confirmAppId").is(":checked")){
                selectedAppt.confirm = true;
                $("." + selectedAppt.uniqueid).css("background-color", "green");
            }else{
                selectedAppt.confirm = false;
                $("." + selectedAppt.uniqueid).css("background-color", "rgba(255, 0, 0, 0.33)");
            }

            selectedAppt["data"] = {};
            selectedAppt.data.name = $("#apName").val();
            selectedAppt.data.email = $("#apEmail").val();
            if($("#apMobile").val().length == 14){
                var mobileNumber = $("#apMobile").val();
                selectedAppt.data.mobile = mobileNumber.substring(1,4)+mobileNumber.substring(6,9)+mobileNumber.substring(10,14);
            }else{
                $("#apMobile").val("")
                selectedAppt.data.mobile = "";
            }
            selectedAppt.data.details = $("#apDet").val();
            selectedAppt.data.resources = [];
            $sc.editScheduleData(selectedAppt);
            ajaxCall("update", selectedAppt);
        }
        else{
            var temp = Number(activeDay.substring(7,activeDay.length)-1);
            if(appointmentCount[temp] == optdata.perdayCapacity){
                $("#id-err").html("<b>Limit for the Day Reached. Try for other Day.</b>");
                return false;
            }
            
            if (!validateOverlap()){
                return;
            }
            if (optdata.contactMandatory){
                if (!$("#apName").val()){
                    $("#id-err").html("<b>name is mandatory</b>");
                    return;
                }
                if ($("#apMobile").val().length != 14){
                    $("#id-err").html("<b>mobile is mandatory</b>");
                    return;
                }
                if (!$("#apEmail").val()){
                    $("#id-err").html("<b>email is mandatory</b>");
                    return;
                }
            }
            var data = {};
            data["timeline"] = tline;
            data["start"] = s;
            data["end"] = e;
            data["startTime"] = $("#startTime").val();
            data["endTime"] = $("#endTime").val();
            data["text"] = $("#apDet").val();
            data["autoAcknowledge"] = optdata.autoAcknowledge;
            data["data"] = {};
            data.data.name = $("#apName").val();
            data.data.email = $("#apEmail").val();
            if($("#apMobile").val().length == 14){
                var mobileNumber = $("#apMobile").val();
                data.data.mobile = mobileNumber.substring(1,4)+mobileNumber.substring(6,9)+mobileNumber.substring(10,14);
            }else{
                $("#apMobile").val("");
                data.data.mobile = "";
            }
            data.data.details = $("#apDet").val();
            data.data.resources = [];
            $sc.addScheduleData({data:data});
            
            if($("#confirmAppId").is(":checked")){
                data.confirm = true;
                $("." + data.uniqueid).css("background-color", "green");
            }else{
                data.confirm = false;
                $("." + data.uniqueid).css("background-color", "rgba(255, 0, 0, 0.33)");
            }
            ajaxCall("insert", data);
            dayProgressValue[temp] += 1;
            appointmentCount[temp] = dayProgressValue[temp];
            var appointmentpercentage = ((appointmentCount[temp]/optdata.perdayCapacity)*100);
            $("#"+activeDay).attr("class", "num-1 progress-radial "+daysOrder[temp]+" progress-"+appointmentpercentage.toFixed(0));
            $("#"+activeDay).find(".overlay").text(dayProgressValue[temp]);
        }
        $sc.resetBarPosition(tline);
        $('.close_btn').trigger("click"); 
    });

    var bdwid, bdhgt;
    $(document).on("mouseenter", ".sc_Bar", function(){
        var bd = $(this);
        bdwid = bd.width();
        bdhgt = bd.height();
        var dt = bd.data("sc_data");
        if(bdwid > 100){
            bdwid = 75;
            bdhgt = 60;
        }
        bd.animate( { 
            "width": (bdwid + 100) + 'px',
            "height": (bdhgt + 50) + 'px',
        });
    });

    $(document).on("mouseleave", ".sc_Bar", function(){
        var bd = $(this);
        var dt = bd.data("sc_data");
        bd.stop( true, true ).animate( { 
            "width": bdwid,
            "height": bdhgt
        });
    });

    var ajaxCall = function(action, data, callback){
        var bb = {
            action: action,
            selecteddate: selectedDate,
            subdomain: $("#compTbl").text(), 
            data: data
        }
        $.ajax({
            //url: "http://landing.que.one/endpoint/ccreate",
            url: "/endpoint/" + action,
            type: "POST",
            data: JSON.stringify(bb),
            contentType: "application/json; charset=UTF-8",
            success: function(result) {
                if (callback){
                    callback(result);
                }else{
                    if(action == "insert"){
                        socketio.emit("newAppointment", result);
                    }else if(action == "update"){
                        socketio.emit("updateAppointment", result);
                    }
                }
            },
            fail: function(jqXHR, textStatus) {
                $("#alert-pop").text('Errored: ' + textStatus);
            }
        });

        /*request.success(function(result) {
            console.log(result);
            if (callback){
                callback(result);
            }
        }); 
        request.fail(function(jqXHR, textStatus) {
            $("#alert-pop").text('Errored: ' + textStatus);
        }); */
    }

    var populateWdayText = function (result) {
        days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var now = new Date();
        //var now = new Date(2015, 11, 28);  - for dec 2015
        var day = now.getDay();
        var tddt = now.getDate();
        var tdm = (now.getMonth() + 1);
        var dt = new Date(now.getFullYear(), now.getMonth(), 0);
        var monthDays = dt.getDate();
        var mmtdt = selectedDate;
        for (i = 0; i < 7; i++) {
            var tdd = days[day];
            //$("#apptcnt" + (i + 1)).addClass(tdd.toLowerCase()).data("selected-date", mmtdt).data("selected-day", tdd).data("date-format", moment(mmtdt).add(1, 'd').format("YYYY-MM-DD"));
            daysOrder[i] = tdd.toLowerCase();
            $("#apptcnt" + (i + 1)).attr("class", "num-1 progress-radial " +  tdd.toLowerCase() + " progress-0").data("selected-date", mmtdt).data("selected-day", tdd).data("date-format", moment(mmtdt).add(0, 'd').format("YYYY-MM-DD"));
            $("#apptcnt" + (i + 1)).find(".overlay").text("0");
            result.forEach(function(item){
                if (item._id == mmtdt){
                    appointmentCount[i] = (item["count"] || 0);
                    var appointmentpercentage = ((appointmentCount[i]/optdata.perdayCapacity)*100);
                    $("#apptcnt" + (i + 1)).removeClass("progress-0").addClass("progress-" + appointmentpercentage.toFixed(0));
                    $("#apptcnt" + (i + 1)).find(".overlay").text((item["count"] || 0));
                    dayProgressValue[i] = (item["count"] || 0);
                    return false;
                }
            });

            mmtdt = moment(mmtdt).add(1, 'd').format("YYYY-MM-DD");
            tdd = tdd + ' <br> (' + (tdm) + '/' + (tddt) + ')';
            $("#wday" + (i + 1)).html(tdd);
            day = day + 1;
            tddt = tddt + 1;
            //tdm = tdm + 1;
            if (day > 6) {
                day = 0;
            }
            if (tddt > monthDays) {
                tddt = 1;
                tdm = tdm + 1;
                if (tdm == 13){
                    tdm = 1;
                }
            }
        }
        $("#apptcnt1").trigger("click");
        $("#wday1").css("color","#f57832");
        ajaxCall("getappts", {}, getApptsAck);
    };

    $(document).on("click", ".num-1", function(){
        var colors = ["#f57832","#59ABE3","#0a5780","#f49583","#ff6347","#ea4c89","#fa565a"];
        var day = activeDay.substring(7,activeDay.length);
        $("#wday"+day).css("font-weight","400");
        $("#wday"+day).css("color","#000");
        activeDay = $(this).closest('li').find('.progress-radial').attr('id');
        day = activeDay.substring(7,activeDay.length);
        $("#wday"+day).css("font-weight","600");
        $("#wday"+day).css("color",colors[day-1]);
        $("#selDispl").text($(this).data("selected-day") + ' (' + moment($(this).data("selected-date")).format('MM-DD-YYYY') + ')');
        $(".dayheading").css("color",colors[day-1]);
        if (selectedDate == $(this).data("selected-date")){
            //console.log("good..");
        } else {
            selectedDate = $(this).data("selected-date");
            ajaxCall("getappts", {}, getApptsAck);
        }
    });

    var clockInit = function(){
        $("#startTime").clockpicker({
            donetext: 'Done',
            afterDone: function(e1, e2){
                if (!optdata.allowCustom){
                    $("#endTime").val($sc.formatTime($sc.calcStringTime($("#startTime").val()) + optdata.defaultDuration));
                }
                validateOverlap();
            }
        });

        if (optdata.allowCustom){
            $("#endTime").clockpicker({
            donetext: 'Done',
            afterDone: function(e1, e2){
                validateOverlap();
            }
        });
        }
    }

    var getApptsAck = function(result){
        $(".sc_Bar").remove();
        (result || []).forEach(function(item) {
            $sc.addScheduleData(item);
            $sc.resetBarPosition(item.data.timeline);
        });
    }

    var getresourcesAck = function(result){
        var schData = [];
        (result.specialities || []).forEach(function(item, idx){
            var tt = {
                title: item.name,
                mins: item.mins,
                url: item.icon,
                resources: []
            };
            (item.resources || []).forEach(function(item1, idx1){
                tt.resources.push({
                    title: item1.name,
                    mins: item1.mins,
                    url: item1.icon
                });
            });
            schData.push(tt);
        });
        optdata.rows = schData;
        optdata.startTime = (result.startHour || optdata.startTime);
        optdata.endTime = (result.endHour || optdata.endTime);
        optdata.overlap = result.overlap;
        optdata.overlapCount = result.concurrentCount;
        optdata.allowCustom = result.allowCustom;
        optdata.autoAcknowledge =  result.autoAcknowledge;
        optdata.defaultDuration = (result.defaultDuration || optdata.defaultDuration) * 60;
        optdata.contactMandatory = result.contactMandatory;
        optdata.allowed = $("#_allowid").val();
        optdata.perdayCapacity = result.perdayCapacity;
        $sc = jQuery("#schedule").timeSchedule(optdata);
        clockInit();
    }

    $("#apMobile").on("keypress",function(evt){
        var charCode = (evt.which) ? evt.which : evt.keyCode;
          if (charCode != 46 && charCode > 31 
            && (charCode < 48 || charCode > 57))
             return false;

        if($("#apMobile").val().length < 14){
            var key = evt.charCode || evt.keyCode || 0;
            var $phone = $("#apMobile");

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
    });

    ajaxCall("getresources", {}, getresourcesAck);
    ajaxCall("getcounts", {}, populateWdayText);

    var socketio = io.connect("http://49.206.64.209:8083");

    var room = $("#compTbl").text();

    socketio.on('connect', function () {
        socketio.emit('room', room);

        socketio.on('newAppointment', function(message) {
            var newDate = new Date(message.selecteddate);
            for(var i = 0; i < daysOrder.length; i++){
                if(daysOrder[i] == days[newDate.getDay()].toLowerCase()){
                    break;
                }
            }

            dayProgressValue[i] += 1;
            appointmentCount[i] = dayProgressValue[i];
            var appointmentpercentage = ((appointmentCount[i]/optdata.perdayCapacity)*100);
            $("#apptcnt"+(i+1)).attr("class", "num-1 progress-radial "+days[newDate.getDay()].toLowerCase()+" progress-"+appointmentpercentage.toFixed(0));
            $("#apptcnt"+(i+1)).find(".overlay").text(dayProgressValue[Number(i)]);
            
            if(Number(activeDay.substring(7, activeDay.length)) == Number(i+1)){
                $sc.addScheduleData(message);
                $sc.resetBarPosition(message.data.timeline);
            }
        });

        socketio.on('updateAppointment', function(message) {
            message.data._id = message._id;
            $sc.editScheduleData(message.data);
            $sc.resetBarPosition(message.data.timeline);
        });
    });
});