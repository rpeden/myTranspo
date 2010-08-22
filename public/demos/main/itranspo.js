//default coordinates

  
  Map = {
    
    //defaults in case geolocation doesn't work
    latitude : 45.423415,
    longitude : -75.698379,
    map : " ",
    markersArray : [],
    
    Boundaries : {
   
      swLat : 0,
      swLng : 0,
      neLat : 0,
      neLng : 0
    
    },  
    
     
    //called from init.js
    init : function(location) {
	
        if(location) {    
            this.latitude = location.coords.latitude;
            this.longitude = location.coords.longitude;
    }
    
    },
    
    //create the map, add listeners, and nearest transit stops
    createmap : function() {
        
        latlng = new google.maps.LatLng(this.latitude, this.longitude);
	
	var openStreet = new google.maps.ImageMapType({
  		getTileUrl: function(ll, z) {
    		var X = ll.x % (1 << z);  // wrap
    		return "http://tile.openstreetmap.org/" + z + "/" + X + "/" + ll.y + ".png";
 		 },
  		tileSize: new google.maps.Size(256, 256),
  		isPng: true,
  		maxZoom: 18,
  		name: "OSM",
  		alt: "Open Streetmap tiles"
		});
        
        var mapOptions = {
            zoom: 17,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
	    //make everyone use the zoom buttons; pinch zoom seems to be choppy/unreliable right now
	    disableDefaultUI: true,
	    navigationControl: true,
	    navigationControlOptions : { style: google.maps.NavigationControlStyle.ANDROID },
	    mapTypeControl: false
	      
        };
        
        map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	map.mapTypes.set('osm', openStreet);
	map.setMapTypeId('osm');

        google.maps.event.addListener(map, 'tilesloaded', function() {
            // Called on initial map load.
            Map.redoBoundaries();
	    	Map.addpoints();
            //Map.printBoundaries();
            //kill it becase we'll use a different listener after initial load
            google.maps.event.clearListeners(map, 'tilesloaded');
        });
        
        google.maps.event.addListener(map, 'dragend', function() {
            // Called on initial map load.
            Map.redoBoundaries();
            //Map.printBoundaries();
            Map.addpoints();
            //kill it becase we'll use a different listener after initial load
        });
           
    },
    
    
    addpoints : function() {
     
       $.get("/points/" + Map.Boundaries.swLat + "/" + Map.Boundaries.neLat + "/"
             + Map.Boundaries.swLng + "/" + Map.Boundaries.neLng,
            
            function(response) {
                
                var result = eval(response);
                //var test = document.getElementById('message2');
                //test.innerHTML += result[0]["stop_name"];
                
		
                for(var key in result){
                    //test.innerHTML += result[key]["stop_name"] + "<br />";
                    var stopLatLng = new google.maps.LatLng(result[key]["stop_lat"] - .0001 ,result[key]["stop_lon"] + .00001);
                    var marker = new google.maps.Marker ({
                    
                            position: stopLatLng,
                            map: map,
                            title: result[key]["stop_name"],
			    icon: 'bus.png'
		      });
		    
		    var id = result[key]["stop_id"]; //make a closure around this when adding click listener
		    
		    google.maps.event.addListener(marker, 'click', Map.handleMarkerClick(id));
		    		    
                    Map.markersArray.unshift(marker);
		    if(Map.markersArray.length > 50) {
		      var deleteme = Map.markersArray.pop();
		      deleteme.setMap(null);
		    }
                } 
            }
        );
        
       
    },
        
        

      changeBoundaries : function(newMinLat, newMaxLat, newMinLon, newMaxLon) {
	 
	 this.minLat = newMinLat;
	 this.maxLat = newMaxLat;
	 this.minLon = newMinLon;
	 this.maxLon = newMaxLon;
	 
      },
      
      redoBoundaries : function() {
	 
	 //I think this will only work in the northern hemisphere...
	 
	 this.Boundaries.swLat = map.getBounds().getSouthWest().lat();
	 this.Boundaries.swLng = map.getBounds().getSouthWest().lng();
	 this.Boundaries.neLat = map.getBounds().getNorthEast().lat();
	 this.Boundaries.neLng = map.getBounds().getNorthEast().lng();
	 
      },
      
      printBoundaries : function() {
        
        $("#map_canvas").html(
			 "SWLon: " + this.Boundaries.swLng + "<br />" +
			 "SWLat: " + this.Boundaries.swLat + "<br />" +
			 "NELon: " + this.Boundaries.neLng + "<br />" +
			 "NELat: " + this.Boundaries.neLat + "<br />");
        
      },
      
      handleMarkerClick : function(stop_id) {
	
	return function() {
	  
	    $.get("/stopinfo/" + stop_id, /*marker.position.lat() + "/" + marker.position.lng(),*/
				 function(response) {
				    var nextbuses = eval(response);
				    $("#buses").html("<tr><th colspan=1>Route</th><th colspan=1>Time</th></tr>");
				    for (var key in nextbuses){
				      
				      $("#buses").append("<tr><td>" + nextbuses[key]["trip_headsign"]
							 + "</td>" + "<td>" + nextbuses[key]["departure_time"] + "</td></tr>");
				      		      
				    }
				    
				    $("#map_holder").addClass('hidden');
				    $("#stop_times").removeClass('hidden');
				    
				    Map.map.checkResize();
				
				 }
				 );
	  
	  
	}
	
	
      }
   
   
    
 }  //end of Map object
  


