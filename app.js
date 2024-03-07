const searchForm = document.querySelector(".search-form");
const locationForm = document.querySelector(".location-form")
const cont = document.querySelector(".container");
const today = document.querySelector(".today");
const useLocation = document.querySelector(".location-btn")
const loader = document.querySelector(".loader");
const contentCont = document.querySelector(".content-container");

function apiFunctionWrapper() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(successResponse => {
            resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse);
        });
    });
}

function getFormattedTime(time) {
    const timeString12hr = new Date(time)
        .toLocaleTimeString('en-US',
            { hour12: true, hour: 'numeric', minute: 'numeric' }
        );
    return `Time: ${timeString12hr}`;
}

function getToday(res, day, month, year) {
    let hour = document.createElement("div");
    hour.innerHTML = `${getFormattedTime(res.data.current.time)} ${res.data.timezone_abbreviation} | ${day}/${month}/${year}`;

    let temp = document.createElement("div");
    temp.innerHTML = `Temperature: ${res.data.current.temperature_2m}${res.data.current_units.temperature_2m}`;

    let today = document.createElement("div");
    today.append(hour, temp);
    today.classList.add("today");

    cont.append(today);
}

function getForecast(res, day, month, year) {
    let forecastCont = document.createElement("div");
    for (let i = 1; i < res.data.daily.temperature_2m_max.length; i++) {
        let forecast = document.createElement("div");
        forecast.innerHTML = `Max: ${res.data.daily.temperature_2m_max[i]}, Min: ${res.data.daily.temperature_2m_min[i]} | ${day+i}/${month}/${year}`;
        forecast.classList.add("forecast")
        forecastCont.append(forecast);
        forecastCont.classList.add("forecast-container");
    }
    cont.append(forecastCont);
}

async function getCity(city) {
    let latitude, longitude;

    const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    try {
        latitude = res.data.results[0].latitude;
        longitude = res.data.results[0].longitude;
    } catch (e) {
        console.log("Error", e);
    }

    return [latitude, longitude];
}

async function getCoords() {
    let latitude, longitude;
    try {
        const result = await apiFunctionWrapper();
        latitude = result.coords.latitude;
        longitude = result.coords.longitude;

    } catch (e) {
        console.log("Error", e);
    }

    return [latitude, longitude];
}

async function getWeather(city) {
    if (city) {
        cityLatitude = await getCity(city).then(res => res[0]);
        cityLongitude = await getCity(city).then(res => res[1]);
    } else {
        cityLatitude = await getCoords().then(res => res[0]);
        cityLongitude = await getCoords().then(res => res[1]);
    }

    axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${cityLatitude}&longitude=${cityLongitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`)
    .then(res => {
        try {
            console.log(res.data);
            date = new Date();
            day = date.getDate();
            month = date.getMonth()+1;
            year = date.getFullYear();
            getToday(res, day, month, year);
            getForecast(res, day, month, year);
            
        } catch (e) {
            console.log("Error!", e);
        }
    })
}

searchForm.addEventListener("submit", async e => {
    e.preventDefault();
    contentCont.children[0].children[0].style.opacity = 0;

    while (cont.firstChild) {
        cont.removeChild(cont.lastChild);
    }
    
    const city = searchForm.elements.query.value;
    
    loader.style.display = "block";
    await getWeather(city); 
    loader.style.display = "none";

    contentCont.children[0].children[0].innerHTML = city;
    contentCont.children[0].children[0].style.opacity = 1;
})

locationForm.addEventListener("submit", async e => {
    e.preventDefault();
    contentCont.children[0].children[0].style.opacity = 0;
    
    while (cont.firstChild) {
        cont.removeChild(cont.lastChild);
    }

    loader.style.display = "block";
    await getWeather();
    loader.style.display = "none";

    contentCont.children[0].children[0].innerHTML = 'Your Location';
    contentCont.children[0].children[0].style.opacity = 1;
})