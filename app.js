const searchForm = document.querySelector(".search-form");
const locationForm = document.querySelector(".location-form")
const cont = document.querySelector(".container");
const today = document.querySelector(".today");
const useLocation = document.querySelector(".location-btn")
const loader = document.querySelector(".loader");
const contentCont = document.querySelector(".content-container");

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

function apiFunctionWrapper() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(successResponse => {
            resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse);
        });
    });
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

    axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${cityLatitude}&longitude=${cityLongitude}&current=temperature_2m,relative_humidity_2m,is_day&timezone=auto&forecast_days=1`)
    .then(res => {
        try {
            console.log(res.data);
            let hour = document.createElement("div");
            const timeString12hr = new Date(res.data.current.time)
                .toLocaleTimeString('en-US',
                    { hour12: true, hour: 'numeric', minute: 'numeric' }
                );
            hour.innerHTML = `Time: ${timeString12hr} ${res.data.timezone_abbreviation}`;

            let temp = document.createElement("div");
            temp.innerHTML = `Temperature: ${res.data.current.temperature_2m}${res.data.current_units.temperature_2m}`;

            let today = document.createElement("div");
            today.append(hour, temp);
            today.classList.add("today")
            cont.append(today);
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