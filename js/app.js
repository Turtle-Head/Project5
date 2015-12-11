// yelp import //
var ViewModel = {
  nonce_generate: function(){
    var length = 5+(Math.floor(Math.random()*32));
    // SRC #002{'https://blog.nraboy.com/2015/03/create-a-random-nonce-string-using-javascript/'}
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
  importYelp: function(typeTerm, locStr){
    // SRC #001 {'https://discussions.udacity.com/t/im-having-trouble-getting-started-using-apis/13597/2'}
    var yelp_url=YELP_BASE_URL;
    // Set up OAuth to authenticate request
    /**
    * Generates a random number and returns it as a string for OAuthentication
    * @return {string}
    */

    var parameters = {
      oauth_consumer_key: YELP_KEY,
      oauth_token: YELP_TOKEN,
      oauth_nonce: ViewModel.nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version : '1.0',
      callback: 'cb',              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
      // The last 3 items in the parameters variable can be maleable but must be present (I think) and must be encoded with the rest of the items to work properly for the oAuth request (limit is optional, defaults to 20)
      limit: 20,                  // Number of items to return (max limit=20 if you want other results than the first 20 add a start number or check the documentation for more details at: {'https://www.yelp.ca/developers/documentation/v2/overview'})
      term: typeTerm,             // Type of search (art, entertainment, food, business, etc)
      location: locStr            // Location to search
    };

    var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
    parameters.oauth_signature = encodedSignature;

    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
      dataType: 'jsonp',
      success: function(results) {
        // Do stuff with results
        console.log(results);

      },
      error: function() {
        // Do stuff on fail
        console.log('Failed to import Data');
      }
    };
    // Send AJAX query via jQuery library.
    $.ajax(settings);
    // End of source #001
  },
  // Removes spaces from search terms
  searchString: function(e){
    var searchTerm = e;
    // Remove spaces replace with +
    searchTerm = searchTerm.replace(" ", "+");
    searchTerm = searchTerm.replace(", ", "+");
    searchTerm = searchTerm.replace(",", "+");
    searchTerm = searchTerm.replace("++", "+");
    // Return searchTerm for use with the importYelp function
    return(searchTerm);
  },
  gMap: function(obj){
      var locations;
      var mapOptions = {
        disableDefaultUI: true,
        noClear: true
      };
      map = new google.maps.Map(document.querySelector('#map'), mapOptions);
      /*
      locationFinder() returns an array of every location string from the JSONs
      written for bio, education, and work.
      */
      function locationFinder() {
        // initializes an empty array
        var locations = [];
        // adds the single location property from model to the locations array
        locations.push(obj./*('some json variable')[i].*/location);
        return locations;
      }
      /*
      createMapMarker(placeData) reads Google Places search results to create map pins.
      placeData is the object returned from search results containing information
      about a single location.
      */
      function createMapMarker(placeData) {
        // The next lines save location data from the search result object to local variables
        var lat = placeData.geometry.location.lat();  // latitude from the place service
        var lon = placeData.geometry.location.lng();  // longitude from the place service
        var name = placeData.formatted_address;   // name of the place from the place service
        var bounds = window.mapBounds;            // current boundaries of the map window
        // marker is an object with additional data about the pin for a single location
        var marker = new google.maps.Marker({
          map: map,
          position: placeData.geometry.location,
          title: name
        });
        // infoWindows are the little helper windows that open when you click
        // or hover over a pin on a map. They usually contain more information
        // about a location.
        var infoWindow = new google.maps.InfoWindow({
          content: name
        });
        // hmmmm, I wonder what this is about...
        google.maps.event.addListener(marker, 'click', function() {
          // your code goes here!
          infoWindow.open(map,marker);
        });
        // this is where the pin actually gets added to the map.
        // bounds.extend() takes in a map location object
        bounds.extend(new google.maps.LatLng(lat, lon));
        // fit the map to the new marker
        map.fitBounds(bounds);
        // center the map
        map.setCenter(bounds.getCenter());
      }
      /*
      callback(results, status) makes sure the search returned results for a location.
      If so, it creates a new map marker for that location.
      */
      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          createMapMarker(results[0]);
        }
      }
      /*
      pinPoster(locations) takes in the array of locations created by locationFinder()
      and fires off Google place searches for each location
      */
      function pinPoster(locations) {
        // creates a Google place search service object. PlacesService does the work of
        // actually searching for location data.
        var service = new google.maps.places.PlacesService(map);
        // Iterates through the array of locations, creates a search object for each location
        for (var place in locations) {
          // the search request object
          var request = {
            query: locations[place]
          };
          // Actually searches the Google Maps API for location data and runs the callback
          // function with the search results after each search.
          service.textSearch(request, callback);
        }
      }
      // Sets the boundaries of the map based on pin locations
      window.mapBounds = new google.maps.LatLngBounds();
      // locations is an array of location strings returned from locationFinder()
      locations = locationFinder();
      // pinPoster(locations) creates pins on the map for each location in
      // the locations array
      pinPoster(locations);
  },
  importWiki: function(e){
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + e + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){
      console.log("Failed to get wikipedia resources");
    }, 8000);

    $.ajax({
      url: wikiURL,
      dataType: "jsonp",
      //jsonp: "callback",
      success: function( response ){
        // Writes Wiki articles out to page
        var articleList = response[1];
        // Do stuff with the Wiki import
        console.log(articleList);
        // Clear the timeout counter
        clearTimeout(wikiRequestTimeout);
      }
    });
  },

};

var Model = {
  yelpData:{

  },
  mapData:{

  },
  wikiData:{

  }
};

var View = {

};

// Yelp Import Call Needs to be moved to a more appropriate location
//yelp.importYelp(yelp.searchString('art entertainment'),yelp.searchString('the forks winnipeg'));
