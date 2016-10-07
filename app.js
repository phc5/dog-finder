//GoogleMaps: AIzaSyAxU3qsOBmOTtQyL0l-_Bpj1OA44YkNI3E
//petfinder key: b46b11a8ca45dd7cc2a391730e286cca, 64568269689a7b256e759afcc3c0a52b
// secret: bf32754638b3c39d17dcf25495090279

var PET_BASE_URL = 'http://api.petfinder.com/pet.find?format=json&callback=?&key=64568269689a7b256e759afcc3c0a52b';
var LAT_LONG_URL = 'http://maps.googleapis.com/maps/api/geocode/json';
var map;
var marker;
var markers = [];

function getDataFromPetFinder(dogBreed, zipCode, callback) {
	var query = {
		animal: 'dog',
		breed: dogBreed,
		location: zipCode,
	}
	$.getJSON(PET_BASE_URL, query, callback);
}

function getLongLatInitial(zip, callback) {
	var query = {
		address: zip,
		sensor: false
	}
	$.getJSON(LAT_LONG_URL, query, setMap);
}

function getLongLatMarker(zip, callback, hoverText) {
	var query = {
		address: zip,
		sensor: false
	}
	$.getJSON(LAT_LONG_URL, query, function(data) {
		callback(data, hoverText,zip);
	});
}

function displayResults(data) {
	var resultElement = '';
	var imageURL = '';
	var dogZip = {};

	if (data.petfinder.pets.pet) {
		data.petfinder.pets.pet.forEach(function(dog) {
			if (dog.media.photos) {
				resultElement += '<p class=zip' + dog.contact.zip.$t + '><img src="' + dog.media.photos.photo[0].$t + '"><br>Name: ' + dog.name.$t + '<br>Age: ' + 
				dog.age.$t + '<br>Zip: ' + dog.contact.zip.$t + '</p>';
				var zip = dog.contact.zip.$t;
				if (dogZip[zip]) {
					dogZip[zip] += ", " + dog.name.$t;
				} else {
					dogZip[zip] = dog.name.$t;
				}
			}
		})
	} else {
		resultElement += '<p>No results</p>';
	}
	
	var unique = Object.keys(dogZip);
	for(let i = 0; i < unique.length; i++) {
		getLongLatMarker(unique[i], addMarkers, dogZip[unique[i]]);
	}

	$('.results').html(resultElement)
}


function addMarkers(data, hoverText,zip) {
	var loc = data.results[0];
	var myLatlng = new google.maps.LatLng(loc.geometry.location.lat, loc.geometry.location.lng);
	marker = new google.maps.Marker({
		map: map,
		position: myLatlng,
		title: hoverText
	});
	marker.addListener('click', function() {
		var selector = 'p.zip' + zip;
		$('p.highlight').removeClass('highlight');
		$(selector).addClass('highlight');
	})
	markers.push(marker);
}

function setMapOnAll(map) {
	for(let i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

function deleteMarkers(markers) {
	setMapOnAll(null);
	markers = [];
}

function setMap(data) {
	var loc = data.results[0];
	map.setCenter(new google.maps.LatLng(loc.geometry.location.lat, loc.geometry.location.lng));
}

function watchSubmit() {
	$('.js-search-form').submit(function(e) {
		e.preventDefault();
		var breed = $(this).find('.breed').val();
		var zipCode = $(this).find('.zip').val();
		deleteMarkers(markers)
		getLongLatInitial(zipCode, setMap);
		getDataFromPetFinder(breed, zipCode, displayResults);
	});
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 33.7073908, lng: -117.7666567},
		zoom: 10
	});
}

$(function(){watchSubmit();});