// const tempData = JSON.parse( "{"queryResponse":{"cod":"200","message":0,"cnt":1,"list":[{"dt":1602784800,"main":{"temp":10.28,"feels_like":6.41,"temp_min":9.02,"temp_max":10.28,"pressure":1020,"sea_level":1020,"grnd_level":1019,"humidity":61,"temp_kf":1.26},"weather":[{"id":802,"main":"Clouds","description":"licht bewolkt","icon":"03n"}],"clouds":{"all":43},"wind":{"speed":3.4,"deg":34},"visibility":10000,"pop":0.02,"sys":{"pod":"n"},"dt_txt":"2020-10-15 18:00:00"}],"city":{"id":2783759,"name":"Wevelgem","coord":{"lat":50.8,"lon":3.21},"country":"BE","population":30954,"timezone":7200,"sunrise":1602742226,"sunset":1602780896}}}" );
// // _ = helper functions
// function _parseMillisecondsIntoReadableTime(timestamp) {
// 	//Get hours from milliseconds
// 	const date = new Date(timestamp * 1000);
// 	// Hours part from the timestamp
// 	const hours = '0' + date.getHours();
// 	// Minutes part from the timestamp
// 	const minutes = '0' + date.getMinutes();
// 	// Seconds part from the timestamp (gebruiken we nu niet)
// 	// const seconds = '0' + date.getSeconds();

// 	// Will display time in 10:30(:23) format
// 	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
// }

const _parseMilliseconds = (timestamp) => {
	const time = new Date(timestamp * 1000);

	const hours = time.getHours();
	const minutes = time.getMinutes();

	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

let itBeNight = () => {
	document.querySelector('html').classList.add('is-night');
};

let itBeDay = () => {
	document.querySelector('html').classList.remove('is-night');
};

// 5 TODO: maak updateSun functie
const updateSun = (sunElement, left, bottom, now) => {
	sunElement.style.left = `${left}%`;
	sunElement.style.bottom = `${bottom}%`;

	const currentTimeStamp = `${now.getHours().toString().padStart(2, '0')} : ${now.getMinutes().toString().padStart(2, '0')}`;
	sunElement.setAttribute('data-time', currentTimeStamp);
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	const sun = document.querySelector('.js-sun'),
		minutesLeft = document.querySelector('.js-time-left');
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	// Bepaal het aantal minuten dat de zon al op is.
	const now = new Date(),
		sunriseDate = new Date(sunrise * 1000);

	// 09:30
	let minutesSunUp = now.getHours() * 60 + now.getMinutes() - (sunriseDate.getHours() * 60 + sunriseDate.getMinutes());

	const percentage = (100/totalMinutes) * minutesSunUp, // verstreken percentage van de dag
		sunLeft = percentage,
		sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2
	//korte if else
	//condition ? true : false;

	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	updateSun(sun, sunLeft, sunBottom, now);

	// TODO: We voegen ook de 'is-loaded' class toe aan de body-tag.

	// Vergeet niet om het resterende aantal minuten in te vullen.
	minutesLeft.innerText = totalMinutes - minutesSunUp;

	// Nu maken we een functie die de zon elke minuut zal updaten
	const t = setInterval(() => {
		// Bekijk of de zon niet nog onder of reeds onder is
		if (minutesSunUp > totalMinutes ) {
			clearInterval(t);
			itBeNight();
		} else if (minutesSunUp < 0) {
			itBeNight();
		} else {
			itBeDay();
			// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
			const now = new Date(),
				left = (100 / totalMinutes) * minutesSunUp,
				bottom = left < 50 ? left * 2 : (100 - left) * 2;

			// PS.: vergeet weer niet om het resterend aantal minuten te updaten
			updateSun(sun, left, bottom, now);

			minutesLeft.innerText = totalMinutes - minutesSunUp;
			minutesSunUp++; // en verhoog het aantal verstreken minuten.
		}
	}, 60000); //in getal in ms
};

// 3 Met de data van de API kunnen we de app opvullen
const showResult = (queryResponse) => {
	console.log({queryResponse});
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	document.querySelector('.js-location').innerText = `${queryResponse.city.name}, ${queryResponse.city.country}`;
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	document.querySelector('.js-sunrise').innerText = _parseMilliseconds (queryResponse.city.sunrise);
	document.querySelector('.js-sunset').innerText = _parseMilliseconds (queryResponse.city.sunset);
	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	const timeDifference = (queryResponse.city.sunset - queryResponse.city.sunrise) / 60; // Api = seconden --> /60 voor minuten
	placeSunAndStartMoving(timeDifference, queryResponse.city.sunrise);
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
	// 1 We will query the API with longitude and latitude.
	getAPI(50.8027841, 3.2097454);
});