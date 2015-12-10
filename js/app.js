// yelp import //
var yelp = {
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
      oauth_nonce: yelp.nonce_generate(),
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
  }
};

yelp.importYelp(yelp.searchString('art entertainment'),yelp.searchString('the forks winnipeg'));
