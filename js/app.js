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
    initLocationSearchBar();
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

function initializeFEDPage() {
    createPageWaypoints();
    loadXML();
    initLocationSearchBar();
}



function initElectionCountdown() {
    var nextElectionDate = new Date(2019, 10, 21);
    var todaysDate;
    todaysDate = new Date();
    var electionCountdownDays = Math.floor((nextElectionDate - todaysDate) / (1000*60*60*24));
    $("#election-countdown span").html(String(electionCountdownDays));
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

function FEDFromQueryString() {
    var query = window.location.search;
    if (query.substring(0, 1) == '?') {
        query = query.substring(1);
    }
    var data = decodeURI(query);
    var FED = data.slice(-5);    
    return FED;
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
            var fedID = coord2FED([results[0].geometry.location.lng(), results[0].geometry.location.lat()]);

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
  	xhttp.open("GET", "/data/FED2015.xml", true);
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


function coord2FED (point) {
    var provincelist = ["AB", "BC", "SK", "MB", "ON", "QC", "NB", "NS", "NL", "PE", "YT", "NT", "NU"]
    var fedID;

    for (var i = provincelist.length - 1; i >= 0; i--) {
        var mapdataURI = "../data/shapefiles/" + 
                         provincelist[i] + "/" + 
                         provincelist[i] + "-multiPart-simplified.json";
        d3.json(mapdataURI, function (er, mapdata) {
            var features = mapdata.features;
            features.forEach(function (f) {
                if(d3.geoContains(f, point)) {
                    fedID = f.properties.FEDUID;
                    console.log(fedID);
                }
            });        
        });
    }
    return fedID;
}


function createFEDListItem(fedid, fedelement) {
    var winningcandidate = getFEDWinner(fedid, fedelement);


    var fedsnapshotflex = d3.select("#list-of-FEDs").append("div").classed("FED-snapshot-flex", true);
    var fedtitlebarflex = fedsnapshotflex.append("div").classed("FED-titlebar-flex", true);
    var fedbodyflex = fedsnapshotflex.append("div").classed("FED-body-flex", true);
    var fedprovinceabbrev = fedtitlebarflex.append("p").classed("FED-province-abbrev", true).html(fedelement.getElementsByTagName("Province")[0].getAttribute("abbreviation"));
    var fedname = fedtitlebarflex.append("p").classed("FED-name", true).html(fedelement.getElementsByTagName("Name")[0].childNodes[0].nodeValue);
    var fedphotoflex = fedbodyflex.append("div").classed("FED-photo-flex", true);
    fedphotoflex.append("img").attr("src", fedelement.getElementsByTagName("OfficialMPPhoto")[0].childNodes[0].nodeValue);
    var feddetailsflex = fedbodyflex.append("div").classed("FED-details-flex", true);
    var fedresultsflex = fedbodyflex.append("div").classed("FED-results-flex", true);
    var fedstatsflex = fedbodyflex.append("div").classed("FED-stats-flex", true);


    var fedmp = createFEDDetailsRow("mp", "MP", winningcandidate.getElementsByTagName("CandidateName")[0].childNodes[0].nodeValue);
    var fedpopulation = createFEDDetailsRow("population", "Population", fedelement.getElementsByTagName("Population")[0].childNodes[0].nodeValue);
    var fedelectors = createFEDDetailsRow("electors", "Electors", fedelement.getElementsByTagName("Electors")[0].childNodes[0].nodeValue);
    feddetailsflex.append(function() {return fedmp});
    feddetailsflex.append(function() {return fedpopulation});
    feddetailsflex.append(function() {return fedelectors});


    var raceresultdata = getRaceResultData(fedelement);
    var candidateinfo = fedresultsflex.append("div").classed("candidate-info", true);
    var raceresultsvg = fedresultsflex.append("svg");





    var fedturnout = fedstatsflex.append("div").classed("FED-turnout", true);
    var fedturnoutpercentage = fedturnout.append("p").classed("FED-stats-percentage", true).html(fedelement.getElementsByTagName("Turnout")[0].childNodes[0].nodeValue);
    var fedturnoutlabel = fedturnout.append("p").classed("FED-stats-label", true).html("TURNOUT");


    var fedcompetition = fedstatsflex.append("div").classed("FED-competition", true);
    var fedcompetitionpercentage = fedcompetition.append("p").classed("FED-stats-percentage", true).html(fedelement.getElementsByTagName("Competitiveness")[0].childNodes[0].nodeValue.slice(0,4));
    var fedcompetitionlabel = fedcompetition.append("p").classed("FED-stats-label", true).html("COMPETITIVENESS");





    createBarChart(raceresultsvg, raceresultdata);
}

//MAKE THIS AN OBJECT JSON WITH D.NAME, D.VOTE, D.OCCUPATION, D.AFFILIATION
function getRaceResultData(fedelement) {
    var candidates = fedelement.getElementsByTagName("Candidate");
    var data = [];
    for (var i = candidates.length - 1; i >= 0; i--) {
        data.push({name: candidates[i].getElementsByTagName("CandidateName")[0].childNodes[0].nodeValue,
                   vote: parseFloat(candidates[i].getElementsByTagName("PercentOfVote")[0].childNodes[0].nodeValue),
                   occupation: candidates[i].getElementsByTagName("Occupation")[0].childNodes[0].nodeValue,
                   affiliation: candidates[i].getElementsByTagName("CandidateAffiliation")[0].childNodes[0].nodeValue});
    }
    return data;
}


function populateFEDList(electionsXML) {
    var province = provinceFromQueryString();
    var fedlist = electionsXML.getElementsByTagName("FED");
    for (var i = fedlist.length - 1; i >= 0; i--) {
        var abbrev = fedlist[i].getElementsByTagName("Province")[0].getAttribute("abbreviation");
        if (abbrev === province) {
            var fedid = fedlist[i].getAttribute("id");
            createFEDListItem(fedid, fedlist[i]);
        }
    }
}


function getFEDWinner(fedid, fedelement) {
    var candidates = fedelement.getElementsByTagName("Candidate");
    for (var i = candidates.length - 1; i >= 0; i--) {
        if (candidates[i].getElementsByTagName("Victor")[0].childNodes[0].nodeValue === "Yes") {
            return candidates[i];
        }
    }
}

function createFEDDetailsRow(id, label, data) {
    var datarow = document.createElement("div");
    var datarowlabel = document.createElement("p");
    var datarowdata = document.createElement("p");

    datarow.className = "FED-data-row";
    datarow.id = id;
    datarowlabel.className = "FED-data-row-label";
    datarowlabel.id = id + "-label";
    datarowlabel.innerHTML = String(label);
    datarowdata.className = "FED-data-row-data";
    datarowdata.id = id + "data";
    datarowdata.innerHTML = String(data);

    datarow.append(datarowlabel);
    datarow.append(datarowdata);

    return datarow;
}





function createBarChart(svg, data) {
    var w = 200;
    var h = 120;
    var barpadding = 2;

    svg.attr("width", w).attr("height", h)
    svg.selectAll("rect")
       .data(data)
       .enter()
       .append("rect")
       .attr("x", function(d, i) {return i * (w / data.length - barpadding)})
       .attr("y", function(d) {return h - d.vote})
       .attr("width", w / data.length - barpadding)
       .attr("height", function(d, i) {return d.vote/100 * h})
}



