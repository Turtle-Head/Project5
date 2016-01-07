// Author:James Fehr
// Version: 2
// Project 5: Neighborhood Map aka. "Gelp"
var map;
var pDmodel = [
  {
    'name': 'Bohemian Cafe & Catering Company',
    'address': '524 Bernard Ave',
    'id': 'ChIJNR-8ZKj0fVMRUTly1t01rtc'
  },
  {
    'name': 'Mad Mango Cafe',
    'address': '551 Bernard Ave',
    'id': 'ChIJ0RjRaaj0fVMRJtulviLYwuo'
  },
  {
    'name': 'The Bean Scene Coffee House',
    'address': '274 Bernard Ave',
    'id': 'ChIJB2yMA6b0fVMRIk_JoBlIjxg'
  },
  {
    'name': 'Mosaic Books',
    'address': '411 Bernard Ave',
    'id': 'ChIJ_1Wqnqj0fVMRoYgRc9oy_Zg'
  },
  {
    'name': 'The Royal Anne Hotel',
    'address': '348 Bernard Ave',
    'id': 'ChIJK-KSIKb0fVMRqeg_8E-UyK0'
  }
];
// Removes spaces from search terms
var searchString = function(e) {
  // Remove spaces replace with +
  for (var x in e){
    e = e.replace(' ', '+');
    e = e.replace(', ', '+');
    e = e.replace(',', '+');
    e = e.replace('++', '+');
  }
    // Return e for use with the import data functions
  return(e);
};
// Constructor for Model Data
var PlaceData = function(data){
  var PD = this;
  this.id = data.id; // Google Places ID for data lookup
  this.vis = ko.observable(true); // sets visibility
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.city = ko.observable('Kelowna');
  this.province = ko.observable('British Columbia');
  this.location = searchString(data.name + ' ' + data.address) + '+Kelowna+British+Columbia';
  this.svLoc = searchString(data.address) + '+Kelowna+British+Columbia';
  this.yelp = ko.observable(0);
  this.locImg = ko.observable('https://maps.googleapis.com/maps/api/streetview?size=350x150&location=' + this.svLoc + ' width="350px"');
  this.markerId = ko.observable(0);
  this.gPlace = ko.observable(0);
  this.lat = ko.observable(0);
  this.lng = ko.observable(0);
  this.visibility = ko.observable(false);
  this.rating = ko.computed(function() {
    return ((this.gPlace().rating + this.yelp().rating)/2);
  }, this);
  this.types = ko.computed(function() {
    var tp = [];
    for (var i in this.gPlace().types){
      tp.push(this.gPlace().types[i]);
    }
    for (var y in this.yelp().categories){
      for (var n in this.yelp().categories[y]){
        tp.push(this.yelp().categories[y][n]);
      }
    }
    return tp;
  }, this);
  var photos = ko.observableArray([]);
  // Gets URLs for all photos returned by the google details call
  if (typeof(this.gPlace().photo) !== 'undefined'){
    for (var i in this.gPlace().photos()) {
      photos().push(this.gPlace().photos[i].getUrl({
        'maxWidth': 350,
        'maxHeight': 100
      }));
    }
  }
  //Begin Yelp Call
  // Randomize the nonce generator randomly
  var randomizeN;
  for (var count = 0; count < Math.floor(Math.random() * Math.floor(Math.random() * 20)); count++){
    randomizeN = nonce_generate();
  }
  // SRC #001 {'https://discussions.udacity.com/t/im-having-trouble-getting-started-using-apis/13597/2'}
  var yelp_url=YELP_BASE_URL;
  var parameters = {
    oauth_consumer_key: YELP_KEY,
    oauth_token: YELP_TOKEN,
    oauth_nonce: nonce_generate(),
    oauth_timestamp: Math.floor(Date.now()/1000),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version : '1.0',
    callback: 'cb',              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    limit: 1,                  // Number of items to return (max limit=20 if you want other results than the first 20 add a start number or check the documentation for more details at: {'https://www.yelp.ca/developers/documentation/v2/overview'})
    term: data.name + ' ' + 'Kelowna',
    location: data.address,
    id: data.name + ' ' + 'Kelowna',
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
      // Pass Yelp Object out to the parent object
      PD.yelp(results.businesses[0]);
    },
    error: function() {
      // Do stuff on fail
      alert('Failed to import Yelp data');
    }
  };
  $.ajax(settings);
  // End Yelp Call
  this.contentString = ko.observable('');


  this.setYelp = function(clickedPlace){
    self.currentYelp(clickedPlace); // sets current pushed button as yelp panel info
    set_visible(); // opens panel, shows gelp rating
    google.maps.event.trigger(this.markerId(),'click');
  };
};
// View Model calls all the things, create *new places* to add them to the model
var ViewModel = function() {
  var self = this;
  // Creates an array of places for use in the app with knockout bindings
  this.places = ko.observableArray([]);
  pDmodel.forEach(function(pDmItem){
    self.places.push( new PlaceData(pDmItem) );
  });
  // Show Data Model in console for dev purposes
  console.log('Places Model:');
  console.log(self.places());
  this.user_input = ko.observable("");
  this.currentYelp = ko.observable(this.places()[0]);
  MapViewModel();
  // Filters location list for user_input
  this.filterData = ko.computed(function(){
    // Checks user_input to determine if the user has entered any terms, additionally checks places() to determine if the array is populated yet
    // Show all markers if filter is empty
    if ((user_input().length === 0) && (places().length > 0)) {
      for (var a in places()) {
        places()[a].vis(true);
        if (places()[a].markerId()) {
          places()[a].markerId().setMap(map);
        }
      }
    } else if (places().length > 0) {
        for (var c in places()){
          // Quick search for any input matches, toggles marker visible if found and not visible if not found
          if (user_input() in oc(places()[c].types())){
            self.places()[c].vis(true);
          } else if (user_input() in oc(places()[c].name())){
            self.places()[c].vis(true);
          } else {
            self.places()[c].vis(false);
          }
          // Sort through the remaining non-visible markers to find additinoal matches and toggle them visible
          for (var d in places()[c].types()){
            if (stringFinder((self.places()[c].types()[d]).toLowerCase(), (user_input()).toLowerCase()) && !places()[c].vis()) {
              self.places()[c].vis(true);
            }
          }
          if (stringFinder((self.places()[c].name()).toLowerCase(), (user_input()).toLowerCase()) && !places()[c].vis()) {
            self.places()[c].vis(true);
          }
          if (stringFinder((self.places()[c].address()).toLowerCase(), (user_input()).toLowerCase()) && !places()[c].vis()) {
            self.places()[c].vis(true);
          }
          // Shows markers if toggled visible
          if (places()[c].vis() && places()[c].markerId()){
            self.places()[c].markerId().setMap(map);
          } //Hides markers if toggled not visible
          else if (!places()[c].vis() && places()[c].markerId()) {
            self.places()[c].markerId().setMap(null);
        }
      }
    }
    return user_input();
  }, this);
};
var resetFilter = function() {
  user_input('');
};

var set_hidden = function() {
  currentYelp().visibility(false);
  infoWindow.close();
};

var set_visible = function() {
  currentYelp().visibility(true);
};

// String Comparison truthy falsy return for indexOf
// Takes in 2 strings as parameters, returns true if parameter b is found in parameter a
var stringFinder = function(a, b) {
  if (a.indexOf(b) >= 0) {
    return true;
  } else return false;
};
// nonce_generate is needed for Yelp to use oAuth correctly
var nonce_generate = function(){
  var length = (Math.floor(Math.random() * 32)) + (Math.floor(Math.random() * 32));
  // SRC #002{'https://blog.nraboy.com/2015/03/create-a-random-nonce-string-using-javascript/'}
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
// Converts an array into an Object for string comparison
// How to use: if( name in oc(['bobby', 'sue','smith']) ) { ... }
// {SRC #004: 'http://snook.ca/archives/javascript/testing_for_a_v'}
var oc = function(a) {
  var o = {};
  for(var i=0;i<a.length;i++) {
    o[a[i]]='';
  }
  return o;
};
// Map stuff
// {SRC: #003: 'http://jsfiddle.net/bryan_weaver/z3Cdg/'}
var infoWindow;
// Creates the infoWindow based on data in the model, shows the marker
var HandleInfoWindow = function(place, content) {
    var position = {
      'lat': place.lat(),
      'lng': place.lng()
    };
    // Checking for business url
    if (place.gPlace().website){
      content += '<div width="400"><a href="' + place.gPlace().website + '" class="inf-Win">' + place.name() + '</a><div class="inf-Win">' + place.address() + '</div>';
    } else {
      content += '<div width="400"><div class="inf-Win">' + place.name() + '</div><div class="inf-Win">' + place.address() + '</div>';
    }
    // Checking for photos from google place service
    if ((typeof place.gPlace().photos) !== 'undefined'){
      content += '<img src="' + place.gPlace().photos[0].getUrl({'maxWidth': 350, 'maxHeight': 100}) + '" class="images">';
    } else {
      content += '<img src="' + place.locImg() + '" class="images">';
    }
    // Checking for reviews from google place service
    if (place.gPlace().reviews.length > 0) {
      content += '<div class="rev_com">' + place.gPlace().reviews[0].text + '</div></div>';
    } else{
      content += '</div>';
    }
    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    infoWindow.open(map);
    set_visible();
};
var callback = function(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // Iterates through places to find the index before creating map markers
    for (var i in places()){
      if (results.name.toLowerCase() == places()[i].name().toLowerCase()){
        // Stores results for later use
        places()[i].gPlace(results);
        createMapMarker(results, i);
        // Creates positional data holder for ease of use
        places()[i].lat(results.geometry.location.lat());
        places()[i].lng(results.geometry.location.lng());
      }
    }
  } else {
    alert('Failed to import Google Places data');
    console.log(status);
  }
};
var createMapMarker = function(obj, p) {
  // The next lines save location data from the search result object to local variables
  var lat = obj.geometry.location.lat();  // latitude from the place service
  var lon = obj.geometry.location.lng();  // longitude from the place service
  var name = obj.formatted_address;   // name of the place from the place service
  var bounds = window.mapBounds;            // current boundaries of the map window
  // marker is an object with additional data about the pin for a single location
  var icn = 'img/marker3.png';
  var marker = new google.maps.Marker({
    map: map,
    position: obj.geometry.location,
    animation: google.maps.Animation.DROP,
    title: name,
    icon: icn
  });
  places()[p].markerId(marker);
  // This infoWindow should have a streetview image as well as name of establishment and address but wait, can it have more....?
  // Look at the HandleInfoWindow function to see what it all gets
  var contentString = '';
  infoWindow = new google.maps.InfoWindow();

  // Adds listener to map markers
  // This listener tells the markers to bounce, show an infoWindow, show yelp data on a panel below the map and
  // adds another listener to the yelpTog which closes both the yelp panel and the infoWindow to avoid clutter
  google.maps.event.addListener(marker, 'click', function(evt) {
    HandleInfoWindow(places()[p], contentString); // {SRC: #003: 'http://jsfiddle.net/bryan_weaver/z3Cdg/'}
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    self.currentYelp(places()[p]); // sets current pushed button as yelp panel info
    set_visible();
  });
  google.maps.event.addListener(infoWindow,'closeclick',function(){
    set_hidden();
  });
  // this is where the pin actually gets added to the map.
  // bounds.extend() takes in a map location object
  bounds.extend(new google.maps.LatLng(lat, lon));
  // fit the map to the new marker
  map.fitBounds(bounds);
  // center the map
  map.setCenter(bounds.getCenter());
};

var MapViewModel = function(){
  // {Styles SRC #005: 'https://mapbuildr.com/buildr'}
  var mapOptions = {
    disableDefaultUI: false,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    scrollwheel: false,
    scaleControl: false,
    zoomControl: false,
    styles: [
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#193341" }]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{ "color": "#2c5a71" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#29768a"},{"lightness": -37 }]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#406d80" }]
      },
      {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [{ "color": "#406d80" }]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [{ "visibility": "on" },{ "color": "#3e606f" },{ "weight": 2 },{ "gamma": 0.84 }]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#ffffff" }]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "weight": 0.6 },{ "color": "#1a3541" }]
      },
      {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#2c5a71" }]
      }
    ]
  };
  map = new google.maps.Map(document.querySelector('#map'), mapOptions);
  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();
  // Place Service for the getDetails google maps call
  var service = new google.maps.places.PlacesService(map);
  // Iterates through the array of locations, creates a search object for each location
  for (var p in places()) {
    // the search request object
    var request = {
      placeId: places()[p].id
    };
    service.getDetails(request, callback);
  }
};

// Loads map and other content
ko.applyBindings(ViewModel());
