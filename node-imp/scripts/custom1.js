function fieldAnim(){
  $('.fieldAnim').on('focus',function(){
    $(this).closest('.form-control').addClass('focus');
  })
  $('.fieldAnim').each(function(){
    if($(this).val().length > 0){
      $(this).closest('.form-control').addClass('focus');
    }else {
      $(this).closest('.form-control').removeClass('focus');
    }
  })
  $('.fieldAnim').on('blur',function(){
    if($(this).val().length > 0){
      $(this).closest('.form-control').addClass('focus');
    }else {
      $(this).closest('.form-control').removeClass('focus');
    }
  })
}

fieldAnim();

$(window).scroll(function(){
  if ($(this).scrollTop() > 500) {
    $('.toBottom').fadeIn();
  } else {
    $('.toBottom').fadeOut();
  }
});

$('.toTop ').click(function(){
  $("html, body").animate({ scrollTop: 600 }, 600);
  return false;
});
$('.toBottom').click(function(){
  $('html,body').animate({scrollTop: $(document).height()}, 600);
  return false;
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

$("#cntcSubmit").on("click", function(){
  
  if (!$("#cntcName").val()){
    
    $("#cntcName").css({
      'border-color': 'red'
    });

    return;
  }
  if (!$("#cntcEmail").val() || !isValidEmailAddress($("#cntcEmail").val())){
    
    $("#cntcEmail").css({
      'border-color': 'red'
    });

    return;
  }
  if (!$("#cntcMsg").val()){
    
    $("#cntcMsg").css({
      'border-color': 'red'
    });

    return;
  }
  var request = $.ajax({
          //url: "http://landing.que.one/endpoint/ccreate",
          //url: "http://49.206.64.209:9095/endpoint/ccreate",
          url: "http://localhost:9095/endpoint/contactUs",
          //url: "/endpoint/ccreate",
          type: "POST",
          data: JSON.stringify({
              regis : { 
                name : $("#cntcName").val(), 
                email: $("#cntcEmail").val(),
                mobile : $("#cntcCell").val(), 
                message: $("#cntcMsg").val(),
              }
          }),
          contentType: "application/json; charset=UTF-8"
      });

      request.success(function(result) {
        $("#cntcResult").text("Successfully sent a mail to Admin.");
        $("#cntcResult").css("color","green");
      });
      request.fail(function(jqXHR, textStatus) {
        $("#cntcResult").text("Failed to mail.");
        $("#cntcResult").css("color","red");
      });
});

function isValidEmailAddress(emailAddress) {
  var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
  return pattern.test(emailAddress);
};


window.onscroll = function(e){

  if(document.body.scrollTop > 50 || document.documentElement.scrollTop > 50 ){
    document.getElementsByTagName('header')[0].className = 'scrollFixed';
  }else {
    document.getElementsByTagName('header')[0].className = '';
  } 

}

$(window).on('resize',function(){
  if($('.mb_menu').is(':visible')){
    $('nav').hide();
  }else {
    $('nav').show();
  }
})
$(window).resize();

$('.mb_menu').on('click',function(){
  if(!$('nav').is(':visible')){
    $('nav').slideDown();
  }else {
    $('nav').slideUp();
  }
});