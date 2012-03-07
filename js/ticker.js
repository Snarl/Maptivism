<?php

include("../../sukey/api/apiParams.php");

?>var itemtime = <?php echo $itemtime; ?>;

function getTickerRSS(){
	jQuery.ajax({
		url: "/sukey/api/announcementRSS.php",
		success: function(data){
			var anns = [];
			jQuery(data).find('atom\\:entry > atom\\:title').each(function(i, x){
				anns.push(jQuery(x).text());
			});
			ticker(anns,0);
		}
	});
}

function ticker(list,num){
	if(num >= list.length){
		getTickerRSS();
	}else{
		jQuery("#ticker").animate( { opacity: 0 }, 500, function() { jQuery(this).text(list[num]) })
			.animate( { opacity: 1 }, 500, function() { setTimeout(function() { ticker(list, num+1) }, itemtime) });
	}
}

jQuery(document).ready(getTickerRSS());
