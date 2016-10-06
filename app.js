//GoogleMaps: AIzaSyAxU3qsOBmOTtQyL0l-_Bpj1OA44YkNI3E
//petfinder key: b46b11a8ca45dd7cc2a391730e286cca
// secret: bf32754638b3c39d17dcf25495090279

var PET_BASE_URL = 'http://api.petfinder.com/pet.find';

function getDataFromApi(dogBreed, zipCode, call) {
	var settings = {
		url: PET_BASE_URL,
		data: {
			format: 'json',
			key: 'b46b11a8ca45dd7cc2a391730e286cca',
			animal: 'dog',
			breed: dogBreed,
			location: zipCode,
			callback: '?'
		},
		dataType: 'json',
		type: 'GET',
		success: call
	};
		console.log($.ajax(settings));
}


function displayResults(data) {
	console.log("in results");
}

function watchSubmit() {
	$('.js-search-form').submit(function(e) {
		e.preventDefault();
		var breed = $(this).find('.breed').val();
		var zipCode = $(this).find('.zip').val();
		console.log("Breed: " + breed + "      zipCode: " + zipCode);
		getDataFromApi(breed, zipCode, displayResults);
	});
}

$(function(){watchSubmit();});