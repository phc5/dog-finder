//GoogleMaps: AIzaSyAxU3qsOBmOTtQyL0l-_Bpj1OA44YkNI3E
//petfinder key: b46b11a8ca45dd7cc2a391730e286cca
// secret: bf32754638b3c39d17dcf25495090279

var PET_BASE_URL = 'http://api.petfinder.com/pet.find?format=json&callback=?&key=b46b11a8ca45dd7cc2a391730e286cca';
var LAT_LONG_URL = 'http://maps.googleapis.com/maps/api/geocode/json';
var map;

function getDataFromPetFinder(dogBreed, zipCode, call) {
	var query = {
		animal: 'dog',
		breed: dogBreed,
		location: zipCode,
	}
	$.getJSON(PET_BASE_URL, query, call);
}

function getLongLat(zip, callback, hoverText) {
	var query = {
		address: zip,
		sensor: false
	}
	$.getJSON(LAT_LONG_URL, query, function(data) {
		callback(data, hoverText);
	});
}

function displayResults(data) {
	var resultElement = '';
	var imageURL = '';
	var dogZip = {};

	if (data.petfinder.pets.pet) {
		data.petfinder.pets.pet.forEach(function(dog) {
			if (dog.media.photos) {
				resultElement += '<p>Name: ' + dog.name.$t + 'Age: ' + 
				dog.age.$t + 'Zip: ' + dog.contact.zip.$t + 
				'<img src="' + dog.media.photos.photo[0].$t + '"></p>';
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
		getLongLat(unique[i], addMarkers, dogZip[unique[i]]);
	}

	$('.results').html(resultElement)
}


function addMarkers(data, hoverText) {
	var loc = data.results[0];
	var myLatlng = new google.maps.LatLng(loc.geometry.location.lat, loc.geometry.location.lng);
	var marker = new google.maps.Marker({
    	map: map,
    	position: myLatlng,
    	title: hoverText
	});
}

function watchSubmit() {
	$('.js-search-form').submit(function(e) {
		e.preventDefault();
		var breed = $(this).find('.breed').val();
		var zipCode = $(this).find('.zip').val();
		getDataFromPetFinder(breed, zipCode, displayResults);
	});
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 33.7073908, lng: -117.7666567},
          zoom: 8
	});
}

$(function(){watchSubmit();});