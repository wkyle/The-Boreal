$(document).foundation()






//*******************************************************************************************
//   PAGE GLOBAL VARIABLES
//*******************************************************************************************

var siteroot = "/The-Boreal";//"/The-Boreal";
var electionsXML;
var geocoder;
var mapGeoJson;
var provinceMap;
var mapTileLayer;
var mapInfo;
var zoomedToFeature = {bool: false, feature: null};


//*******************************************************************************************
//   PAGE INITIALIZATION
//*******************************************************************************************


function initializeMainPage() {
    createPageWaypoints();
    loadXML();
    initLocationSearchBar();
    initElectionCountdown()
}

function initializeProvincePage() {
    createPageWaypoints();
    initLocationSearchBar();
    var province = queryStringObject().province;
    $("#name-of-province").html(provinceNameExpand(province));
    var mapdataURI = siteroot + "/data/shapefiles/" + province + "/" + province + "-multiPart-simplified.json";
    d3.json(mapdataURI, function (er, mapdata) {
        initMapBoxMap(mapdata);
    });
    initElectionCountdown()
    loadXML();
}

function initializeFEDPage() {
    var fedID = queryStringObject().fed;
    createPageWaypoints();
    initElectionCountdown()
    initLocationSearchBar();
    loadXML();
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



function createPageWaypoints() {
    var navwaypoint = new Waypoint({
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
                $("#top-search-bar").css({display: "inline"})

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
                $("#top-search-bar").css({display: "none"})
            }}
        }, offset: -300}
    );
}

















//*****************************************************************
//   LISTENERS
//*****************************************************************


$(".postal-search-bar button").click(function() {

  var string = $(".postal-search-bar input").val();
  if (Boolean(string)) {
    var address = $("#address-input").val();
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == 'OK') {
            coord2FED([results[0].geometry.location.lng(), results[0].geometry.location.lat()]);
        }
    });

  }
});

$(document).on("click", ".FED-titlebar-flex", function() {
    var fedID = $(this).children(".FED-name").attr("id");
    if (Boolean(fedID)) {
        var queryString = "?fedid=" + String(fedID);
        var url = encodeURI(siteroot + "/FEDs" + queryString);
        window.location = url;
    }
});






//*******************************************************************************************
//   CONVENIENCE FUNCTIONS
//*******************************************************************************************

function getRandomColor(color, variance) {
    var blue = ["00","85","AE"];
    var red = ["B9","28","09"];
    var green = ["00","91","2D"];
    var brown = ["9B","7C","57"];
    var grey = ["80","80","80"];
    var scale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([0, 1])
                    .clamp(true);
    var colorscale = d3.scaleLinear()
                    .domain([0, 255])
                    .range([0, 255])
                    .clamp(true);
    var variance = scale(variance);

    switch(color) {
        case "blue":
            var random = Math.floor((Math.random() * variance * 128) - 64 * variance);
            var newcolor = blue.map(function(d) {return colorscale(parseInt(d, 16) + random)});
            return "#" + ("0" + newcolor[0].toString(16)).slice(-2) + 
                         ("0" + newcolor[1].toString(16)).slice(-2) + 
                         ("0" + newcolor[2].toString(16)).slice(-2);
        case "red":
            var random = Math.floor((Math.random() * variance * 128) - 64 * variance);
            var newcolor = red.map(function(d) {return colorscale(parseInt(d, 16) + random)});
            return "#" + ("0" + newcolor[0].toString(16)).slice(-2) + 
                         ("0" + newcolor[1].toString(16)).slice(-2) + 
                         ("0" + newcolor[2].toString(16)).slice(-2);
        case "green":
            var random = Math.floor((Math.random() * variance * 128) - 64 * variance);
            var newcolor = green.map(function(d) {return colorscale(parseInt(d, 16) + random)});
            return "#" + ("0" + newcolor[0].toString(16)).slice(-2) + 
                         ("0" + newcolor[1].toString(16)).slice(-2) + 
                         ("0" + newcolor[2].toString(16)).slice(-2);
        case "grey":
            var random = Math.floor((Math.random() * variance * 128) - 64 * variance);
            var newcolor = grey.map(function(d) {return colorscale(parseInt(d, 16) + random)});
            return "#" + ("0" + newcolor[0].toString(16)).slice(-2) + 
                         ("0" + newcolor[1].toString(16)).slice(-2) + 
                         ("0" + newcolor[2].toString(16)).slice(-2);
        case "brown":
            var random = Math.floor((Math.random() * variance * 128) - 64 * variance);
            var newcolor = brown.map(function(d) {return colorscale(parseInt(d, 16) + random)});
            return "#" + ("0" + newcolor[0].toString(16)).slice(-2) + 
                         ("0" + newcolor[1].toString(16)).slice(-2) + 
                         ("0" + newcolor[2].toString(16)).slice(-2);
        default:
            return "#" + grey[0] + grey[1] + grey[2];
    }
}


function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}


function queryStringObject() {
    var QSO = {};
    var query = window.location.search;
    if (query.substring(0,1) === "?") {
        query = query.slice(1);
    }
    var queryarray = decodeURI(query).split(/[&|=]/);
    var keys = queryarray.filter(function(d, i) {return (i + 1) % 2});
    var values = queryarray.filter(function(d, i) {return i % 2});

    if (keys.length > 0) {
        if (keys.length > values.length) {
            for (var i = values.length - 1; i >= 0; i--) {
                if (Boolean(keys[i])) {
                    QSO[keys[i]] = values[i];
                }
            }    
        } else {
            for (var i = keys.length - 1; i >= 0; i--) {
                if (Boolean(keys[i])) {
                    QSO[keys[i]] = values[i];
                }
            }
        }
        
    }
    return QSO;
}


function provinceNameExpand(abbrev) {
    var dict = {"BC": "British Columbia",
                "AB": "Alberta",
                "SK": "Saskatchewan",
                "MB": "Manitoba",
                "ON": "Ontario",
                "QC": "Quebec",
                "PE": "Prince Edward Island",
                "NS": "Nova Scotia",
                "NL": "Newfoundland and Labrador",
                "NB": "New Brunswick",
                "NT": "Northwest Territories",
                "NU": "Nunavut",
                "YT": "Yukon"}
    return dict[abbrev];
}



//*******************************************************************************************
//   OTHER FUNCTIONS
//*******************************************************************************************


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

    provinceMap = L.map('mapboxmap', {attributionControl: false, zoomDelta: 0.2, zoomSnap: 0.1});

    mapTileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: '',
        id: 'mapbox.light',
        accessToken: mapBoxAccessToken
    }).addTo(provinceMap);
    mapGeoJson = L.geoJson(mapdata, {style: mapStyle,
                        onEachFeature: onEachFeature}).addTo(provinceMap);
    provinceMap.fitBounds(mapbounds);


    mapInfo = L.control();
    mapInfo.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'map-info'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    // method that we will use to update the control based on feature properties passed
    mapInfo.update = function (props) {
        this._div.innerHTML = (props ? props.FEDNAME : 'Hover over a province');
    };
    mapInfo.addTo(provinceMap);
}







function loadXML() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
            electionsXML = this.responseXML;
            populateFEDList(electionsXML);
            if(window.location.href.indexOf("provinces") > -1) {
                populateProvincePageData(electionsXML);
            }
    	}
  	};
  	xhttp.open("GET", siteroot + "/data/FED2015.xml", true);
  	xhttp.send();
} 











function coord2FED (point) {
    var provincelist = ["AB", "BC", "SK", "MB", "ON", "QC", "NB", "NS", "NL", "PE", "YT", "NT", "NU"]
    var fedID;

    provinceloop:
    for (var i = provincelist.length - 1; i >= 0; i--) {
        var mapdataURI = siteroot + "/data/shapefiles/" + 
                         provincelist[i] + "/" + 
                         provincelist[i] + "-multiPart-simplified.json";
        d3.json(mapdataURI, function (e, mapdata) {
            var features = mapdata.features;

            featureloop:
            for (var i = features.length - 1; i >= 0; i--) {
                if (d3.geoContains(features[i], point)) {
                    fedID = features[i].properties.FEDUID;
                    var queryString = "?fedid=" + String(fedID);
                    var url = encodeURI(siteroot + "/FEDs" + queryString);
                    window.location = url;
                    break featureloop;
                }
            }
            return;   
        });
    }
}


function createFEDListItem(fedid, fedelement) {
    var winningcandidate = getFEDWinner(fedid, fedelement);


    var fedsnapshotflex = d3.select("#list-of-FEDs").append("div").classed("FED-snapshot-flex", true);
    var fedtitlebarflex = fedsnapshotflex.append("div").classed("FED-titlebar-flex", true);
    var fedbodyflex = fedsnapshotflex.append("div").classed("FED-body-flex", true);
    var fedprovinceabbrev = fedtitlebarflex.append("p").classed("FED-province-abbrev", true).html(fedelement.getElementsByTagName("Province")[0].getAttribute("abbreviation"));
    var fedname = fedtitlebarflex.append("p").classed("FED-name", true).attr("id", fedelement.getAttribute("id")).html(fedelement.getElementsByTagName("Name")[0].childNodes[0].nodeValue);
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
    var raceresultsvg = fedresultsflex.append("svg").attr("id", "province-svg");

    var candidatename = createFEDDetailsRow("cand-name", "Candidate", winningcandidate.getElementsByTagName("CandidateName")[0].childNodes[0].nodeValue);
    var candidatevotes = createFEDDetailsRow("cand-votes", "Percentage Vote", winningcandidate.getElementsByTagName("PercentOfVote")[0].childNodes[0].nodeValue);
    var candidateoccupation = createFEDDetailsRow("cand-occupation", "Occupation", winningcandidate.getElementsByTagName("Occupation")[0].childNodes[0].nodeValue);
    var candidateaffiliation = createFEDDetailsRow("cand-affiliation", "Affiliation", winningcandidate.getElementsByTagName("CandidateAffiliation")[0].childNodes[0].nodeValue);
    candidateinfo.append(function() {return candidatename});
    candidateinfo.append(function() {return candidateaffiliation});
    candidateinfo.append(function() {return candidateoccupation});
    candidateinfo.append(function() {return candidatevotes});
    


    var fedturnout = fedstatsflex.append("div").classed("FED-turnout", true);
    var fedturnoutpercentage = fedturnout.append("p").classed("FED-stats-percentage", true).html(fedelement.getElementsByTagName("Turnout")[0].childNodes[0].nodeValue + " %");
    var fedturnoutlabel = fedturnout.append("p").classed("FED-stats-label", true).html("TURNOUT");


    var fedcompetition = fedstatsflex.append("div").classed("FED-competition", true);
    var fedcompetitionpercentage = fedcompetition.append("p").classed("FED-stats-percentage", true).html(fedelement.getElementsByTagName("Competitiveness")[0].childNodes[0].nodeValue.slice(0,4));
    var fedcompetitionlabel = fedcompetition.append("p").classed("FED-stats-label", true).html("COMPETITIVENESS");

    createBarChart(raceresultsvg, raceresultdata);
}

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
    var province = queryStringObject().province;
    var fedlist = electionsXML.getElementsByTagName("FED");
    for (var i = fedlist.length - 1; i >= 0; i--) {
        var abbrev = fedlist[i].getElementsByTagName("Province")[0].getAttribute("abbreviation");
        if (abbrev === province) {
            var fedid = fedlist[i].getAttribute("id");
            createFEDListItem(fedid, fedlist[i]);
        }
    }
}


function populateProvincePageData(electionsXML) {
    console.log("populating");
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
    datarowdata.id = id + "-data";
    datarowdata.innerHTML = String(data);

    datarow.append(datarowlabel);
    datarow.append(datarowdata);

    return datarow;
}





function createBarChart(svg, data) {
    var w = 200;
    var h = 120;
    var barpadding = 2;
    var boxsize = 14;
    var boxmargin = 2;
    var barheight = h - boxsize - boxmargin;

    svg.attr("width", w).attr("height", h)
    var groups = svg.selectAll("g").data(data).enter().append("g").classed("histo-bar", true);
    groups.append("rect")
          .classed("histo-bar-bottom", true)
          .attr("x", function(d, i) {return i * w / data.length})
          .attr("y", h - boxsize)
          .attr("width", w / data.length - barpadding)
          .attr("height", boxsize);
    groups.append("rect")
          .classed("histo-bar-top", true)
          .attr("x", function(d, i) {return i * w / data.length})
          .attr("y", function(d) {var max = getMaxOfArray(data.map(function(d) {return d.vote}));return barheight - barheight * d.vote / max})
          .attr("width", w / data.length - barpadding)
          .attr("height", function(d, i) {var max = getMaxOfArray(data.map(function(d) {return d.vote}));return d.vote / max * barheight});
    svg.selectAll("g").each(function(d) {d3.select(this).attr("fill", getRandomColor("brown", 0.3)).on("click", function(d) {updateCandidateInfo(d)})});
}






function updateCandidateInfo(d) {
    var candinfo = d3.select(d3.event.target.parentNode.parentNode.parentNode).select(".candidate-info");
    candinfo.select("#cand-name-data").html(d.name);
    candinfo.select("#cand-votes-data").html(d.vote);
    candinfo.select("#cand-affiliation-data").html(d.affiliation);
    candinfo.select("#cand-occupation-data").html(d.occupation);
}



//*******************************************************************************************
//   FUNCTIONS AND OPTIONS FOR LEAFLET MAP
//*******************************************************************************************


function mapStyle(feature) {
    return {
        fillColor: getRandomColor("brown", .7),
        weight: 1.5,
        opacity: 1,
        color: 'white',
        dashArray: '2',
        fillOpacity: 0.5
    }
}


function mapFeatureMousover(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    mapInfo.update(layer.feature.properties);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}


function mapFeatureMouseout(e) {
    mapGeoJson.resetStyle(e.target);
    mapInfo.update();
}

function mapFeatureClick(e) {
    if (e.target === zoomedToFeature.feature) {
        zoomedToFeature.bool = false;
        zoomedToFeature.feature = null;
        var fedID = e.target.feature.properties.FEDUID;
        var queryString = "?fedid=" + String(fedID);
        var url = encodeURI(siteroot + "/FEDs" + queryString);
        window.location = url;
    } else {
        zoomedToFeature.bool = true;
        zoomedToFeature.feature = e.target;
        provinceMap.fitBounds(e.target.getBounds());
    }
}


function onEachFeature(feature, layer) {
    layer.on({
        mouseover: mapFeatureMousover,
        mouseout: mapFeatureMouseout,
        click: mapFeatureClick
    });
}
