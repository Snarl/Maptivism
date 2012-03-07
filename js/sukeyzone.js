function zone(id,googlemap, zoneColor, zoneFill, zoneOpac, hoverColor, hoverFill, hoverOpac, selectedColor, selectedFill, selectedOpac){
	//Private Member Variables
		var debugdiv;
		var polygon; 		//Polygon Handle
		var markers = [];	//Array of Marker Handles
		var latlngs;		// contains an MVC array of points describing polygon path
		var zoneName; 		//Name of Zone
		var fnClick = function(){};  //Callback function for Click;
		var gMap = null;
		var sColor = null;
		var fColor = null;
		var id;				//ID of this zone for external use;
		var amSelected = false;
		var zColor = "#FFFFFF";
		var zFill  = "#FFFFFF";
		var zOpac  = 0.3;
		var hColor = "#000000";
		var hFill  = "#000090";
		var hOpac  = 0.5;
		var sColor = "#000000";
		var sFill  = "#0000FF";
		var sOpac  = 0.3;
		var changed = false;
		var curNode;		//index of current node within latlngs array;
		var listeners=[];
		var exits=[];

    //Construction
		setGMap(googlemap);
		setStrokeColor(zoneColor);
		setFillColor(zoneFill);
		setFillOpac(zoneOpac);
		setHoverStroke(hoverColor);
		setHoverFill(hoverFill);
		setHoverOpac(hoverOpac);
		setSelectedStroke(selectedColor);
		setSelectedFill(selectedFill);
		setSelectedOpac(selectedOpac);
		setId(id);
		latlngs = new google.maps.MVCArray();
		debugdiv = document.getElementById('debug');
		this.zoneName="";

	//Public Methods
		this.activateListeners = activateListeners;
		this.displayZone = displayZone; //with bool 
		this.loadZoneFromAPI = loadZoneFromAPI;
		this.clear = clear;
		this.saveZone = saveZone;
		this.showNodeMarkers = showNodeMarkers;
		this.onClick = onClick;
		this.getName = getName;
		this.selected = selected;
		this.isChanged = getisChanged;
		this.zoomTo = zoomTo;
		this.initZone = initZone;
		this.getId = getId;
		this.extendPath = extendPath;
		this.isSelected = isSelected;

	//Publically addressable methods
		function displayZone(sw){
			if (sw){
				polygon.setMap(Gmap);
			} else {
				polygon.setMap();				
			}
		}
		
		function loadZoneFromAPI(zn){
			clear();
			zoneName = zn;
			$.get("./api/zonefetch.php",{'r':zn},
			function(xml) {
				if ($(xml).find('zone').length == 0){
					alert ("Error:\n" + xml);
				} else {		
					$(xml).find('node').each(function(){
						var lat = parseFloat($(this).attr('lat'));
						var lon = parseFloat($(this).attr('lon'));
						addNode(lat, lon);				
					});
				
					$(xml).find('zone').each(function(){
						setName($(this).attr('name'));
						var swLatLng = new google.maps.LatLng($(this).attr('lat1'), $(this).attr('lng1') );
						var neLatLng = new google.maps.LatLng($(this).attr('lat2'), $(this).attr('lng2') );
						var bounds = new google.maps.LatLngBounds(swLatLng, neLatLng);
						//gMap.fitBounds(bounds); 
						$(this).find('exit').each(function(){
							exits.push($(this).attr('name'));
						});
					});
					polygon = new google.maps.Polygon({
						strokeColor: zColor,
						fillColor: zFill,
						fillOpacity: zOpac,
						strokeOpacity: 0.2,
						strokeWeight: 1,
						zIndex:1,
						path: latlngs,
						clickable : false
					})
					polygon.setMap(gMap);
					changed=false;
					//startListeners();
				}
			});
		}
		function activateListeners(switchOn){
			if (switchOn){startListeners();
			} else {clearListeners();}
		}
		function startListeners(){
				//alert ("starting listeners");
					polygon.setOptions({clickable:true});
					if (listeners.length > 0) return;
					listeners.push(google.maps.event.addListener(polygon, 'click', 
					    function() {
							fireClick(this);
						}));
					listeners.push(google.maps.event.addListener(polygon, 'mouseover', 
					    function() {
							if (!amSelected){polygon.setOptions({strokeColor:hColor, fillColor:hFill, fillOpacity:hOpac})};
						}));
					listeners.push(google.maps.event.addListener(polygon, 'mouseout', 
					    function() {
							if (amSelected){
								polygon.setOptions({strokeColor:sColor, fillColor:sFill, fillOpacity:sOpac});
							} else {
								polygon.setOptions({strokeColor:zColor, fillColor:zFill, fillOpacity:zOpac});
							}
						}));
 
		}
		
		function clearListeners(){
			while (listeners.length > 0){
				google.maps.event.removeListener(listeners.pop());
			}
			polygon.setOptions({clickable:false});
		}
		function clear(){
			//remove all structures;
			//checkForSave();
			if (polygon) {
				clearListeners();
				polygon.setMap();
			}
			for (var i=0; i < markers.length; i++){
				markers[i].setMap();
			}
			latlngs.clear();
			markers.length = 0;	
		}
		function addNode(lat, lng){
			var newLocation = new google.maps.LatLng(lat, lng);
			latlngs.insertAt(latlngs.getLength(), newLocation);
			//latlngs.push(newLocation);
		}
		function extendPath(){
			//alert("extending Path");
			addNode(latlngs.getAt(0).lat() + 0.0005, latlngs.getAt(0).lng() + 0.0005);
			polygon.setPath(latlngs);
		    showNodeMarkers(true, true);
			changed = true;
		}
		function isSelected(){
			return amSelected;
		}
		function initZone(name, lat, lng){
			//alert ("initialising ["+ name + "] (" + lat + "," + lng + ")");
			zoneName = name;
			x=parseFloat(lat);
			y=parseFloat(lng);
			addNode(x + 0.0005,y + 0.0005 );
			addNode(x + 0.0005,y - 0.0005 );
			addNode(x - 0.0005,y - 0.0005 );
			addNode(x - 0.0005,y + 0.0005 );
			changed=true;
			polygon = new google.maps.Polygon({
				strokeColor: zColor,
				fillColor: zFill,
				fillOpacity:zOpac,
				strokeOpacity: 1.0,
				strokeWeight: 2,
				zIndex:1,
				path: latlngs
			})
			polygon.setMap(gMap);
			changed=false;
			startListeners();
			//zoomTo(); 
		}
		function saveZone(){
	
			var minlat = parseFloat(180);
			var maxlat = parseFloat(-180);
			var minlng = parseFloat(180);
			var maxlng = parseFloat(-180);
			var msg='';
			for(var i=0;i<latlngs.getLength();i++){
				msg += "  <node";
				msg += " lat='" + latlngs.getAt(i).lat() + "'";
				msg += " lon='" + latlngs.getAt(i).lng() + "'";
				msg += " />\n";
				minlat = Math.min(latlngs.getAt(i).lat(), minlat);
				maxlat = Math.max(latlngs.getAt(i).lat(), maxlat);
				minlng = Math.min(latlngs.getAt(i).lng(), minlng);
				maxlng = Math.max(latlngs.getAt(i).lng(), maxlng);
			}
			for (var i=0; i<exits.length; i++){
				msg += "  <exit name='" + exits[i] + "'/>\n";
			}
			var msghdr= "<" + "?xml version='1.0' standalone='yes'?" + ">\n"; //like this to avoid php errors 
			msghdr += "<zones>\n";
			msghdr += "<zone name='" + zoneName + "'";
			msghdr += " lat1='" + minlat + "'";
			msghdr += " lng1='" + minlng + "'";
			msghdr += " lat2='" + maxlat + "'";
			msghdr += " lng2='" + maxlng + "'";
			msghdr += " >\n";
			msg = msghdr + msg + "</zone>\n</zones>\n";
			var d = new Date();
			//alert (msg);
			postwith('./api/zonesave.php?u='+d.getTime(),{'xml':encodeURI(msg), 'filename':zoneName});
			changed = false;
		}
		function showNodeMarkers(onoff, draggable){
			clearMarkers();
			if (onoff){
				//alert ("draggable: " + draggable);
				for (var i=0; i<latlngs.getLength(); i++){
					var marker = new google.maps.Marker(
						{	map: gMap,
							position: latlngs.getAt(i),
							draggable: draggable,
							title: '' + i
						}
					);
					markers.push(marker);
					if (draggable){CreateMarkerListener(markers[i]);}
				}	

			}
		}		
		
		function selected(selectme){
			if (selectme){
				polygon.setOptions({fillColor: sFill, strokeColor: sColor, fillOpacity:sOpac});
			} else {
				polygon.setOptions({fillColor: zFill, strokeColor: zColor, fillOpacity:zOpac});
			}	
			amSelected=selectme;
		}
		function zoomTo(){
			var bounds=new google.maps.LatLngBounds;
			for (var i=0;i<latlngs.getLength();i++)
			{
				bounds.extend(latlngs.getAt(i));
			}
			gMap.fitBounds(bounds)
		}
		//function onClick(){};
	// Gets & Sets 		
		function setGMap(googlemap){gMap = googlemap;}
		function setName(zName){zoneName = zName;}
		function setId(zid){id=zid;}
		function getName(){return zoneName;}
		function getId(){return id;}
		function setStrokeColor(color){if (color != undefined) zColor = color}
		function setFillColor(color){if (color != undefined) zFill = color}
		function setFillOpac(opac){if (opac != undefined) zOpac = opac}
		function setHoverStroke(color){if (color != undefined) hColor = color}
		function setHoverFill(color){if (color != undefined) hFill = color}
		function setHoverOpac(opac){if (opac != undefined) hOpac = opac}
		function setSelectedStroke(color){if (color != undefined) sColor = color}
		function setSelectedFill(color){if (color != undefined) sFill = color}
		function setSelectedOpac(opac){if (opac != undefined) sOpac = opac}
	//Private methods
function fireClick(me) {
    fnClick(id);
}
function onClick(f){
	fnClick=f;
}    
function postwith(to, p){
	$.ajax({
	   type: "POST",
	   url: to,
	   data: p,
	   success: function(msg){
		 alert( "Saved: " + msg );
	   }
	 });
}
function getisChanged(){
	//alert (changed);
	return changed;
}
function getZoneIDFromName(rname){
	var zoneID = null;
	if (rname.length==0 ){
		alert ("Code Error");
		return null;
	}
	for (var i=0; i < zoneNames.length && zoneID ===null; i++){		
		if (zoneNames[i]===rname){
			zoneID = i;
		}
	}
	return zoneID;	
}
function clearMarkers(){
	
	for (var i=0; i < markers.length; i++){
		markers[i].setMap();
	}
	markers.length = 0;
}
function checkForSave(){
	if (changed){
		alert ("save dialogue here please");
	}
}
function findMarkerIndex(locationMarker) {
  var index = -1;

  for (var  i = 0; i < markers.length; i++) {
    if (markers[i] === locationMarker) {
      index = i;
      break;
    }
  }

  return index;
}
function CreateMarkerListener(marker){
	listeners.push(google.maps.event.addListener(marker, 'drag', 
		function() {
			var index = findMarkerIndex(marker);								
			if (index >= 0){
			 var nLatLng = marker.getPosition();
			 latlngs.setAt(index, nLatLng);
			 polygon.setPath(latlngs);
			 changed = true;
			} 
		}	
	));
}


} //end of prototype
