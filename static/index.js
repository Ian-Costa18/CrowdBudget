var map, datasource, client, popup, searchInput, resultsPanel, searchInputLength, centerMapOnResults;

//The minimum number of characters needed in the search input before a search is performed.
var minSearchInputLength = 3;

//The number of ms between key strokes to wait before performing a search.
var keyStrokeDelay = 150;

var state_capital_coords = {
    Wisconsin: [-89.5, 44.5],
    West_Virginia: [-80.500000,39.000000],
    Vermont: [-72.699997,44.000000],
    Texas: [-100.000000, 31.000000],
    South_Dakota: [-100.000000, 44.500000],
    Rhode_Island: [-71.500000, 41.700001],
    Oregon: [-120.500000, 44.000000],
    New_York: [-75.000000, 43.000000],
    New_Hampshire: [-71.500000, 44.000000],
    Nebraska: [-100.000000, 41.500000],
    Kansas: [38.500000, -98.000000],
    Mississippi: [-90.000000, 33.000000],
    Illinois: [-89.000000, 40.000000],
    Delaware: [-75.500000, 39.000000],
    Connecticut: [-72.699997, 41.599998],
    Arkansas: [-92.199997, 34.799999],
    Indiana: [-86.126976, 40.273502],
    Missouri: [-92.603760, 38.573936],
    Florida: [-81.760254, 27.994402],
    Nevada: [-117.224121, 39.876019],
    Maine: [-68.972168, 45.367584],
    Michigan: [-84.506836, 44.182205],
    Georgia: [-83.441162, 33.247875],
    Hawaii: [-155.844437, 19.741755],
    Alaska: [-153.369141, 66.160507],
    Tennessee: [-86.660156, 35.860119],
    Virginia: [-78.024902, 37.926868],
    New_Jersey: [-74.871826, 39.833851],
    Kentucky: [-84.270020,37.839333],
    North_Dakota: [-100.437012,47.650589],
    Minnesota: [-94.636230, 46.392410],
    Oklahoma: [-96.921387, 36.084621],
    Montana: [-109.533691, 46.965260],
    Washington: [-120.740135, 47.751076],
    Utah: [-111.950684, 39.419220],
    Colorado: [-105.358887, 39.113014],
    Ohio: [-82.996216, 40.367474],
    Alabama: [-86.902298, 32.318230],
    Iowa: [-93.581543, 42.032974],
    New_Mexico: [-106.018066, 34.307144],
    South_Carolina: [-81.163727, 33.836082],
    Pennsylvania: [-77.194527, 41.203323],
    Arizona: [-111.093735, 34.048927],
    Maryland: [-76.641273, 39.045753],
    Massachusetts: [-71.382439, 42.407211],
    California: [-119.417931, 36.778259],
    Idaho: [-114.742043, 44.068203],
    Wyoming: [-107.290283, 43.075970],
    North_Carolina: [-80.793457, 35.782169],
    Louisiana: [-92.329102, 30.391830]
};

const TO_NAME = 1;
const TO_ABBREVIATED = 2;

var state_name;
var state_budget;

function convertRegion(input, to) {
    var states = [
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['American Samoa', 'AS'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['Armed Forces Americas', 'AA'],
        ['Armed Forces Europe', 'AE'],
        ['Armed Forces Pacific', 'AP'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['District Of Columbia', 'DC'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Guam', 'GU'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Marshall Islands', 'MH'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Northern Mariana Islands', 'NP'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Puerto Rico', 'PR'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['US Virgin Islands', 'VI'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    // So happy that Canada and the US have distinct abbreviations
    var provinces = [
        ['Alberta', 'AB'],
        ['British Columbia', 'BC'],
        ['Manitoba', 'MB'],
        ['New Brunswick', 'NB'],
        ['Newfoundland', 'NF'],
        ['Northwest Territory', 'NT'],
        ['Nova Scotia', 'NS'],
        ['Nunavut', 'NU'],
        ['Ontario', 'ON'],
        ['Prince Edward Island', 'PE'],
        ['Quebec', 'QC'],
        ['Saskatchewan', 'SK'],
        ['Yukon', 'YT'],
    ];

    var regions = states.concat(provinces);

    var i; // Reusable loop variable
    if (to == TO_ABBREVIATED) {
        input = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        for (i = 0; i < regions.length; i++) {
            if (regions[i][0] == input) {
                return (regions[i][1]);
            }
        }
    } else if (to == TO_NAME) {
        input = input.toUpperCase();
        for (i = 0; i < regions.length; i++) {
            if (regions[i][1] == input) {
                return (regions[i][0]);
            }
        }
    }
}

function GetMap() {
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        center: [-98.1856, 38.5567],
        showLogo: false,
        zoom: 4.3,
        view: 'Auto',

        //Add your Azure Maps key to the map SDK. Get an Azure Maps key at https://azure.com/maps. NOTE: The primary key should be used as the key.
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: '<azure maps key>'
        }
    });

    //Store a reference to the Search Info Panel.
    resultsPanel = document.getElementById("results-panel");

    //Add key up event to the search box. 
    searchInput = document.getElementById("search-input");
    //searchInput.addEventListener("keyup", searchInputKeyup);
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === 'Enter') {
            search();
        }
    });

    //Create a popup which we can reuse for each result.
    popup = new atlas.Popup();

    //Wait until the map resources are ready.
    map.events.add('ready', function () {

        //Add the zoom control to the map.
        map.controls.add(new atlas.control.ZoomControl(), {
            position: 'top-right'
        });

        //Create a data source and add it to the map.
        datasource = new atlas.source.DataSource();
        map.sources.add(datasource);

        //Add a layer for rendering the results.
        var searchLayer = new atlas.layer.SymbolLayer(datasource, null, {
            iconOptions: {
                image: 'pin-round-darkblue',
                anchor: 'center',
                allowOverlap: true
            }
        });
        map.layers.add(searchLayer);

        //Add a click event to the search layer and show a popup when a result is clicked.
        map.events.add("click", searchLayer, function (e) {
            //Make sure the event occurred on a shape feature.
            if (e.shapes && e.shapes.length > 0) {
                showPopup(e.shapes[0]);
            }
        });
    });
}
/*
function searchInputKeyup(e) {
    centerMapOnResults = false;
    if (searchInput.value.length >= minSearchInputLength) {
        if (e.keyCode === 13) {
            centerMapOnResults = true;
        }
        //Wait 100ms and see if the input length is unchanged before performing a search. 
        //This will reduce the number of queries being made on each character typed.
        setTimeout(function () {
            if (searchInputLength == searchInput.value.length) {
                search();
            }
        }, keyStrokeDelay);
    } else {
        resultsPanel.innerHTML = '';
    }
    searchInputLength = searchInput.value.length;
}
*/

function search() {
    //Remove any previous results from the map.
    datasource.clear();
    popup.close();
    resultsPanel.innerHTML = '';

    //Use SubscriptionKeyCredential with a subscription key
    var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());

    //Use subscriptionKeyCredential to create a pipeline
    var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);

    //Construct the SearchURL object
    var searchURL = new atlas.service.SearchURL(pipeline);

    var search = document.getElementById("search-input").value;
    //var query = [-89.500, 44.500]
    //var query = state_capital_coords.Vermont
    //var query = "wisconson"
    //console.log(search);
    
    for (state in state_capital_coords) {
        search_rev = search.replace(" ", "_")
        console.log(search_rev)
        // if search is state name
        if (search_rev == state.toLowerCase()) {
            query = state_capital_coords[state];
            searchURL.searchAddressReverse(atlas.service.Aborter.timeout(10000), query, {
                //countrySet: ['US'],
                // countrySecondarySubdivision: <statename>,
                //lon: map.getCamera().center[0],
                //lat: map.getCamera().center[1],
                //maxFuzzyLevel: 2,
                //limit: 1,
                view: 'Auto'
            }).then((results) => {

                //Extract GeoJSON feature collection from the response and add it to the datasource
                var data = results.geojson.getFeatures();
                datasource.add(data);

                // center map on results
                map.setCamera({
                    bounds: data.bbox,
                    maxZoom: 5
                });
                

                //console.log(data);
                //Create the HTML for the results list.
                /*
                var html = [];
                for (var i = 0; i < data.features.length; i++) {
                    var r = data.features[i];
                    html.push('<li onclick="itemClicked(\'', r.id, '\')" onmouseover="itemHovered(\'', r.id, '\')">')
                    html.push('<div class="title">');
                    if (r.properties.poi && r.properties.poi.name) {
                        html.push(r.properties.poi.name);
                    } else {
                        html.push(r.properties.address.freeformAddress);
                    }
                    html.push('</div><div class="info">', r.properties.type, ': ', r.properties.address.freeformAddress, '</div>');
                    if (r.properties.poi) {
                        if (r.properties.phone) {
                            html.push('<div class="info">phone: ', r.properties.poi.phone, '</div>');
                        }
                        if (r.properties.poi.url) {
                            html.push('<div class="info"><a href="http://', r.properties.poi.url, '">http://', r.properties.poi.url, '</a></div>');
                        }
                    }
                    html.push('</li>');
                    resultsPanel.innerHTML = html.join('');
                }
                */
            });

            var stateAbbr = convertRegion(search, TO_ABBREVIATED);
            // get request for budget info: <ip address>/budgets?loc=stateAbbr
            console.log(stateAbbr);
            state_name = stateAbbr
            budget_req = `http://localhost:5000/budgets?location=${stateAbbr}`;
            console.log(budget_req);
            
            var client = new HttpClient();
            client.get(budget_req, function(response) {
                resp = JSON.parse(response);
                console.log(resp);
                state_budget = resp;
            });
            break;
        }
    }
}

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

function itemHovered(id) {
    //Show a popup when hovering an item in the result list.
    var shape = datasource.getShapeById(id);
    showPopup(shape);
}
function itemClicked(id) {
    //Center the map over the clicked item from the result list.
    var shape = datasource.getShapeById(id);
    map.setCamera({
        center: shape.getCoordinates(),
        zoom: 17
    });
}
function showPopup(shape) {
    var properties = shape.getProperties();
    //Create the HTML content of the POI to show in the popup.
    var html = ['<div class="poi-box">'];

    //Add a title section for the popup.
    html.push('<div class="poi-title-box"><b>');
    html.push(state_name)
    /*
    if (properties.poi && properties.poi.name) {
        html.push(properties.poi.name);
    } else {
        html.push(properties.address.freeformAddress);
    }*/
    html.push('</b></div>');

    //Create a container for the body of the content of the popup.
    html.push('<div class="poi-content-box">');
    //html.push('<div class="info location">', state_budget, '</div>');
    //html.push('<div class="info location">');
    html.push('<ul class="budget_list">');
    for (item in state_budget) {
        str = ['<li>', item, ':', state_budget[item], '</li>']
        console.log(str)
        html.push('<li>');
        html.push(item, ": $", state_budget[item]);
        html.push('</li>');
        //html.push('<li>', item, ':', state_budget[item], '</li>');
        //html.push
    };
    html.push('</ul>');
    html.push('</div>');
    /*if (properties.poi) {
        if (properties.poi.phone) {
            html.push('<div class="info phone">', properties.phone, '</div>');
        }
        if (properties.poi.url) {
            html.push('<div><a class="info website" href="http://', properties.poi.url, '">http://', properties.poi.url, '</a></div>');
        }
    }*/
    html.push('</div></div>');
    popup.setOptions({
        position: shape.getCoordinates(),
        content: html.join('')
    });
    popup.open(map);
}