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
      var $this = $(this);
      if(set.myDataCallback.length > 8){
        var next = $('<span class="rightArrow"></span>'),
        prev = $('<span class="leftArrow"></span>');

        $this.append(prev);
        $this.append(next);
      }
      
      var sliderList = $this.find(set.slideWrap),
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
          var i = 0, j = 0;
          var itemCount = dataItems.length;

          (dataItems || []).forEach(function(item){
            if(i == 8){
              itemCount -= 8;
            }
            if(i == 8){
              i = 0;
            }
            if(j == 2){
              j = 0;
            }
            if(itemCount <= 6){
              if(j == 0){
                checkCustomerType(item, "row1");
              }else{
                checkCustomerType(item, "row2");
              }
              j++;
            }else{
              if(i < 4){
                checkCustomerType(item, "row1");
              }else{
                checkCustomerType(item, "row2");
              }
              i++;
            }
          });
        }else{
          var tt = $('<li style="text-align:center; padding-top:65px;">No Customers in your Range.</li>');
          $('.row1').append(tt);
        }
        
        settings();
      }
      function checkCustomerType(item, row){
        if(item.premium){
          setCorousalListElement(item.logoPath, item.subdomain, item.fullName, item.expectedTime, row, "premium");
        }else if(item.suggest){
          setCorousalListElement(item.logoPath, item.subdomain, item.fullName, item.expectedTime, row, "suggest");
        }else {
          setCorousalListElement(item.logoPath, item.subdomain, item.fullName, item.expectedTime, row, "");
        }
      }

      function setCorousalListElement(logoPath, subdomain, fullName, expectedTime, row, type){
        var imgPath = logoPath.substring(9, logoPath.length);
        imgPath = "content/images/"+imgPath;
        if(type == "premium"){
          var tt = $('<li onclick=getMapView("'+subdomain+'") class="'+subdomain+' listPremium"><span class="ribben"><img src="content/images/premium-tag.png"></span><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+fullName+'"></div><h2>'+fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+expectedTime.toFixed(2)+'</div></div></li>');
        }else if(type == "suggest"){
          var tt = $('<li onclick=getMapView("'+subdomain+'") class="'+subdomain+' listSuggested"><span class="suggest"><img src="content/images/suggested.png"></span><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+fullName+'"></div><h2>'+fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+expectedTime.toFixed(2)+'</div></div></li>');
        }else {
          var tt = $('<li onclick=getMapView("'+subdomain+'") class="'+subdomain+'"><div class="listLogo"><img class="slide1Img" src="'+imgPath+'" alt="'+fullName+'"></div><h2>'+fullName+'</h2><div class="slideCaption"><div class="travelTime">Travel Time (est.) : '+expectedTime.toFixed(2)+'</div></div></li>');
        }
        $(tt).addClass('slide');
        $('.'+row).append(tt);
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
