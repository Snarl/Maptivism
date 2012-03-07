var mapConfig = true; // test with if(typeof(mapConfig) != 'undefined')
var highlightIcon;
var tempIcon;
var locationIcon;
var newShadow;

var displayPath;    //Polygon Set
var exitsPath;      //Line Set
var tempLine;       //single exit line
var locations = []; //array of textual representations of points in zone
var exits = []; //array of latlng pairs representing defined exits
var polygonListener;
var tempMarker2;
//Globals(ish) used by Map configuration
var mapListener;
//Globals(ish) used by zone configuration
var showTempMarkerListener;
var latlngs;
var levels = [];
var markers = [];
var encodedString ="";
var encodeLevelsString="";
var selectedMarker = null;


function createMarkerImage(filename){
	return new google.maps.MarkerImage(
	  filename,
	  new google.maps.Size(12,20),
	  new google.maps.Size(6,20)
	);
}

function initialiseMapConfig(){
	highlightIcon = createMarkerImage("./images/mm_20_yellow.png");
	tempIcon      = createMarkerImage("./images/mm_20_green.png");
	locationIcon  = createMarkerImage("./images/mm_20_blue.png");
	newShadow = new google.maps.MarkerImage(
	  "./images/mm_20_shadow.png",
	  new google.maps.Size(22,20),
	  new google.maps.Point(13,13)
	);

  tempMarker.setOptions({
    icon: tempIcon,
    shadow: newShadow,
    draggable: true
  });
  tempMarker2 = new google.maps.Marker(); 
  tempMarker2.setOptions({
    icon: tempIcon,
    shadow: newShadow,
    draggable: true
  });
  
  latlngs = new google.maps.MVCArray();

  showTempMarkerListener=google.maps.event.addListener(map, "click", showTempMarker);

  displayPath = new google.maps.Polygon({
	map: map,
	strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    path: latlngs
  })
  exitsPath = new google.maps.Polygon({
	map: map,
	strokeColor: "#FFFF00",
    strokeOpacity: 1.0,
    strokeWeight: 8,
    paths: exits
  })
}
/** Functions Initiated by Listeners **/

function showTempMarker(e) {

  tempMarker.setPosition(e.latLng);
  curLat = e.latLng.lat();
  curLong = e.latLng.lng();

  google.maps.event.addListener(tempMarker, "drag", function() {
	curLat = e.latLng.lat();
	curLong = e.latLng.lng();
  });

  tempMarker.setMap(map);
}
