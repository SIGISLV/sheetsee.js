var app = function() {
    var map,
        geojsonLayer,
        tabletop;

    // To get geo behaviour, you must have :
    // * both lat && long fields
    // * a polygon field
    // * both latitude and longitude
    // * both geolatitude and geolongitude
    // * a linestring field
    // * a multipolygon field

    // For symbolization, it relies on https://github.com/mapbox/simplestyle-spec
    // Only color is configurable using an hexcolor field

    var showInfo = function(sheetname) {
        return function(data) {
            var optionsJSON = ["afficheur", "nom", "adresse", "commune"];
            var template = "<ul>" +
                "<li><h4>{{afficheur}}</h4></li>" +
                "<li>{{nom}}</li>" +
                "<li>{{adresse}}</li>" +
                "<li>{{commune}}</li>" +
                "</ul>";

            if (sheetname != undefined) {
                data = data[sheetname].elements;
            } else {
                var intermediatedata = [];
                // Only possible to correctly loop due to same data structure in the different sheets 
                // Should change optionsJSON otherwise
                for (var sheet in data) {
                    var intermediatedata = intermediatedata.concat(data[sheet].elements);
                }
                data = intermediatedata;
            }

            var geoJSON = Sheetsee.createGeoJSON(data, optionsJSON);
            geojsonLayer = Sheetsee.addMarkerLayer(geoJSON, map, template);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        map = Sheetsee.loadMap("map");
        
        map.touchZoom.enable()
        map.doubleClickZoom.enable()
        map.scrollWheelZoom.enable()
        /*, {
            touchZoom: true,
            tap: true,
            scrollWheelZoom: true,
            doubleClickZoom: true
        });
        */
        // Removed below because need a reference to a mapbox map instead of a simple URL
        // test = Sheetsee.addTileLayer(map, 'examples.map-20v6611k');
        var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
        var tileLayer = new L.TileLayer(osmUrl, {
            attribution: osmAttrib
        });
        tileLayer.addTo(map);

        var URL = "1kJXeT7UhunqxBxWEIKMQnoOV1UgXQFeChHqPQol4Yv0";
        //var URL = "1wmVzpalqTLOEPnOs97KWex3GVPqiNCx84zn4Dbw7eF4";
        tabletop = Tabletop.init({
            key: URL,
            callback: showInfo()
        });
    });

    var replaceGeojsonLayer = function(sheet) {
        map.removeLayer(geojsonLayer);
        // Change callback
        tabletop.callback = showInfo(sheet);
        // Execute manually the new callback (so not any call to remote content again)
        tabletop.doCallback();
    }

    // manage options onchange event
    document.getElementById('filter_by_sheet').addEventListener(
        'change',
        function(a) {
            if (this.value != 'tous') {
                replaceGeojsonLayer(this.value);
            } else {
                replaceGeojsonLayer();
            }
        },
        false
    );
}();