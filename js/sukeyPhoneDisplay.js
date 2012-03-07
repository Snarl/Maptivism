var phoneDisplay = true; // test using if(typeof(PhoneDisplay) != 'undefined')
var canvas;				//DOM id of canvas tag
var ctx;				//2d canvas context
var cx;           		//xCenter of phone canvas
var cy;           		//yCenter of phone canvas
var segradius;	      	//Radius of display rim
var innerRadius;  		//Radius of display hub
var clat;				//Current latitude
var clon;               //Current Longitude
var wheeldata=[];  		//Array of current wheel bearing pairs and status
var cZone;				//Name of current zone;
var red   = "#FF0033";
var amber = "#FFff33";
var green = "#33CC00";
var black = "#000000";
var font20;
var font15;
var font10;


function initialiseFone(canvas_){
	cZone = "Unknown Zone";
	canvas = canvas_;
	cx = canvas.width/2;
	cy = canvas.height/2;
	segradius = Math.min(cx,cy) *.95;
	innerRadius = segradius *.8;
	font20 = Math.round(cx/100*20) + "px  Sans-Serif";
	font15 = Math.round(cx/100*15) + "px  Sans-Serif";
	font10 = Math.round(cx/100*10) + "px  Sans-Serif";
	ctx = canvas.getContext("2d");
	ctx.strokeStyle = "#000000";
	//draw_title();
	initiate_geolocation();
}

function drawseg(fromangle, toangle, color){
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(cx,cy);
	ctx.arc(cx,cy,segradius,Math.PI*2*(fromangle)/360 + Math.PI,Math.PI*2*(toangle)/360 + Math.PI,false);
	ctx.lineTo(cx,cy);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
}

function getwheel(){
      if (cZone && cZone != "Unknown Zone"){
			var $url="http://sukey.org/sukey/api/getcolorwheeldata.php?loc=" + clat + "," + clon + "&zone=" + cZone;
			$.ajax({
			type: "GET",
			url: $url,
			success: function(xml){
				//alert(xml);
				  wheeldata.length=0;
				  $(xml).find("exit").each(function(){
					var exitName=$(this).attr("leadsto");					
					exitName=exitName.split('|');
					wheeldata.push([parseFloat($(this).attr("b1")), parseFloat($(this).attr("b2")), $(this).attr("status"), exitName[0] ]);
				  });				
				  draw();
				}
			});
		  
	  } else {
		  wheeldata.length = 0;
		  draw();
	  }
}

function draw() {
      if (ctx) {
		ctx.fillStyle = "#303030";
		ctx.beginPath();
		ctx.arc(cx,cy,segradius,Math.PI*2,0, true);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		for (var i=0; i < wheeldata.length; i++){
			drawseg( wheeldata[i][0], wheeldata[i][1], wheeldata[i][2]);
		}

		ctx.fillStyle = "#F0F0F0";
		ctx.beginPath();
		ctx.arc(cx,cy,innerRadius,Math.PI*2,0,true);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	
		var loctext;
		if (clat){
			loctext = (Math.round(clat * 100000)/100000) + ", " + (Math.round(clon * 100000)/100000);
		} else {
			loctext = 'Unknown\nZone';
		}
	
		ctx.fillStyle    = '#000009';
		ctx.font         = font15;
		ctx.textAlign    = 'center';
		
		ctx.textBaseline = 'bottom';
		ctx.fillText(cZone, cx, cy); 
		ctx.font         = font10;
		ctx.textBaseline = 'top';
		ctx.fillText(loctext, cx, cy); 
/*		
//		ctx.save();
//		ctx.shadowOffsetX = -1;
//		ctx.shadowOffsetY = -1;
//		ctx.shadowBlur    = 0;
//		ctx.shadowColor   = "#000";
		ctx.textAlign    = 'left';
		ctx.textBaseline = 'middle';
		for( i=0; i<wheeldata.length; i++){
			var angle = (wheeldata[i][0]+ wheeldata[i][1])/2 /360 * Math.PI + (Math.PI);
			ctx.save();
			ctx.translate(cx,cy);			
			ctx.rotate(angle);
			ctx.fillText("     " + wheeldata[i][3] + "     ", 0,0);
			ctx.restore();
		}

*/
/*		var ybelow=cy + 20;
		var yabove=cy - 40;
		for( i=0; i<wheeldata.length; i++){
			ctx.fillStyle= wheeldata[i][2];
			if ((wheeldata[i][0]+wheeldata[i][1])/2 <=180){
				ctx.fillText(wheeldata[i][3], cx,yabove);
				yabove -=20;
			} else {
				ctx.fillText(wheeldata[i][3], cx,ybelow);
				ybelow +=20;
			}
		}
*/
      }
 }

 //Geo
 
function initiate_geolocation() {  
	{
		navigator.geolocation.getCurrentPosition(handle_geolocation_query);  
	}	
}  

function handle_geolocation_query(position){  
	{
		setNewFoneLocation(position.coords.latitude,position.coords.longitude);
	}
}


function draw_title(){
	ctx.fillStyle    = '#202020';
	ctx.font         = font15;
	ctx.textBaseline = 'top';
	ctx.fillText  ('Sukey', 0, 0);
}

function setNewFoneLocation(lat, lng){
	clat = lat;
	//clat = 51.50055;
	clon = lng;
	//clon = -0.12661;
	$url="http://sukey.org/api/determinezoneforpoint.php?loc=" + clat + "," + clon;
		$.ajax({
		   type: "GET",
		   url: $url,
		   success: function(msg){
							cZone=msg;
							//cZone="Parliament Square";
							//alert("Lat and Long are manually set for debugging." + clat + "," + clon + "," + cZone);
							getwheel();
						}
		 });
	}
	//todo: set a timer do do this again. or check the distance moved. 
