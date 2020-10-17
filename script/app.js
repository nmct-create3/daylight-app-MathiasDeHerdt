// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	// //Get hours from milliseconds
	// const date = new Date(timestamp * 1000);
	// // Hours part from the timestamp
	// const hours = '0' + date.getHours();
	// // Minutes part from the timestamp
	// const minutes = '0' + date.getMinutes();
	// // Seconds part from the timestamp (gebruiken we nu niet)
	// // const seconds = '0' + date.getSeconds();

	// // Will display time in 10:30(:23) format
	// return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s

	const time = new Date(timestamp * 1000)

	const hours = time.getHours()
	const minutes = time.getMinutes()

	return `${hours.toString().padStart(2, '0')}: ${minutes.toString().padStart(2, '0')}`;
}

// 5 TODO: maak updateSun functie
const updateSun = (sunElement, left, bottom, now) => {
	sunElement.style.left = `${left}`;
	sunElement.style.bottom = `${bottom}`;

	const currentTimeStamp = `${now.getHours().toString().padStart(2, '0')} : ${now.getMinutes().toString().padStart(2, '0')}`;
	sunElement.setAttribute('data-time', currentTimeStamp) // setAttribute moet altijd beginnen met data. dan overschrijven we het met current timestamp
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	const sun = document.querySelector('.js-sun')
	const minutesLeft = document.querySelector('.js-time-left')
	
	// Bepaal het aantal minuten dat de zon al op is.
	const now = new Date();
	const sunriseDate = new Date(sunrise * 1000) // omzetten naar milliseconden

	// 9:30 bv dus hours geeft enkel de uren, minutes enkel de minuten
	const minutesSunUp = now.getHours() * 60 + now.getMinutes() - (sunriseDate.getHours() * 60 + sunriseDate.getSeconds())
	console.log("minuten: " + minutesSunUp)

	const percentage = (100/totalMinutes) * minutesSunUp // verstreken percentage van de dag
	const sunLeft = percentage
	const sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2  // korte if else -> condition ? true : false

	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	updateSun(sun, sunLeft, sunBottom, now) // now is het huidige moment

	// We voegen ook de 'is-loaded' class toe aan de body-tag.
							//TODO

	// Vergeet niet om het resterende aantal minuten in te vullen.
	minutesLeft.innerText = totalMinutes - minutesSunUp;

	// Nu maken we een functie die de zon elke minuut zal updaten
	// Bekijk of de zon niet nog onder of reeds onder is
	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
	console.log(queryResponse)
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	document.querySelector('.js-location').innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;
	
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	document.querySelector('.js-sunrise').innerText = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
	document.querySelector('.js-sunset').innerText = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);
	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	const timeDifference = (queryResponse.city.sunset - queryResponse.city.sunrise) / 60;
	
	console.log(timeDifference) // raw time
	console.log(Math.round(timeDifference)) // afgerond
	console.log(timeDifference.toFixed(2)) // op 2 na de komma

	placeSunAndStartMoving(timeDifference, queryResponse.city.sunrise)
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async(lat, lon) => {
	// Eerst bouwen we onze url op
	// Met de fetch API proberen we de data op te halen..
	const data = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=ed663c865f124d299dcab3400e9866bf&units=metric&lang=nl&cnt=1`)
		.then((r) => r.json())
		.catch((err) => console.error('An error occured: ', err));
	
	// Als dat gelukt is, gaan we naar onze showResult functie.
	// console.log(data)
	showResult(data)
};

document.addEventListener('DOMContentLoaded', function() {
	console.log('SCRIPT LOADED')
	// 1 We will query the API with longitude and latitude.
	getAPI(50.8027841, 3.2097454);
});
