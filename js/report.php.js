// report.php.js
// Provides functionality for app report form
// SG, 29/01/11

$(document).ready(function(){

	function success_callback(p){
		$('#reportform input[name=lat]').val(p.coords.latitude);
		$('#reportform input[name=lon]').val(p.coords.longitude);
	}

	function error_callback(p){
		return true;
	}

	if(geo_position_js.init()){
		geo_position_js.getCurrentPosition(success_callback,error_callback,{enableHighAccuracy:true});
	}

	var $reportform = $('#reportform');

	$reportform.submit(function(){
		var $result = ($('#result').size()==0)?($("<p id='result'></p>").insertBefore($reportform)):($('#result'));
		$result.slideUp();
		$.ajax({ 
			type: "POST",
			url: "report.php",
			data: {
				report: $('#reportform input[name=report]').val(),
				lat: $('#reportform input[name=lat]').val(),
				lon: $('#reportform input[name=lon]').val()
			},
			success: function(data){
				$result.text(data);
				$result.slideDown();
			}
		});
		return false;
	});

	$('input[type=button]').click(function(){
		history.back(1);
	});

});
