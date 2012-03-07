function sukeyExit(id,googlemap){
	//Private Member Variables
		var dx;
		var dy;
		var debugdiv;
		var circle; 		        //circle Handle
		var centerPosition;	        //contains a latlng structure describing center of exit
		var radiusPosition;         //latlng structure describing position of radius marker
		var radius=-1;              //radius of intersection in metres
		var exitName; 				//Name of Intersection
		var radiusMarker;           //Marker that shows radius
		var centerMarker;			//Marker that shows center
		var fnClick = function(){}; //Callback function for Click;
		var gMap = null;
		var red = "#FF0000";
		var green = "#00FF00";
		var amber = "#FFFF00";
		var fillColor = "#00FF00";
		var reason;
		var color = green;
		var id;						//ID of this exit for external use;
		var amSelected = false;
		var changed = false;
		var listeners=[];           //circle listeners
		var mlisteners=[];			//marker listeners
		var thisevt;
		var latlngs = new google.maps.MVCArray();
		var zones=[];				//array of zone names served by this exit

    //Construction
		setGMap(googlemap);
		setId(id);
		this.IntersectionName="";

	
	//Public Methods
		this.initExit = initExit;
		this.getName = getName;
		this.showMarkers = showMarkers;
		this.selected = selected;
		this.onClick = onClick;
		this.zoomTo = zoomTo;
		this.saveExit = saveExit;
		this.activateListeners = activateListeners;
		this.addZone = addZone;
		this.clearZones = clearZones;
		this.removeZone = removeZone;
		this.countZones = countZones;
		this.isChanged = getisChanged;
		this.loadExitFromAPI = loadExitFromAPI;
		this.setChanged = setChanged();
		this.setStatus = setStatus;
		
		function setStatus(NewStatus, NewReason){
			$.get("./api/exitlist.php?name=exitname&status=NewStatus&reason=NewReason",{async: true},function(result){ 
				if (result=='OK'){
					circle.setOptions({strokeColor: NewStatus});
				} else {
					alert (result);
				}
			});
		}			


		function clearZones(){
			if (zones.length > 0){
				zones.length=0;
				changed=true;
			}	
		}
		function addZone(zoneName){
			zones.push(zoneName);
			changed=true;
		}
		function removeZone(zoneName){
			while (i = zones.indexOf(zoneName)){
					zones.splice(i);
					changed=true;
			}
		}
		function initExit(name, lat, lng){
			exitName = name;
			centerPosition = new google.maps.LatLng(lat, lng);
			if (radius <= 0) {radius = 10;}
			
			generateLatlngs(centerPosition, radius);
			circle = new google.maps.Polygon({
				strokeColor: "#FFFFFF",
				fillColor: fillColor,
				fillOpacity: 0.8,
				strokeOpacity: 1.0,
				strokeWeight: 2,
				zIndex:10000,
				path: latlngs,
				clickable: true
			});
			circle.setMap(gMap);
			if (listeners.length>0){alert ("assertion error - listeners already present")};
			activateListeners(true);
			changed=true;
			//zoomTo(); 
		}
		function activateListeners(switchon){
			if (switchon){
				while (listeners.length > 0){
					google.maps.event.removeListener(listeners.pop())};

				circle.setOptions({clickable:true});
				listeners.push(google.maps.event.addListener(circle, 'click', 
					function(evt) {
						if (evt != thisevt) {
							thisevt = evt; //prevent multiple firings
							fireClick();
						}	
					}));
				listeners.push(google.maps.event.addListener(circle, 'mouseover', 
					function() {
						if (!amSelected){circle.setOptions({strokeColor:"#FF0000"})};
					}));
				listeners.push(google.maps.event.addListener(circle, 'mouseout', 
					function() {
						if (!amSelected){circle.setOptions({strokeColor:"#FFFFFF"})};
					}));
					circle.setOptions({zIndex:10000});
					circle.setMap(gMap); //move to top				
			}else {
				while (listeners.length>0){
					google.maps.event.removeListener(listeners.pop());
				}
				circle.setOptions({clickable:false});
			}
		}
		function getName(){return exitName;}
		function selected(selectme){
			if (selectme){
				circle.setOptions({strokeColor: "#000000"});
			} else {
				circle.setOptions({strokeColor: "#FFFFFF"});
			}	
			amSelected=selectme;
		}
		function showMarkers(onoff, draggable){
			clearMarkers();
			if (onoff){
					centerMarker = new google.maps.Marker(
						{	map: gMap,
							position: centerPosition,
							draggable: draggable,
						}
					);
					radiusMarker = new google.maps.Marker(
						{	map: gMap,
							position: radiusPosition,
							draggable: draggable,
						}
					);
					CreateMarkerListeners();
			} else {
			}	

		}
		function zoomTo(){
			var bounds=new google.maps.LatLngBounds;
			for (var i=0;i<latlngs.getLength();i++)
			{
				bounds.extend(latlngs.getAt(i));
			}
			gMap.fitBounds(bounds)		
		}
		
function CreateMarkerListeners(){
		mlisteners.push(google.maps.event.addListener(radiusMarker, 'drag', 
		function() {
			radius = google.maps.geometry.spherical.computeDistanceBetween(centerMarker.getPosition(), radiusMarker.getPosition());
			generateLatlngs(centerPosition, radius);
			circle.setPath(latlngs);
			circle.setMap(gMap);
			changed=true;
			} 	
	    ));
		mlisteners.push(google.maps.event.addListener(centerMarker, 'drag', 
		function() {
			centerPosition = centerMarker.getPosition();
			generateLatlngs(centerPosition, radius);
			var nx=parseFloat(centerMarker.getPosition().lat())-dx; 
			var ny=parseFloat(centerMarker.getPosition().lng())-dy;
			radiusPosition = new google.maps.LatLng(nx,ny );
			radiusMarker.setPosition(radiusPosition);
			radiusMarker.setMap(gMap);
			circle.setPath(latlngs);
			circle.setMap(gMap);
			changed=true;
			} 	
	    ));
		mlisteners.push(google.maps.event.addListener(centerMarker, 'dragstart', 
		function() {
				dx=parseFloat(centerMarker.getPosition().lat() - radiusMarker.getPosition().lat());
				dy=parseFloat(centerMarker.getPosition().lng() - radiusMarker.getPosition().lng());
				circle.setOptions({fillOpacity:0.5});
				circle.setMap(gMap);
			} 	
	    ));
		mlisteners.push(google.maps.event.addListener(centerMarker, 'dragend', 
		function() {
				circle.setOptions({fillOpacity:0.8});
				circle.setMap(gMap);
			} 	
	    ));
		mlisteners.push(google.maps.event.addListener(radiusMarker, 'dragstart', 
		function() {
				circle.setOptions({fillOpacity:0.5});
				circle.setMap(gMap);
			} 	
	    ));
		mlisteners.push(google.maps.event.addListener(radiusMarker, 'dragend', 
		function() {
				circle.setOptions({fillOpacity:0.8});
				circle.setMap(gMap);
			} 	
	    ));
}
				
function fireClick(){
    fnClick(id);
}

function clearMarkers(){
	if (centerMarker){
		//clear listeners
		while (mlisteners.length>0){
			google.maps.event.removeListener(mlisteners.pop());
		}	
		centerMarker.setMap();
		radiusMarker.setMap();
	}	
}
		function setGMap(googlemap){gMap = googlemap;}
		function setName(zName){zoneName = zName;changed=true;}
		function setId(zid){id=zid;}
		function setChanged(changeflag){changed=changeflag;}
		function getId(){return id;}
		function getisChanged(){return changed;}

function onClick(f){
	fnClick=f;
}    
		function saveExit(){
			var msg = "<" + "?xml version='1.0' standalone='yes'?" + ">\n"; //like this to avoid php errors 
			msg += "<exits>\n";
			msg += "  <exit ";
			msg += " name='" + exitName + "'";
			msg += " clat='" + centerPosition.lat() + "'";
			msg += " clon='" + centerPosition.lng() + "'";
			msg += " radius='" + radius + "'";			
			msg += " status='" + fillColor + "'";
			msg += " reason='" + reason + "'";			
			msg += " >\n";
			for (var i=0; i<zones.length;i++){
				msg += "    <zone name='" + zones[i] + "'/>\n";
			}
			msg += "  </exit>\n</exits>\n"
			var d = new Date();
			alert (msg);
			postwith('./api/exitsave.php?u='+d.getTime(),{'xml':encodeURI(msg), 'filename':exitName});
			changed = false;
		}
function generateLatlngs(center, radius){
	latlngs.clear();
	var xscale= google.maps.geometry.spherical.computeDistanceBetween(center, new google.maps.LatLng(center.lat() + 0.1, center.lng()))*10;
	var yscale= google.maps.geometry.spherical.computeDistanceBetween(center, new google.maps.LatLng(center.lat(), center.lng()+0.1)) *10;
	var sides=10;

	for(var i=0; i<=360; i+=(360/sides)) {
		var y = radius * Math.cos(i * Math.PI/180);
		var x = radius * Math.sin(i * Math.PI/180);
		
		var lat = x/xscale + center.lat();
		var lng = y/yscale + center.lng();
		//alert (lat + "," + lng);
		latlngs.push(new google.maps.LatLng(lat, lng));
	}	
	radiusPosition = latlngs.getAt(0);  //position to display radius marker
 
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

function countZones(){
	return zones.length;
}

function loadExitFromAPI(en){
	exitName = en;
	$.get("./api/exitfetch.php",{'r':en},
	function(xml) {
		if ($(xml).find('exit').length == 0){
			alert ("Error:\n" + xml);
		} else {		
			$(xml).find('zone').each(function(){
				zones.push($(this).attr('name'));
			});
		
			$(xml).find('exit').each(function(){
				radius = $(this).attr('radius');
				fillColor = $(this).attr('status');
				reason = $(this).attr('reason');
				initExit($(this).attr('name'), $(this).attr('clat'), $(this).attr('clon'));
				changed=false;
			});
		}
	});
}

} //end of prototype

