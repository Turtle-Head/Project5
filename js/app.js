// yelp import //
var yelp = {
  importYelp: function(request){
    var yelp_url=YELP_BASE_URL+request;
    // Set up OAuth to authenticate request
    // Begin SRC #001
    /** {SRC: https://discussions.udacity.com/t/im-having-trouble-getting-started-using-apis/13597/2}
     * Generates a random number and returns it as a string for OAuthentication
     * @return {string}
     */
    function nonce_generate() {
      return (Math.floor(Math.random() * 1e12).toString());
    }

    var parameters = {
      oauth_consumer_key: YELP_KEY,
      oauth_token: YELP_TOKEN,
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version : '1.0',
      callback: 'cb'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
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
  // Defines YELP search string to pass into the importYelp function
  searchString: function(loc, spec){
    // Check input variables to see what has been sent
    var searchTerm;
    if (loc && spec){
      searchTerm = 'term=' + spec + '&location='+loc;
    } else if (loc){
      searchTerm = '?location=' + loc;
    } else {
      console.log('Error in request');
      return(null);
    }
    // Remove spaces replace with +
    searchTerm = searchTerm.replace(" ", "+");
    searchTerm = searchTerm.replace(", ", "+");
    searchTerm = searchTerm.replace(",", "+");
    searchTerm = searchTerm.replace("++", "+");
    // Return searchTerm for use with the importYelp function
    return(searchTerm);
  }
};
var requestString = yelp.searchString('Winnipeg', 'food');
console.log();
if(requestString){
  yelp.importYelp(requestString);
}
