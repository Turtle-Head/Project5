// --------------------------------------------------------------------------------
// Dynamicly Building on what was started with appV2.js
// Rather than building a map from only 5 data points this will build on one location, search out in a 50km radius using googlemaps radar search to pull in many data points for locations and reviews
// of items similar to a user supplied search and filter them based on content type
// --------------------------------------------------------------------------------
// Neighborhood Map Project Continuation
var Loc = function(data) {
  this.address = ko.observable(data.location.address);
  this.city = ko.observable(data.location.city);
  this.disp_addr = ko.observableArray(data.location.display_address);
  this.latLng = {
    'lat': data.location.coordinate.latitude,
    'lng': data.location.coordinate.longitude
  };
  this.phoneNum = ko.observable(data.display_phone);
  this.rating = ko.observable(data.rating);
  this.ratingImg = ko.observable(data.rating_img_url);
  this.snippet = ko.observable(data.snippet_text);
  this.url = ko.observable(data.url);
};

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest(i) {

  var url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + places()[i].gPlace().place_id + '&key=' + GOOGLEMAP_API;

  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  } else {
    places()[i].gData(xhr);
  }

/*  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
  };*/

  xhr.onerror = function() {
    console.log('Woops, there was an error making the request.');
  };

  xhr.send();
}
