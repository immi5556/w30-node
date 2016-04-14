// JavaScript source code
var ss = document.getElementById("uploadBtn");
	 $(ss).change(function () {
     	document.getElementById("uploadFile").value = this.value;
	 });

	 $(function(){
		 $('.tabContent h2').on('click',function(){
			 $(this).toggleClass('active');
			 $(this).next('div').slideToggle();
		 });
	 })