var isDesktop = true;   //test if defined on fone 
var mapname;			//Name of map currently in use
var zones = []; 		//array of polygon arrays defining zones
var map;        		//our map
var zonePolyArray=[];  	//handle to array of polygons
var tempMarker; 		//handle to temporary marker - to indicate protester location
var zonearray=[];  		//array of arrays of latlngs for zones
var curLat;			    //Current position of temp Marker
var curLong;			//Current position of temp Marker

function initialiseGoogleMap(MapDivId) {
  var mapOptions = {
      zoom: 15,
      center: new google.maps.LatLng(51.506,-0.14),
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  map = new google.maps.Map(MapDivId, mapOptions);
  
  tempMarker = new google.maps.Marker(); 
  tempMarker.setOptions({
    draggable: true
  });

  showTempMarkerListener=google.maps.event.addListener(map, "click", showTempMarker);
}


function showTempMarker(e) {
  tempMarker.setPosition(e.latLng);
  tempMarker.setMap(map);
  curLat = e.latLng.lat();
  curLong = e.latLng.lng();
  
  google.maps.event.addListener(tempMarker, "drag", function() {
	curLat = e.latLng.lat();
	curLong = e.latLng.lng();
  });

  if(typeof(phoneDisplay) != 'undefined'){
	  google.maps.event.addListener(tempMarker, "dragEnd", setNewFoneLocation());
	  $url="./api/determinezoneforpoint.php?loc=" + e.latLng.lat() + "," + e.latLng.lng();
		$.ajax({
		   type: "GET",
		   url: $url,
		   success: function(msg){
			 cZone=msg;
			 setNewFoneLocation(e.latLng.lat(), e.latLng.lng());
		   }
		 });
	}
}






function loadProtestMap(mapname){
	$url = "./api/mapfetch.php?map=" + mapname;
	//create array of zones
	$.ajax({
	type: "GET",
	url: $url,
	async: false,
	success: function(xml){
		zonearray.length=0;
		//alert(xml);
		  zones.length=0;
		  //parse message into path structure
		  //alert(xml);
		  $(xml).find("zone").each(function()
		  {
			var tempZone=[];   //temp array of latlngs for zone under construction;
			//alert ("Processing Zone:" +  $(this).attr('name'));
			$(this).find("node").each(function()
			{
				tempZone.push(new google.maps.LatLng($(this).attr('lat'),$(this).attr('lon')) );
			});			
		    zonearray.push(tempZone);
		  });
		  setpaths(zonearray, "#0000FF", true);
	  }
	});
 
}

function setpaths(arrZone, fillcolor, clear){
	if (clear){
		for (var i=0; i< zonePolyArray.length; i++){
			zonePolyArray[i].setMap();
		}
		zonePolyArray.length=0;
	}	
	for(var i=0; i < arrZone.length; i++){
			  //alert ("drawing zone " + (i+1) + " with " + zonearray[i].length + " nodes");
			  //alert (dump(arrZone[i]));
			  zonePolyArray.push(
			  new google.maps.Polygon({
				clickable: false,
				path: arrZone[i], 
				strokeColor: fillcolor,
				strokeOpacity: 0.5,
				strokeWeight: 2,
				fillColor: fillcolor,
				fillOpacity: 0.2
			  }));
			  zonePolyArray[zonePolyArray.length -1].setMap(map);
			  
	}
} 
