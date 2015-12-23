// Removes spaces from search terms
function searchString(e) {
  // Remove spaces replace with +
  for (var x in e){
    e = e.replace(" ", "+");
    e = e.replace(", ", "+");
    e = e.replace(",", "+");
    e = e.replace("++", "+");
  }
    // Return e for use with the import data functions
  return(e);
}
// Constructor for Model Data

function PlaceData(name, address){
  var self = this;

  self.name = ko.observable(name);
  self.address = ko.observable(address);
  self.city = ko.observable('Kelowna');
  self.province = ko.observable('British Columbia');
  self.location = searchString(self.address()) + '+Kelowna+British+Columbia';
  self.yelp = ko.observable(0);
  self.contentString = ko.observable('<div>' + self.name() + '</div>');
  // Attempting to do the Yelp import from the constructor function to use the data here


  // Randomize the nonce generator randomly

  var randomizeN;
  for (var count = 0; count < Math.floor(Math.random() * Math.floor(Math.random() * 20)); count++){
    randomizeN = nonce_generate();
  }
  // SRC #001 {'https://discussions.udacity.com/t/im-having-trouble-getting-started-using-apis/13597/2'}
  var yelp_url=YELP_BASE_URL;
  // Set up OAuth to authenticate request
  /**
  * Generates a random number and returns it as a string for OAuthentication
  * @return {string}
  */
  var yd_out;
  var parameters = {
    oauth_consumer_key: YELP_KEY,
    oauth_token: YELP_TOKEN,
    oauth_nonce: nonce_generate(),
    oauth_timestamp: Math.floor(Date.now()/1000),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version : '1.0',
    callback: 'cb',              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    // The last 3 items in the parameters variable can be maleable but must be present (I think) and must be encoded with the rest of the items to work properly for the oAuth request (limit is optional, defaults to 20)
    limit: 1,                  // Number of items to return (max limit=20 if you want other results than the first 20 add a start number or check the documentation for more details at: {'https://www.yelp.ca/developers/documentation/v2/overview'})
    term: name + ' ' + 'Kelowna',             // Type of search (art, entertainment, food, business, etc)
    location: address,            // Location to search
    id: name + ' ' + 'Kelowna',
    city: 'Kelowna',
    province: 'British Columbia',
    cc: 'CA'
  };

  var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
  parameters.oauth_signature = encodedSignature;

  var settings = {
    url: yelp_url,
    data: parameters,
    cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
    dataType: 'jsonp',
    success: function(results) {
      // Create Yelp Object in the constructor
      self.yelp(results.businesses[0]);
      //self.contentString(self.contentString() + '<div class="flex">');
      self.contentString(self.contentString() + '<div class="flex"><img src="https://maps.googleapis.com/maps/api/streetview?size=350x150&location=' + searchString(results.businesses[0].location.address[0]) + 'Kelowna+British+Columbia" width="350px"><img src="' + results.businesses[0].image_url + '" height="150px"><img src="' + results.businesses[0].snippet_image_url + '" height="150px"></div></div><div class="flex"><div width="350px"><ul><li>');
      self.contentString(self.contentString() + '<address>' + results.businesses[0].location.display_address[0] + '<br>' + results.businesses[0].location.display_address[1] + '</address></li>'+ '<li>' + results.businesses[0].display_phone + '</li><li>Rating: ' + results.businesses[0].rating + '</li></ul></div>');
      self.contentString(self.contentString() + '<div padding="5px"><img padding="15px" src="' + results.businesses[0].rating_img_url + '" width="150px"></div><div width="100px">' + results.businesses[0].snippet_text + '</div></div>');
    },
    error: function() {
      // Do stuff on fail
      console.log('Failed to import Data');
    }
  };
  $.ajax(settings);

  // End of Yelp
  console.log('ID: ');
  console.log(self.yelp()['id']);
  //self.contentString(self.contentString() + '<div>Rating: ' + self.yelp.rating + '</div>');

}
// View Model calls all the things, create *new places* to add them to the model
function ViewModel() {
  var self = this;

  self.places = ko.observableArray([
    new PlaceData('The Grateful Fed Pub', '509 Bernard Ave'),
    new PlaceData('Mad Mango Cafe', '551 Bernard Ave'),
    new PlaceData('Bean Scene Downtown', '274 Bernard Ave'),
    new PlaceData('Mosaic Books', '411 Bernard Ave'),
    new PlaceData('Doc Willoughby\'s Public House', '353 Bernard Ave'),
    new PlaceData('Landmark Cinemas Paramount', '261 Bernard Ave'),
    new PlaceData('Fernando\'s Pub', '279 Bernard Ave')
  ]);
  console.log('Places Model:');
  console.log(self.places());
  initializeMap();
  $('infoWindow').each($('address').each(function() {
    var text = $(this).text();

    var q    = $.trim(text).replace(/\r?\n/, ',').replace(/\s+/g, ' ');
    var link = '<a href="http://maps.google.com/maps?q=' + encodeURIComponent(q) + '" target="_blank"></a>';

    return $(this).wrapInner(link);
  }));
  $('body').append('<div class="flex" align="center"><a href="http://maps.google.com"><img src="http://www.userlogos.org/files/logos/48414_v-toll/google_maps_logo.png?1428672032" height="75px"></a>   <a href="http://yelp.com"><img src="https://s3-media1.fl.yelpcdn.com/assets/srv0/www_pages/43ed502d1f6e/assets/img/brand_guidelines/yelp-2c.png" height="75px"></a></div>');
}

// Not sure how much of this is extra fluff, TODO: rebuild this portion using knockout
// Yelp stuff

// nonce_generate is needed for Yelp to use oAuth correctly
function nonce_generate(){
  var length = (Math.floor(Math.random() * 32)) + (Math.floor(Math.random() * 32));
  // SRC #002{'https://blog.nraboy.com/2015/03/create-a-random-nonce-string-using-javascript/'}
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


// Map stuff

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // Iterates through places to find the index before creating map markers
    for (var i in places()){
      if (results[0].name.toLowerCase() == places()[i].address().toLowerCase()){
        createMapMarker(results[0], i);
      }
    }
  }
}
function createMapMarker(obj, p) {
  // The next lines save location data from the search result object to local variables
  var lat = obj.geometry.location.lat();  // latitude from the place service
  var lon = obj.geometry.location.lng();  // longitude from the place service
  var name = obj.formatted_address;   // name of the place from the place service
  var bounds = window.mapBounds;            // current boundaries of the map window
  // marker is an object with additional data about the pin for a single location
  var marker = new google.maps.Marker({
    map: map,
    position: obj.geometry.location,
    title: name
  });
  // infoWindows are the little helper windows that open when you click
  // or hover over a pin on a map. They usually contain more information
  // about a location.

  // Start of TODO Area
  // TODO: data-bind some data from the placeData from the yelp import and figure out why this stuff isn't working
  // TODO: fix redundant creation of yelp model data
  // ----------------
  var cc;




  // The output needs images from the Yelp Data Pull ARGGGGHHHH!!!!
  var contentString = places()[p].contentString();

  // ----------------
  // END OF TODO Area

  var infoWindow = new google.maps.InfoWindow({
    content: contentString
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
function pinPoster() {
  // creates a Google place search service object. PlacesService does the work of
  // actually searching for location data.
  var service = new google.maps.places.PlacesService(map);
  // Iterates through the array of locations, creates a search object for each location
  for (var p in places()) {
    // the search request object
    var request = {
      query: places()[p].location
    };
    // Actually searches the Google Maps API for location data and runs the callback
    // function with the search results after each search.
    service.textSearch(request, callback);
  }
}
function initializeMap(){


    var mapOptions = {
      disableDefaultUI: false,
      noClear: true
    };
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);

    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();

    // pinPoster() creates pins on the map for each location in
    // the places array.

    pinPoster();
}

// Loads map and other content
ko.applyBindings(ViewModel());
