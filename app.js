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
	//puts above info together with api url to call callback with the data
	//be able to receive data to load into the callback function
	$.getJSON(PET_BASE_URL, query, call);
}

//function to get long and lat
function getLongLat(zip, callback, hoverText) {
	var query = {
		address: zip,
		sensor: false
	}
	//puts info together and loads callback with data from api call
	$.getJSON(LAT_LONG_URL, query, function(data) {
		callback(data, hoverText);
	});
}

//callback function for data
function displayResults(data) {
	var resultElement = '';
	var imageURL = '';
	var dogZip = {};

	if (data.petfinder.pets.pet) {
		data.petfinder.pets.pet.forEach(function(dog) {
			if (dog.media.photos) {
				resultElement += '<p><img src="' + dog.media.photos.photo[0].$t + 
				'"><br>Name: ' + dog.name.$t + '<br>Age: ' + dog.age.$t + '<br>Zip: ' + 
				dog.contact.zip.$t + '</p>';
				//linking zipcode to dog names
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
//accessing each zip code (keys), add markers is the callback function
//dogZip[unique[i]] is the parameter of callback function, names mapped to zip code
		getLongLat(unique[i], addMarkers, dogZip[unique[i]]);
	}

	$('.results').html(resultElement)
}

//callback function to get markers
function addMarkers(data, hoverText) {
	var loc = data.results[0];
	//way to initialize marker and lat/long
	var myLatlng = new google.maps.LatLng(loc.geometry.location.lat, loc.geometry.location.lng);
	var marker = new google.maps.Marker({
    	map: map,
    	position: myLatlng,
    	title: hoverText
	});
}

function watchSubmit() {
	//event listener for submit
	$('.js-search-form').submit(function(e) {
		e.preventDefault();
		var breed = $(this).find('.breed').val();
		var zipCode = $(this).find('.zip').val();
		//this is where we use petfinder api
		//displayResults is the callback function
		getDataFromPetFinder(breed, zipCode, displayResults);
	});
}

//1: first to happen
//when we load the bottom script, calls this map function
//loads map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 33.7073908, lng: -117.7666567},
          zoom: 8
	});
}

//2: waiting for submit button, this is where it's called
//submit triggers our getData function
$(function(){watchSubmit();});



