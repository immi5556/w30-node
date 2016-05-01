var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

(function($){
  $.fn.gbCarousel = function(opt){
    var defaults = {
      slideItems:1,
      showItems:2,
      slideItem:'.slide',
      slidePrev:'.leftArrow',
      slideNext:'.rightArrow',
      autoSlide:true,
      slideDelay:2000,
      slideSpeed:700,
      slideWrap:'.sliderWrapper',
      slider:'.slider',
      screen1060Removeitems :1,
      screen960Removeitems :1,
      screen768Removeitems :1,
      premium: null,
      myDataCallback:null

    },
    set = $.extend({},defaults,opt);

    return this.each(function(){
      var $this = $(this),
      sliderList = $this.find(set.slideWrap),
      slideList = sliderList.first().find(set.slideItem),
      marginRight = parseInt(slideList.css("margin-right")),
      slideListFirst = slideList.outerWidth() + marginRight,
      listLength = slideList.length,
      prev = $this.find(set.slidePrev),
      next = $this.find(set.slideNext),
      count = 0,
      slideroverlap = $this.find(set.slider),
      autoCompleted = true,
      scrollCompletd = true,
      timer,
      screenWidth = [1060,960,768],
      wW = (isMobile.any()? screen.width : $(window).width()),
      wH = (isMobile.any()? screen.height : $(window).height()),
      maxSlides = set.showItems,
      dataItems = set.myDataCallback;

      init()

      function init(){

        if(dataItems.length){
          var i = 0;
          (dataItems || []).forEach(function(item){
            if(i < 4){
              if(item.premium){
                var imgPath = item.logoPath.substring(9, item.logoPath.length);
                imgPath = "content/images/"+imgPath;
                var tt = $('<li onclick=getMapView("'+item.subdomain+'") class="'+item.subdomain+' listPremium"><span class="ribben">Sp</span><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+item.fullName+'"></div><h2>'+item.fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+item.expectedTime.toFixed(2)+'</div></div></li>');
                $(tt).addClass('slide');
                $('.row1').append(tt);
              }else if(item.suggest){
                var imgPath = item.logoPath.substring(9, item.logoPath.length);
                imgPath = "content/images/"+imgPath;
                var tt = $('<li onclick=getMapView("'+item.subdomain+'") class="'+item.subdomain+' listSuggested"><span class="suggest"><img src="content/images/suggested.png"></span><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+item.fullName+'"></div><h2>'+item.fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+item.expectedTime.toFixed(2)+'</div></div></li>');
                $(tt).addClass('slide');
                $('.row1').append(tt);
              }else {
                var imgPath = item.logoPath.substring(9, item.logoPath.length);
                imgPath = "content/images/"+imgPath;
                var tt = $('<li onclick=getMapView("'+item.subdomain+'") class="'+item.subdomain+'"><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+item.fullName+'"></div><h2>'+item.fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+item.expectedTime.toFixed(2)+'</div></div></li>');
                $(tt).addClass('slide');
                $('.row1').append(tt);
              }
            }else{
              if(item.premium){
                var imgPath = item.logoPath.substring(9, item.logoPath.length);
                imgPath = "content/images/"+imgPath;
                var tt = $('<li onclick=getMapView("'+item.subdomain+'") class="'+item.subdomain+' listPremium"><span class="ribben">Sp</span><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+item.fullName+'"></div><h2>'+item.fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+item.expectedTime.toFixed(2)+'</div></div></li>');
                $(tt).addClass('slide');
                $('.row2').append(tt);
              }else if(item.suggest){
                var imgPath = item.logoPath.substring(9, item.logoPath.length);
                imgPath = "content/images/"+imgPath;
                var tt = $('<li onclick=getMapView("'+item.subdomain+'") class="'+item.subdomain+' listSuggested"><span class="suggest"><img src="content/images/suggested.png"></span><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+item.fullName+'"></div><h2>'+item.fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+item.expectedTime.toFixed(2)+'</div></div></li>');
                $(tt).addClass('slide');
                $('.row2').append(tt);
              }else {
                var imgPath = item.logoPath.substring(9, item.logoPath.length);
                imgPath = "content/images/"+imgPath;
                var tt = $('<li onclick=getMapView("'+item.subdomain+'") class="'+item.subdomain+'"><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+item.fullName+'"></div><h2>'+item.fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+item.expectedTime.toFixed(2)+'</div></div></li>');
                $(tt).addClass('slide');
                $('.row2').append(tt);
              }
            }
            i++;
            if(i == 8){
              i = 0;
            }
          });
        }else{
          var tt = $('<li style="text-align:center; padding-top:65px;">No Customers in your Range.</li>');
          $('.row1').append(tt);
        }
        
        settings();

      }

      function settings(){

        var itemList = sliderList.first().find('li'),
        marginRight = parseInt(itemList.css("margin-right")),
        slideListFirst = itemList.outerWidth() + marginRight,
        listLength = itemList.length;

        //console.log(itemList)

        slideroverlap.css({
          width: set.showItems * (slideListFirst)
        })

        sliderList.css({
          width: listLength * (slideListFirst)
        })

        next.on('click',function(){
          slideNextAnim(this);
        })
        prev.on('click',function(){
          slidePrevAnim(this);
        })

        autoPlay();
        doResize();


      }


      function slideNextAnim(_this){
        var itemList = sliderList.first().find('li'),
        marginRight = parseInt(itemList.css("margin-right")),
        slideListFirst = itemList.outerWidth() + marginRight,
        listLength = itemList.length;

        if(scrollCompletd){
            autoCompleted = true;
          if(count < (listLength - set.showItems)){
            count += set.slideItems;
            scrollCompletd = false;
            sliderList.animate({left: - (count * slideListFirst)},set.slideSpeed,function(){
              scrollCompletd = true;
            })
          }else {
            count = 0;
            autoCompleted = true;
            sliderList.animate({left: -0});
          }
        }
      }


      function slidePrevAnim(_this){
        var itemList = sliderList.first().find('li'),
        marginRight = parseInt(itemList.css("margin-right")),
        slideListFirst = itemList.outerWidth() + marginRight,
        listLength = itemList.length;

        if(scrollCompletd){
          autoCompleted = false;
          if(count > 0){
            count -= set.slideItems;
            scrollCompletd = false;
            sliderList.animate({left: - (count * slideListFirst)},set.slideSpeed,function(){
              scrollCompletd = true;
            })
          }else {
            count = 0;
            autoCompleted = true;
            sliderList.animate({left: -0});
          }
        }
      }

      function autoPlay(){
        if(set.autoSlide){
          timer = setInterval(function(){
            if(autoCompleted){
              slideNextAnim(next);
            }else {
              slidePrevAnim(prev);
            }
          },set.slideDelay)
        }
      }


      if(isMobile.any()){
        $(window).on('orientationchange',function(){
          doResize()
        })
      }else{
        $(window).on('resize',function(){
					doResize();
				})
      }


      function doResize(){
        wW = (isMobile.any()? screen.width : $(window).width());
        wH = (isMobile.any()? screen.height : $(window).height());

        if(wW > screenWidth[0]){
					set.showItems = maxSlides;
				}
        if(wW <= screenWidth[0]){
          set.showItems = maxSlides - set.screen1060Removeitems;
        }
        if(wW <= screenWidth[1]){
          set.showItems = maxSlides - set.screen960Removeitems;
        }
        if(wW <= screenWidth[2]){
          set.showItems = maxSlides - set.screen768Removeitems;
        }
        slideroverlap.css({
          width: set.showItems * (slideListFirst)
        })

      }
    });
  }
})(jQuery)
