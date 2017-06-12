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
    createPageWaypoints();
    loadXML();
    geocoder = new google.maps.Geocoder();
    var input = document.getElementById('address-input');
    var options = {
      componentRestrictions: {country: 'ca'}
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);
}


function initElectionCountdown() {
    var nextElectionDate = new Date(2019, 10, 21);
    var todaysDate;
    todaysDate = new Date();
    var electionCountdownDays = Math.floor((nextElectionDate - todaysDate) / (1000*60*60*24));
    $("#election-countdown span").html(String(electionCountdownDays));
}

function initializeProvincePage() {
    createPageWaypoints();
    initLocationSearchBar();
    var province = provinceFromQueryString();
    var mapdataURI = "../data/shapefiles/" + province + "/" + province + "-multiPart-simplified.json";
    d3.json(mapdataURI, function (er, mapdata) {
        initMapBoxMap(mapdata);
    });
    loadXML();

}


function initLocationSearchBar() {
    geocoder = new google.maps.Geocoder();
    var input = document.getElementById('address-input');
    var options = {
      componentRestrictions: {country: 'ca'}
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);    
}

function provinceFromQueryString() {
    var query = window.location.search;
    if (query.substring(0, 1) == '?') {
        query = query.substring(1);
    }
    var data = decodeURI(query);

    var province = data.slice(-2);    
    return province;
}

function initializeFEDPage() {
    createPageWaypoints();
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
            }}
        }, offset: -80}
    );
}

















//*****************************************************************
//   LISTENERS
//*****************************************************************


$( ".postal-search-bar button" ).click(function() {
  var string = $(".postal-search-bar input").val();
  if (Boolean(string)) {
    var address = $("#address-input").val();
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == 'OK') {
            var fedID = coord2FED([results[0].geometry.location.lng(), results[0].geometry.location.lat()], provincesGeo);

            if (Boolean(fedID)) {
                var queryString = "?fedid=" + String(fedID);
                var url = encodeURI("./FEDs" + queryString);
                window.location = url;
            } else {
                window.location = "#province-map";
                callBadAddressPopup();
            }

        }
    });

  }
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
        var queryString = "?province=" + evt.target.parentNode.getAttribute("id");
        var url = encodeURI("../provinces" + queryString);

        window.location = url;
    }
};


function callBadAddressPopup() {
    $('#bad-address-popup').foundation('open');
}




function getPhoto() {
    var photos = electionsXML.getElementsByTagName("OfficialMPPhoto");
    var container = document.getElementById("photos");
    for (var i = photos.length - 1; i >= 0; i--) {
        var img = document.createElement('img');
        img.src = photos[i].childNodes[0].nodeValue;
        container.appendChild(img);
    }
}



function initMapBoxMap(mapdata) {
    var mapBoxAccessToken = "sk.eyJ1Ijoid3JreWxlIiwiYSI6ImNpenp0am9rZTA0bGczM2xzdG41ODlrNXQifQ.d3sWSdM74ogzw6hdXkQTHw";
    var bbox = mapdata["bbox"];
    var center = [(bbox[1] + bbox[3])/2, (bbox[0] + bbox[2])/2];
    var corner1 = L.latLng(bbox[1], bbox[0]);
    var corner2 = L.latLng(bbox[3], bbox[2]);
    var mapbounds = L.latLngBounds(corner1, corner2).pad(0.005);

    var mymap = L.map('mapboxmap', {attributionControl: false, zoomDelta: 0.2, zoomSnap: 0.1});

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: '',
        id: 'mapbox.light',
        accessToken: mapBoxAccessToken
    }).addTo(mymap);
    L.geoJson(mapdata).addTo(mymap);
    mymap.fitBounds(mapbounds);
}





function loadXML() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
            electionsXML = this.responseXML;
            populateFEDList(electionsXML);
    	}
  	};
  	xhttp.open("GET", "/The-Boreal/data/FED2015.xml", true);
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
    }
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


function createFEDListItem(fedid) {
    var fedlistcontainer = document.getElementById("list-of-FEDs");
    var fedsnapshotflex = document.createElement("div").addClass("FED-snapshot-flex");
    var fedtitlebarflex = document.createElement("div").addClass("FED-titlebar-flex");
    var fedprovinceabbrev = document.createElement("p").addClass("FED-province-abbrev");
    var fednameflex = document.createElement("p").addClass("FED-name-flex");
    fedtitlebarflex.append(fedprovinceabbrev);
    fedtitlebarflex.append(fednameflex);
    fedsnapshotflex.append(fedtitlebarflex);


    var fedbodyflex = document.createElement("div").addClass("FED-body-flex");
    var fedphotoflex = document.createElement("div").addClass("FED-photo-flex");
    var fedphoto = document.createElement("img").addClass("FED-photo");
    fedphoto.attr("src", "/The-Boreal/img/MPProfiles/MaguireLarry_CPC.jpg");
    fedphotoflex.append(fedphoto);
    fedbodyflex.append(fedphotoflex);
    fedsnapshotflex.append(fedbodyflex);


    var feddetailsflex = document.createElement("div").addClass("FED-details-flex");
    var feddetails = document.createElement("div").addClass("FED-details");
    var fedmp = document.createElement("p").addClass("FED-mp");
    var fedpopulation = document.createElement("p").addClass("FED-population");
    var fedcontact = document.createElement("p").addClass("FED-contact");
    feddetails.append(fedmp);
    feddetails.append(fedpopulation);
    feddetails.append(fedcontact);
    feddetailsflex.append(feddetails);
    fedbodyflex.append(feddetailsflex);


    var fedstatsflex = document.createElement("div").addClass("FED-stats-flex");
    var fedcompetition = document.createElement("div").addClass("FED-competition");
    var fedcompetitionpercentage = document.createElement("p").addClass("FED-competition-percentage");
    var fedcompetitionlabel = document.createElement("p").addClass("FED-competition-label");
    fedcompetition.append(fedcompetitionpercentage);
    fedcompetition.append(fedcompetitionlabel);
    fedstatsflex.append(fedcompetition);


    var fedturnout = document.createElement("div").addClass("FED-turnout");
    var fedturnoutpercentage = document.createElement("p").addClass("FED-turnout-percentage");
    var fedturnoutlabel = document.createElement("p").addClass("FED-turnout-label");
    fedturnout.append(fedturnoutpercentage);
    fedturnout.append(fedturnoutlabel);
    fedstatsflex.append(fedturnout);


    var fedraceresultchart = document.createElement("div").addClass("FED-race-result-chart");
    var fedraceresultlabel = document.createElement("p").addClass("FED-race-result-label");
    fedraceresultchart.append(fedraceresultlabel);
    fedstatsflex.append(fedraceresultchart);
    fedbodyflex.append(fedstatsflex);

    fedsnapshotflex.append(fedbodyflex);


}



function populateFEDList(electionsXML) {
    var province = provinceFromQueryString();
    var fedlist = electionsXML.getElementsByTagName("FED");
    for (var i = fedlist.length - 1; i >= 0; i--) {
        var abbrev = fedlist[i].getElementsByTagName("Province")[0].getAttribute("abbreviation");
        if (abbrev === province) {
            var fedid = fedlist[i].getAttribute("id");
            createFEDListItem(fedid);
        }
    }
}