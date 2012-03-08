var defaultloc = new google.maps.LatLng(51.520727, -0.086533);
var currloc = null;
var map;
var me = null;
var followMe = true;

function init_map() {
	getTickerRSS();
	map = new google.maps.Map(
		document.getElementById('map'), {
			zoom: 16,
			center: defaultloc,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			draggable: true
		}
	);

	var msids = [	'212377250988774351922.0004b6224ba561ebee1b0', /* "Occupations.kml" */
			'212377250988774351922.0004ba74e92f1c118c517', /* "Free Wifi  Electricity.kml" */ 
			'212377250988774351922.0004ba7516a1ac1e05ac9', /* "Skipping  Food.kml" */
			'212377250988774351922.0004ba75119e1444481ff', /* "Toilets.kml"  */
			'212377250988774351922.0004ba7504886c2262b6a'] /* "Showers.kml" */
/* sotiri's advice: view-source:http://wind.wiran.gr/?page=pickup&subpage=gmap&object_lat=form_node.elements%5B%27nodes__latitude%27%5D&object_lon=form_node.elements%5B%27nodes__longitude%27%5D  */

	var kml_layers = [];
	msids.forEach(function(msid) {  + }, msid )
	
	for (msid in msids) {
		kml_layers.push(new google.maps.KmlLayer('http://maps.google.co.uk/maps/ms?authuser=0&hl=en&ie=UTF8&msa=0&output=kml&msid=' + msid',
								{ map: map,
								  preserveViewport: true,
								  clickable: true }));
	for (l in kml_layers) {
		l.setMap(map);
	}
	
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(
			locateSuccess,
			locateError, {
				enableHighAccuracy: true, maximumAge: 300*1000, timeout: 290*1000
			}
		);
	} else locateError();
}

function locateError() {
	if (currloc === null) {
		currloc = defaultloc;
	}
}

function locateSuccess(pos) {
	currloc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
	if (me === null) {
		var bounds = new google.maps.LatLngBounds(defaultloc, defaultloc);
		bounds.extend(currloc);
		map.fitBounds(bounds);
		me = new google.maps.Marker({
			map: map,
			draggable: false,
			animation: google.maps.Animation.DROP,
			position: currloc
		});
	}
	if(followMe) {
		map.setCenter(currloc);
		followMe = false;
	}

}

