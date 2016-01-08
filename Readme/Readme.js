/*
Author: James Fehr
Project Description:
This project is Project #5 of the Front End Nano Degree program at Udacity
--------------------------------------------------------------------------
Usage Instructions:
```````````````````
Online usage> load: http://turtle-head.github.io/Project5/ in your favorite browser
Offline usage> load: index.html  in your favorite browser

Filtering:
``````````
The Text input area filters based on three data values.  Name of location, type of location, and address.  It is accurate according to the values in the
places()[x].address, places()[x].types and places()[x].name variables and I have conveniently set a console.log of the places array for your consideration
and verification of accuracy in the console for you.



----------------------------------------
Code Sources:

Yelp Functions:
#001: 'https://discussions.udacity.com/t/im-having-trouble-getting-started-using-apis/13597/2'
Several code snippets were used and experimented on to get the OAuth code to work for getting a Yelp import

#002: 'https://blog.nraboy.com/2015/03/create-a-random-nonce-string-using-javascript/'
This paired well with snippets from source #001 to create a funtionaly working nonce generator for the OAuth sequence

Map Functions:
Previous project Online Resume V2

Handle infoWindow:
#003: 'http://jsfiddle.net/bryan_weaver/z3Cdg/'

Testing Strings as objects oc function:
#004: 'http://snook.ca/archives/javascript/testing_for_a_v'

Map Styles:
#005: 'https://mapbuildr.com/buildr'}

----------------------------------------
Current Issues:
Error message:

Uncaught TypeError: Unable to process binding "if: function (){return loading }"
Message: Unable to process binding "with: function (){return currentYelp }"
Message: Unable to process binding "text: function (){return gPlace().reviews[1].text }"
Message: Cannot read property '1' of undefined

Probable Cause:

Attempting to bind things that haven't been declared yet.

Status:
Jan 7, 2016 10:46pm: Under investigation



Instructor Notes:
----------------------------------------
Project Overview

You will develop a single page application featuring a map of your neighborhood or a neighborhood you would like to visit. You will then add additional functionality to this map including highlighted locations, third-party data about those locations and various ways to browse the content.

Why this Project?

The neighborhood tour application is complex enough and incorporates a variety of data points that it can easily become unwieldy to manage. There are a number of frameworks, libraries and APIs available to make this process more manageable and many employers are looking for specific skills in using these packages.

What will I Learn?

You will learn how design patterns assist in developing a manageable codebase. You’ll then explore how frameworks can decrease the time required developing an application and provide a number of utilities for you to use. Finally, you’ll implement third-party APIs that provide valuable data sets that can improve the quality of your application.

How does this help my Career?

Interacting with API servers is the primary function of Front-End Web Developers
Use of third-party libraries and APIs is a standard and acceptable practice that is encouraged
-----------------------------------------
Project Details

How will I complete this Project?

Review our course JavaScript Design Patterns.
Download the Knockout framework. Knockout must be used handle list, filter, and any other information on the page that is subject to changing state. Things that should not be handled by knockout: anything the map api is used for, tracking markers, making the map, refreshing the map.
Write code required to add a full-screen map to your page using the Google Maps API. For sake of efficiency, the map API should be called only once.
Write code required to display map markers identifying a number of locations you are interested in within this neighborhood. This is the set of locations on which you will be searching and filtering in step 5. Your project should include at least 5 locations and display those locations when the page is loaded.
Implement input text area to filter your map markers displayed in step 4. The input text area should filter on markers that already show up. Simply providing a search function through a third-party API and displaying the results is not enough.
Implement a list view of the set of locations defined in step 4, filtering the locations via the input text area will filter the list view and map marker locations accordingly.
Add additional functionality using third-party APIs when a map marker, or list view entry is clicked (ex. Yelp reviews, Wikipedia, Flickr images, etc). If you need a refresher on making AJAX requests to third-party servers, check out our Intro to AJAX course.
Add additional functionality to animate a map marker when either the list item associated with it or the map marker itself is selected.
Add additional functionality to open an infoWindow with the information described in step 7 when either a location is selected from the list view or its map marker is selected directly.
Interface should be very intuitive to use. For example, the input text area to filter locations should be easy to locate. It should be easy to understand what set of locations is being filtered. Selecting a location via list item or map marker should cause the map marker to bounce or in some other way animate to indicate that the location has been selected and associated info window opens above map marker with additional information.
Example: BART Locations San Francisco

All locations displayed on map and in list view. Map marker selected and bounced. Info window opened.
List view item selected and highlighted. Associated map marker bounced and info window opened.
Filtered items displayed on map and in list view. Map marker selected.
App displayed on mobile device with hamburger menu. (One possible mobile implementation.)
-----------------------------------------
*/
//*********************************
// Depreciated // Reason? Redundant and ineffective, why waste the resources loading this to have it fail time and time again? Lets not do this it is really really bad
// It is so bad in fact that the secondary function created to check for matches finds them in half the time and does twice the leg work more accurately.
//*********************************
// Converts an array into an Object for string comparison
// How to use: if( name in oc(['bobby', 'sue','smith']) ) { ... }
// {SRC #004: 'http://snook.ca/archives/javascript/testing_for_a_v'}
/*var oc = function(a) {
  var o = {};
  for(var i=0;i<a.length;i++) {
    o[a[i]]='';
  }
  return o;
};*/
//**********************************
// End of Depreciated !!! DO NOT REUSE short of having nothing better to do than match items in a JSON array to the other JSON array,
// and even then write something better and more useful!!! End OF!
//**********************************
