$(document).foundation()

var electionsXML; 
var geocoder;
var nextElectionDate = new Date(2019, 10, 21)
var todaysDate;

function initialize() {
    loadXML();
    geocoder = new google.maps.Geocoder();
    var input = document.getElementById('address-input');
    var options = {
      componentRestrictions: {country: 'ca'}
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);
    todaysDate = new Date()
    var electionCountdownDays = Math.floor((nextElectionDate - todaysDate) / (1000*60*60*24))
    $("#election-countdown span").html(String(electionCountdownDays))
}




var waypoint = new Waypoint({
  element: document.getElementsByTagName('body')[0],
  handler: function(direction) {
    if (direction == "down") {
        $("#top-tag").animate({
        height: '55px',
        backgroundColor: '#282828',
        borderRadius: '0'
        }, "fast");
        $("#top-tag").css({
            "box-shadow": "none",
            "border": "none",
            "background-image": "linear-gradient(#282828, #282828, #181818)"
        });
        $(".top-tag-text").css({
            "visibility": "hidden"
        });
        $("#top-title").css({
            "display": "inline"
        });

    } else {

        $("#top-tag").animate({
        height: '200px',
        backgroundColor: '#E0E0E0'
        }, "fast");
        $("#top-tag").css({"border-radius": "0px 0px 8px 8px", 
                           "box-shadow": "0px 3px 4px rgba(0,0,0,.7)",
                           "border": "2px solid #484848",
                           "border-top": "none",
                           "background-image": "none"});
        $(".top-tag-text").css({
            "visibility": "visible"
        });
        $("#top-title").css({
            "display": "none"
        });
    }
  }, offset: -80
})


$( ".postal-search-bar button" ).click(function() {
  var string = $(".postal-search-bar input").val()
  if (Boolean(string)) {
    var address = $("#address-input").val();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        coord2FED([results[0].geometry.location.lng(), results[0].geometry.location.lat()], provincesGeo);
        //Convert coords to FED ID and load appropriate page. 
        //Store FED ID in session storage for the next page to load XML and fill in data
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

  } else {alert("hi")};
});




function provinceClick(evt) {
    if (Boolean(electionsXML)){
        initMapBoxMap();
    }
};


function initMapBoxMap() {
    var mapBoxAccessToken = "sk.eyJ1Ijoid3JreWxlIiwiYSI6ImNpenp0am9rZTA0bGczM2xzdG41ODlrNXQifQ.d3sWSdM74ogzw6hdXkQTHw";
    var mymap = L.map('mapboxmap', {attributionControl: false}).setView([61, -95], 3.6);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: '',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: mapBoxAccessToken
    }).addTo(mymap);

    L.geoJson(provincesGeo, {style: style}).addTo(mymap);
}



function seatMapClick(evt) {
	var num = evt.target.id.substr(1);
	var dataArray = new Array;
	dataArray[130] = ["Justin", "Trudeau", "Liberal", [.2, .5, .3]];
	
}


function loadXML() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
            electionsXML = this.responseXML;
    	}
  	};
  	xhttp.open("GET", "file:///home/wes/Personal/theBoreal/Foundation6/boreal_1/data/FED2015.xml", true);
  	xhttp.send();
} 






function getColorBlue(d) {
    return d > 100000000000 ? '#244A57' :
           d > 50000000000  ? '#114F54' :
           d > 1000000000  ? '#497878' :
           d > 800000000  ? '#00727F' :
           d > 300000000   ? '#279788' :
           d > 100000000   ? '#5BB4B0' :
           d > 40000000   ? '#7CDAD3' :
                      '#AFE0E0';
}



function style(feature) {
    return {
        fillColor: getColorBlue(feature.properties.area),
        weight: 1.5,
        opacity: 1,
        color: 'white',
        dashArray: '2',
        fillOpacity: 0.5
    };
}


function coord2FED (point, geojson) {
    var fedID;
    var features = geojson.features
    features.forEach(function (f) {
        if(d3.geoContains(f, point)) {
            fedID = f.properties.FEDUID
            alert(f.properties.FEDENAME)
        }
    });
    return fedID
}