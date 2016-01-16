// Author:James Fehr
// Version: 2
// Project 5: Neighborhood Map aka. "Gelp"
var map;
var loading = ko.observable(false);

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

// Constructor for Model Data
var PlaceData = function(data){
  var PD = this;
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
  PD.id = data.id; // Google Places ID for data lookup
  PD.vis = ko.observable(true); // sets visibility
  PD.name = ko.observable(data.name);
  PD.address = ko.observable(data.address);
  PD.city = ko.observable('Kelowna');
  PD.province = ko.observable('British Columbia');
  PD.location = searchString(data.name + ' ' + data.address) + '+Kelowna+British+Columbia';
  PD.svLoc = searchString(data.address) + '+Kelowna+British+Columbia';
  PD.yelp = ko.observable(0);
  PD.locImg = ko.observable('https://maps.googleapis.com/maps/api/streetview?size=350x150&location=' + this.svLoc + ' width="350px"');
  PD.markerId = ko.observable(0);
  PD.gPlace = ko.observable(0);
  PD.lat = ko.observable(0);
  PD.lng = ko.observable(0);
  PD.visibility = ko.observable(false);
  PD.review_count = ko.observable();
  PD.rating = ko.computed(function() {
    return ((PD.gPlace().rating + PD.yelp().rating)/2);
  }, this);
  PD.gReview = ko.computed(function() {
    return (PD.gPlace().reviews);
  }, this);
  PD.types = ko.computed(function() {
    var tp = [];
    for (var i in PD.gPlace().types){
      tp.push(PD.gPlace().types[i]);
    }
    for (var y in PD.yelp().categories){
      for (var n in PD.yelp().categories[y]){
        tp.push(PD.yelp().categories[y][n]);
      }
    }
    return tp;
  }, this);
  var setVis = function() {
    PD.visibility(!PD.visibility());
  };
  var photos = ko.observableArray([]);
  // Gets URLs for all photos returned by the google details call
  if (typeof(PD.gPlace().photo) !== 'undefined'){
    for (var i in PD.gPlace().photos()) {
      photos().push(PD.gPlace().photos[i].getUrl({
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
      clearTimeout(yTimeout);
    },
    error: function() {
      // Do stuff on fail
      alert('Failed to import Yelp Data. Status: ' + textStatus + ' Error: ' + errorThrown);
    }
  };
  // Set a Timeout for the AJAX Yelp data import
  // {SRC: #006:'https://www.udacity.com/course/viewer#!/c-ud110/l-3310298553/m-3162128592'}
  var yTimeout = setTimeout(function(){
    alert("Yelp appears to be down, please try again later");
  }, 8000);
  $.ajax(settings);
  // End Yelp Call
  PD.contentString = ko.observable('');
  var setYelp = function(clickedPlace){
    for (var x in places()) {
      places()[x].visibility(false);
    }
    PD.visibility(true); // opens panel, shows gelp rating
    google.maps.event.trigger(PD.markerId(),'click');
    map.setCenter(PD.markerId().location);
  };

};
// View Model calls all the things, create *new places* to add them to the model
var ViewModel = function() {
  var self = this;
  // Creates an array of places for use in the app with knockout bindings
  self.places = ko.observableArray([]);
  self.currentYelp = ko.observable();
  self.menu_vis = ko.observable(true);
  pDmodel.forEach(function(pDmItem){
    self.places.push( new PlaceData(pDmItem) );
  });
  self.currentYelp(this.places()[0]);
  self.panelView = ko.computed(function(){
    if (typeof(places)=="function"){
      for (var x = 0; x < places().length; x++){
        if (self.places()[x].visibility()){
          self.currentYelp(self.places()[x]);
          self.currentYelp().visibility(true);
        }
      }
    }
    return self.currentYelp();
  }, this);
  // *******************************************************************
  // Creates the infoWindow based on data in the model for the current marker or menu item
  // Also sets the place as visible, making it's best effort to display as much content as possible
  // {SRC: #003: 'http://jsfiddle.net/bryan_weaver/z3Cdg/'}
  var infoWindow;
  var HandleInfoWindow = function(place, content, index) {
      var position = {
        'lat': place.lat(),
        'lng': place.lng()
      };
      // Checking for business url
      if (place.gPlace().website){
        content += '<div width="350px" class="flex"><div class="flex2"><a href="' + place.gPlace().website + '" class="inf-Win">' + place.name() + '</a><div class="inf-Win">' + place.address() + '</div>';
      } else {
        content += '<div width="350px" class="flex"><div class="flex2"><div class="inf-Win">' + place.name() + '</div><div class="inf-Win">' + place.address() + '</div>';
      }
      // Checking for photos from google place service
      if ((typeof place.gPlace().photos) !== 'undefined'){
        for (var ph in place.gPlace().photos){
          content += '<img src="' + place.gPlace().photos[ph].getUrl({'maxWidth': 350, 'maxHeight': 100}) + '" height="100px" class="images">';
        }
      } else {
        content += '<img src="' + place.locImg() + '" height="100px" class="images">';
      }
      // Checking for reviews from Yelp service
      if ((typeof place.yelp().snippet_text) !== 'undefined') {
        content += '<div class="rev_com">' + place.yelp().snippet_text + '</div><div>Yelp Review Count: '+ place.yelp().review_count +' </div></div>';
      } else{
        content += '</div></div>';
      }
      infoWindow.setContent(content);
      infoWindow.setPosition(position);
      infoWindow.open(map);
      self.places()[index].visibility(true);
      self.menu_vis(false);
      $('#rrr').width((self.places()[index].rating() * 20) + "%");
  };
  // *******************************************************************
  self.user_input = ko.observable('');
  self.filter_address = ko.observable(true);
  self.filter_types = ko.observable(true);
  self.filter_names = ko.observable(true);
  var showApp = function() {
    if(self.places()[0]) loading(true);
  };
  // Reset filter function
  self.resetFilter = function() {
    self.user_input('');
  };
  // String Comparison truthy falsy return for indexOf
  // Takes in 2 strings as parameters, returns true if parameter b is found in parameter a
  var stringFinder = function(a, b) {
    return a.indexOf(b) >=0 ? true : false;
  };

  var createMapMarker = function(obj, p, pname) {
    // The next lines save location data from the search result object to local variables
    var lat = obj.geometry.location.lat();  // latitude from the place service
    var lon = obj.geometry.location.lng();  // longitude from the place service
    var name = pname;   // name of the place from the place service
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
    self.places()[p].markerId(marker);
    // This infoWindow should have a streetview image as well as name of establishment and address but wait, can it have more....?
    // Look at the HandleInfoWindow function to see what it all gets
    var contentString = '';
    infoWindow = new google.maps.InfoWindow({
      maxWidth: 250
    });

    // Adds listener to map markers
    // This listener tells the markers to bounce, show an infoWindow, show yelp data on a panel below the map and
    // adds another listener to the yelpTog which closes both the yelp panel and the infoWindow to avoid clutter
    google.maps.event.addListener(marker, 'click', function(evt) {
      // {SRC: #003: 'http://jsfiddle.net/bryan_weaver/z3Cdg/'}
      // Set up the infoWindow for the current marker
      self.menu_vis(false);
      HandleInfoWindow(self.places()[p], contentString, p);
      // Bounce the current marker until the next marker is clicked
      for (var x in self.places()){
        if (self.places()[x].markerId().getAnimation() !== null) {
          self.places()[x].markerId().setAnimation(null);
        }
      }
      self.places()[p].markerId().setAnimation(google.maps.Animation.BOUNCE);
      self.currentYelp(self.places()[p]); // sets current pushed button as yelp panel info
      self.places()[p].visibility(true);  // Make the information visible
      map.setCenter(marker.location);
    });
    google.maps.event.addListener(infoWindow,'closeclick',function(){
      self.places().forEach(function(place) {
        place.visibility(false);  // Hide the silverware etc and maybe the information too
      });
      self.menu_vis(true);
      map.setCenter(bounds.getCenter());
    });
    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());
  };
  var callback = function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      // Iterates through places to find the index before creating map markers
      for (var i in self.places()){
        if (results.name.toLowerCase() == self.places()[i].name().toLowerCase()){
          // Stores results for later use
          self.places()[i].gPlace(results);
          createMapMarker(results, i, results.name);
          // Creates positional data holder for ease of use
          self.places()[i].lat(results.geometry.location.lat());
          self.places()[i].lng(results.geometry.location.lng());
        }
      }
    } else {
      //***************************************************************************
      // Google Places Error Handling
      alert('Failed to import Google Places data');
      // End of Google Places Error Handling
      //***************************************************************************
    }
  };
  var MapViewModel = function(){
    // {Styles SRC #005: 'https://mapbuildr.com/buildr'}
    var mapOptions = {
      disableDefaultUI: false,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      heading: 0,
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
    for (var p in self.places()) {
      // the search request object
      var request = {
        placeId: self.places()[p].id
      };
      service.getDetails(request, callback);
    }
  };
  MapViewModel();
  // Filters location list for user_input
  self.filterData = ko.computed(function(){
    // Checks user_input to determine if the user has entered any terms, additionally checks places() to determine if the array is populated yet
    // Show all markers if filter is empty
    if ((self.user_input().length === 0) && (self.places().length > 0)) {
      for (var a in self.places()) {
        self.places()[a].vis(true);
        if (self.places()[a].markerId()) {
          self.places()[a].markerId().setMap(map);
        }
      }
    } else if (self.places().length > 0) {
        infoWindow.close();
        self.menu_vis(true);
        for (var c in self.places()){
          self.places()[c].vis(false);
          // Sort through the remaining non-visible markers to find additinoal matches and toggle them visible
          // Types Filter
          if (self.filter_types()) {
            for (var d in self.places()[c].types()){
              if (stringFinder((self.places()[c].types()[d]).toLowerCase(), (self.user_input()).toLowerCase()) && !self.places()[c].vis()) {
                self.places()[c].vis(true);
              }
            }
          }
          // Name Filter
          if (self.filter_names() && (stringFinder((self.places()[c].name()).toLowerCase(), (self.user_input()).toLowerCase()) && !self.places()[c].vis())) {
            self.places()[c].vis(true);
          }
          // Address filter
          if (self.filter_address() && (stringFinder((self.places()[c].address()).toLowerCase(), (self.user_input()).toLowerCase()) && !self.places()[c].vis())) {
            self.places()[c].vis(true);
          }
          // Shows markers if toggled visible
          if (self.places()[c].vis() && self.places()[c].markerId()){
            self.places()[c].markerId().setMap(map);
          } //Hides markers if toggled not visible
          else if (!self.places()[c].vis() && self.places()[c].markerId()) {
            self.places()[c].markerId().setMap(null);
        }
      }
    }
    return self.user_input();
  }, this);
  // Determines orientation of screen, sets the View up for each orientation
  // {SRC: #007: 'http://stackoverflow.com/questions/4917664/detect-viewport-orientation-if-orientation-is-portrait-display-alert-message-ad'}
  self.initZoom = ko.observable(map.getZoom());
  self.windowOrientation = ko.computed(function(){
    var heading = map.getHeading() || 0;
    if (window.matchMedia("(orientation: portrait)").matches) {
   // you're in PORTRAIT mode
      if (self.initZoom() > 1){
        map.setZoom(self.initZoom() - 1);
      }
      map.setHeading(heading + 90);
    }
    if (window.matchMedia("(orientation: landscape)").matches) {
   // you're in LANDSCAPE mode
      map.setZoom(self.initZoom());
      if (heading !== 0) {
        map.setHeading(0);
      }
    }
    return false;
  }, this);

  showApp();
};
