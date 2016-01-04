// Author:James Fehr
// Date:December 29, 2015  Edit: Ongoing
// Project 5: Neighborhood Map
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
  this.gData = ko.observable(0);
  this.lat = ko.observable(0);
  this.lng = ko.observable(0);
  this.rating = ko.computed(function() {
    return ((this.gData().rating + this.yelp().rating)/2);
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
  this.contentString = ko.observable('<div>' + this.name() + '</div><div class="address" id="' + this.id + '">' + this.address() + '</div>');
  if(this.gData().photo){
    this.photo = ko.computed(function() {
      var url = this.gData().photos[0].getUrl({'maxWidth': 350, 'maxHeight': 100});
      return url;
    }, this);
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
      console.log('Failed to import Data');
    }
  };
  $.ajax(settings);
  // End Yelp Call

  this.setYelp = function(clickedPlace){
    self.currentYelp(clickedPlace); // sets current pushed button as yelp panel info
    $('#yelp').show();  // show Yelp Panel
    $('#yelpTog').click(function(){
      $('#yelp').hide();
    });
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
  this.filterData = ko.observable('');
  this.currentYelp = ko.observable(this.places()[0]);
  $('#yelp').hide();
  initializeMap();
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
// Marker functions *********************************
// Checks types array in the places array for places matching the filter terms
// If matched, the place is pushed into a marker array for the map
var filter_data = function(){
  var markers = [];
  if (filterData()) {
    for (var c in places()){
      if (filterData() in oc(places()[c].types())){
        markers.push(places()[c]);
      } else {
        if (filterData() in oc(places()[c].name())){
          markers.push(places()[c]);
        }
      }
    }
    clearMarkers();
    disp_filter(markers);
  } else {
    showMarkers();
  }
};

// Set marker array on map
var disp_filter = function(markers){
  for (var i in markers){
    markers[i].markerId().setMap(map);
  }
};

// Sets the map on all markers in the array.
var setMapOnAll = function(map) {
  for (var i in places()) {
    places()[i].markerId().setMap(map);
  }
};

// Removes the markers from the map, but keeps them in the array.
var clearMarkers = function() {
  setMapOnAll(null);
};

// Shows any markers currently in the array.
var showMarkers = function() {
  setMapOnAll(map);
};
// End Marker Functions *********************************
// {SRC: #003: 'http://jsfiddle.net/bryan_weaver/z3Cdg/'}
var infoWindow;

var HandleInfoWindow = function(place, content) {
    var position = {
      'lat': place.lat(),
      'lng': place.lng()
    };
    content += '<div class="g-rate">Gelp rating: ' + place.rating() + '</div>';
    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    infoWindow.open(map);
};
// *********************************************
var callback = function(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // Iterates through places to find the index before creating map markers
    for (var i in places()){
      if (results[0].name.toLowerCase() == places()[i].name().toLowerCase()){
        createMapMarker(results[0], i);
        places()[i].gPlace(results[0]);
        places()[i].lat(results[0].geometry.location.lat());
        places()[i].lng(results[0].geometry.location.lng());
        places()[i].gData({
          'photos': results[0].photos,
          'rating': results[0].rating
        });
      }
    }
  }
};
var createMapMarker = function(obj, p) {
  // The next lines save location data from the search result object to local variables
  var lat = obj.geometry.location.lat();  // latitude from the place service
  var lon = obj.geometry.location.lng();  // longitude from the place service
  var name = obj.formatted_address;   // name of the place from the place service
  var bounds = window.mapBounds;            // current boundaries of the map window
  // marker is an object with additional data about the pin for a single location
  var icn = 'img/marker.png';
  var marker = new google.maps.Marker({
    map: map,
    position: obj.geometry.location,
    animation: google.maps.Animation.DROP,
    title: name,
    icon: icn
  });
  places()[p].markerId(marker);
  // infoWindows are the little helper windows that open when you click
  // or hover over a pin on a map. They usually contain more information
  // about a location.
  // This infoWindow should have a streetview image as well as name of establishment and address
  var contentString = places()[p].contentString() + '<img src="' + places()[p].locImg() + '">';
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
    $('#yelp').show();
    $('#yelpTog').click(function(){
      $('#yelp').hide();
      infoWindow.close(map,marker);
      if (marker.getAnimation() !== null){
        marker.setAnimation(null);
      }
    });
  });
  google.maps.event.addListener(infoWindow,'closeclick',function(){
   $('#yelp').hide();
  });
  // this is where the pin actually gets added to the map.
  // bounds.extend() takes in a map location object
  bounds.extend(new google.maps.LatLng(lat, lon));
  // fit the map to the new marker
  map.fitBounds(bounds);
  // center the map
  map.setCenter(bounds.getCenter());
};
var pinPoster = function() {
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
    //service.getDetails(request, callback);
    service.textSearch(request, callback);
  }
};
var initializeMap = function(){
    var mapOptions = {
      disableDefaultUI: false,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      scrollwheel: false,
      scaleControl: false,
      zoomControl: false
    };
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);


    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();
    // pinPoster() creates pins on the map for each location
    pinPoster();
};

// Loads map and other content
ko.applyBindings(ViewModel());
