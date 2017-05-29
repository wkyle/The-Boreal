$(document).foundation()

var electionsXML; 
loadXML();

function provinceClick(evt) {
    if (Boolean(electionsXML)){
        // var provdict = {AB:"-15", 
        //                 BC:"-20", 
        //                 SK:"-10", 
        //                 MB:"-5", 
        //                 ON:"-2", 
        //                 QC:"10", 
        //                 NS:"12", 
        //                 PE:"-14", 
        //                 NB:"-14", 
        //                 NL:"12", 
        //                 NU:"-6", 
        //                 NT:"-14", 
        //                 YT:"-26"};

        // var name = evt.target.parentElement.id;
        // var svgmap = document.getElementById("province-map").getSVGDocument();
        // var prov = svgmap.getElementById(name);
        // var provbox = prov.getBBox();
        // var x = provbox.x - .05*provbox.width;
        // var y = provbox.y - .05*provbox.height;
        // var dx = provbox.width * 1.1;
        // var dy = provbox.height * 1.1;

        // //adjust rotation to make province look a little more familiar to the eye in isolation
        // prov.setAttribute("transform", "rotate("+
        //     provdict[name]+
        //     " "+
        //     [parseInt(provbox.x + provbox.width/2), parseInt(provbox.y + provbox.height/2)].join(' ')+
        //     ")");
        
        // //zoom viewbox on selected province
        // prov.parentNode.parentNode.setAttribute("viewBox", [x,y,dx,dy].join(' '));

        // //make all other provinces invisible
        // for (var key in provdict) {
        //     if (key != name) {
        //         svgmap.getElementById(key).setAttribute("display", "none")
        //     }
        // }

        // $(".map-container").animate({width: "400px"}, "slow");
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