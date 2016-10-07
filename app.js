//GoogleMaps: AIzaSyAxU3qsOBmOTtQyL0l-_Bpj1OA44YkNI3E
//petfinder key: b46b11a8ca45dd7cc2a391730e286cca, 64568269689a7b256e759afcc3c0a52b
// secret: bf32754638b3c39d17dcf25495090279

var PET_BASE_URL = 'https://api.petfinder.com/pet.find?format=json&callback=?&key=64568269689a7b256e759afcc3c0a52b';
var PET_BREED_URL = 'https://api.petfinder.com/breed.list?format=json&callback=?&key=64568269689a7b256e759afcc3c0a52b&animal=dog';
var LAT_LONG_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
var map;
var marker;
var markers = [];

//get data using PetFinder API
function getDataFromPetFinder(dogBreed, zipCode, callback) {
	var query = {
		animal: 'dog',
		breed: dogBreed,
		location: zipCode,
	}
	$.getJSON(PET_BASE_URL, query, callback);
}

function getBreedList(callback) {
	$.getJSON(PET_BREED_URL, callback);
}

//get the longitude and latitude of a zipcode using google maps API
//use this for setting the map to zipcode user submits
function getLongLatInitial(zip, callback) {
	var query = {
		address: zip,
		sensor: false
	}
	$.getJSON(LAT_LONG_URL, query, setMap);
}

//get the longitude and latitude of a zipcode using google maps API
//use this to set markers at long and lat of zipcode
function getLongLatMarker(zip, callback, hoverText) {
	var query = {
		address: zip,
		sensor: false
	}
	$.getJSON(LAT_LONG_URL, query, function(data) {
		callback(data, hoverText,zip);
	});
}

//callback: will populate the list of breeds available
function populateList(data) {
	var resultElement = '';
	data.petfinder.breeds.breed.forEach(function(dog) {
		resultElement += '<option>' + dog.$t + '</option>';
	});
	$('.breed').append(resultElement);
}

//callback: display the dogs with their photo, name, zipcode, and email
//also set markers on the map
function displayResults(data) {
	var resultElement = '';
	var imageURL = '';
	var dogZip = {};

	if (data.petfinder.pets.pet) {
		data.petfinder.pets.pet.forEach(function(dog) {
			if (dog.media.photos) {
				resultElement += '<p class="thumbnail zip' + dog.contact.zip.$t + '"><a target="_blank" href="' + dog.media.photos.photo[2].$t + '"><img src="' + dog.media.photos.photo[0].$t + '"></a><span>Name: ' + dog.name.$t + '<br>Age: ' + 
				dog.age.$t + '<br>Zip: ' + dog.contact.zip.$t + '<br>Email: ' + dog.contact.email.$t + '</span></p>';
				var zip = dog.contact.zip.$t;
				if (dogZip[zip]) {
					dogZip[zip] += ", " + dog.name.$t;
				} else {
					dogZip[zip] = dog.name.$t;
				}
			}
		})
	} else {
		resultElement += '<p class="thumbnail no_results">No results. Please enter a valid dog breed.</p>';
	}
	
	var unique = Object.keys(dogZip);
	for(let i = 0; i < unique.length; i++) {
		getLongLatMarker(unique[i], addMarkers, dogZip[unique[i]]);
	}

	$('.results').html(resultElement)
}

//callback: add markers at correct lat and long and push them into markers array
//also event listener to listen for click on marker to highlight dogs in marker.
function addMarkers(data, hoverText, zip) {
	var loc = data.results[0];
	var myLatlng = new google.maps.LatLng(loc.geometry.location.lat, loc.geometry.location.lng);
	marker = new google.maps.Marker({
		map: map,
		position: myLatlng,
		title: hoverText
	});
	$('p.zip' + zip).data("latitude", loc.geometry.location.lat).data("longitude", loc.geometry.location.lng);
	marker.addListener('click', function() {
		var selector = 'p.zip' + zip;
		$('p.highlight').removeClass('highlight');
		$(selector).addClass('highlight');
	})
	markers.push(marker);
}

//we set markers in addMarkers but use this to remove them in deleteMarkers()
function setMapOnAll(map) {
	for(let i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

//delete all the markers on the map
function deleteMarkers(markers) {
	setMapOnAll(null);
	markers = [];
}

//callback: set the map to zipcode taken from submit form.
function setMap(data) {
	var loc = data.results[0];
	map.setCenter(new google.maps.LatLng(loc.geometry.location.lat, loc.geometry.location.lng));
}

//submit button event listener
function watchSubmit() {
	$('.js-search-form').submit(function(e) {
		e.preventDefault();
		var breed = $(this).find('.breed').val();
		var zipCode = $(this).find('.zip').val();
		deleteMarkers(markers);
		getLongLatInitial(zipCode, setMap);
		getDataFromPetFinder(breed, zipCode, displayResults);
	});
}

//initialize map on homepage (default to hidden)
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 33.7073908, lng: -117.7666567},
		zoom: 10
	});
	getBreedList(populateList);
}

//displayMap() called when submit button is clicked (inline property in HTML)
function displayMap() {
	document.getElementById('map').style.display="block";
	initializeMap();
}
//found on stackoverflow to prevent map from displaying as empty map.
function initializeMap() {
	var myOptions = {
		center: {lat: 33.7073908, lng: -117.7666567},
		zoom: 10
	}
	map = new google.maps.Map(document.getElementById('map'), myOptions);
}

//handle scrolling, map will scroll with page
// $(window).scroll(function(){
//   $("#map").css({"margin-top": ($(window).scrollTop()) + "px", "margin-left":($(window).scrollLeft()+25) + "px"});
// });

$('.results').on('click','p', function(event) {
	map.setCenter(new google.maps.LatLng($(this).data('latitude'), $(this).data('longitude')));
});

$(function(){watchSubmit();});