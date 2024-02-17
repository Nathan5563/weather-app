const form = document.querySelector(".form");

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

async function getWeather(city) {
    cityLatitude = await getCity(city).then(res => res[0]);
    cityLongitude = await getCity(city).then(res => res[1]);

    axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${cityLatitude}&longitude=${cityLongitude}&hourly=temperature_2m,precipitation_probability&timezone=auto&forecast_days=1`)
    .then(res => {
        try {
            console.log(res.data);
        } catch (e) {
            console.log("Error!", e);
        }
    })
}

form.addEventListener("submit", async e => {
    e.preventDefault();

    const city = form.elements.query.value;
    getWeather(city);  
})