$(document).foundation()






//*****************************************************************
//   PAGE GLOBAL VARIABLES
//*****************************************************************


var electionsXML; 
var geocoder;



//*****************************************************************
//   PAGE INITIALIZATION
//*****************************************************************


function initializeMainPage() {
    createPageWaypoints()
    loadXML();
    geocoder = new google.maps.Geocoder();
    var input = document.getElementById('address-input');
    var options = {
      componentRestrictions: {country: 'ca'}
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);
}


function initElectionCountdown() {
    var nextElectionDate = new Date(2019, 10, 21)
    var todaysDate;
    todaysDate = new Date()
    var electionCountdownDays = Math.floor((nextElectionDate - todaysDate) / (1000*60*60*24))
    $("#election-countdown span").html(String(electionCountdownDays))    
}

function initializeProvincePage() {
    createPageWaypoints()
    loadXML();
    geocoder = new google.maps.Geocoder();
    var input = document.getElementById('address-input');
    var options = {
      componentRestrictions: {country: 'ca'}
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);

    var query = window.location.search;
    if (query.substring(0, 1) == '?') {
        query = query.substring(1);
    }
    var data = query.split(',');
    for (i = 0; (i < data.length); i++) {
        data[i] = decodeURI(data[i]);
    }

    var province = data[0].slice(-2)
    initMapBoxMap(province);

}

function initializeFEDPage() {
    createPageWaypoints()
    loadXML();
    geocoder = new google.maps.Geocoder();
    var input = document.getElementById('address-input');
    var options = {
      componentRestrictions: {country: 'ca'}
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);
}


function createPageWaypoints() {
    var waypoint = new Waypoint({
      element: document.getElementsByTagName('body')[0],
      handler: function(direction) {
        if (Waypoint.viewportWidth() > 815) {
            if (direction == "down") {
                $("#top-tag").animate({
                height: '55px',
                backgroundColor: '#282828',
                borderRadius: '0'
                }, "fast");
                $("#top-tag").css({
                    "box-shadow": "none",
                    "border": "none",
                    "background-image": "linear-gradient(#383838, #181818)"
                });
                $(".top-tag-text").css({
                    visibility: "hidden"
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
            }};
        }, offset: -80
    })};



//*****************************************************************
//   LISTENERS
//*****************************************************************


$( ".postal-search-bar button" ).click(function() {
  var string = $(".postal-search-bar input").val()
  if (Boolean(string)) {
    var address = $("#address-input").val();
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == 'OK') {
            var fedID = coord2FED([results[0].geometry.location.lng(), results[0].geometry.location.lat()], provincesGeo);

            if (Boolean(fedID)) {
                var queryString = "?fedid=" + String(fedID)
                var url = encodeURI("./FEDs" + queryString)
                window.location = url
            } else {
                window.location = "#province-map"
                callBadAddressPopup()
            }

        }
    });

  };
});


$(document).ready(function(){
    $(".FED-titlebar-flex").click(function(e){
        $(this).siblings(".FED-body-flex").toggle();
        return;
    });
});




//*****************************************************************
//   OTHER FUNCTIONS
//*****************************************************************


function provinceClick(evt) {
    if (Boolean(electionsXML)){
        var queryString = "?province=" + evt.target.parentNode.getAttribute("id")
        var url = encodeURI("../provinces" + queryString)

        window.location = url
    }
};


function callBadAddressPopup() {
    $('#bad-address-popup').foundation('open');
}





//***********vvv   W   I   P   vvv********************

function getBinnedOccupations(electionXML) {
    var occupations = electionXML.getElementsByTagName("Occupation");
    var set = new Set();
    for (var i = occupations.length - 1; i >= 0; i--) {
        set.add(occupations[i].childNodes[0].nodeValue);
        console.log(occupations[i].childNodes[0].nodeValue)
    };
    console.log(set)
    console.log(occupations.length)
}

//***********^^^   W   I   P   ^^^********************



function filterGeoJSON(feature) {
    var selectedProvince;
    // if (feature.properties.PROVCODE === "ON")
    return true
}


function getPhoto() {
    var photos = electionsXML.getElementsByTagName("OfficialMPPhoto")
    var container = document.getElementById("photos")
    for (var i = photos.length - 1; i >= 0; i--) {
        var img = document.createElement('img');
        img.src = photos[i].childNodes[0].nodeValue
        container.appendChild(img)
    }
}



function initMapBoxMap(province) {
    var mapBoxAccessToken = "sk.eyJ1Ijoid3JreWxlIiwiYSI6ImNpenp0am9rZTA0bGczM2xzdG41ODlrNXQifQ.d3sWSdM74ogzw6hdXkQTHw";
    var mymap = L.map('mapboxmap', {attributionControl: false}).setView([61, -95], 3.6);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: '',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: mapBoxAccessToken
    }).addTo(mymap);

    L.geoJson(mapVariableFromName(province)).addTo(mymap);
}



//I don't like loading all the map data at start
//In future I want to async load only the requested province
//when the page requests it
function mapVariableFromName(name) {
    switch(name) {
        case "AB":
            var ABGeo;
            return ABGeo;
        case "BC":
            var BCGeo;
            return BCGeo;
        case "SK":
            var SKGeo;
            return SKGeo;
        case "MB":
            var MBGeo;
            return MBGeo;
        case "ON":
            var ONGeo;
            return ONGeo;
        case "QC":
            var QCGeo;
            return QCGeo;
        case "NB":
            var NBGeo;
            return NBGeo;
        case "NS":
            var NSGeo;
            return NSGeo;
        case "PE":
            var PEGeo;
            return PEGeo;
        case "NL":
            var NLGeo;
            return NLGeo;
        case "YT":
            var YTGeo;
            return YTGeo;
        case "NT":
            var NTGeo;
            return NTGeo;
        case "NU":
            var NUGeo;
            return NUGeo;
    }
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
            // getPhoto()
    	}
  	};
  	xhttp.open("GET", "data/FED2015.xml", true);
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
        }
    });
    return fedID
}