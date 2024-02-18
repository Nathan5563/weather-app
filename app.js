const form = document.querySelector(".form");
const overallCont = document.querySelector(".overall-container");

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
            for (let i = 0; i < res.data.hourly.temperature_2m.length; i++) {
                let hour = document.createElement("div");
                if (i < 10) {
                    hour.innerHTML = "0" + i + "00";
                } else {
                    hour.innerHTML = i + "00";
                }
                hour.classList.add("hour");

                let temp = document.createElement("div");
                temp.innerHTML = res.data.hourly.temperature_2m[i]
                temp.classList.add("temp");

                let hourtemp = document.createElement("div");
                hourtemp.append(hour, temp)
                hourtemp.classList.add("hourCont");

                overallCont.append(hourtemp);
                overallCont.style["overflow-x"] = "scroll";
            }
        } catch (e) {
            console.log("Error!", e);
        }
    })
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    while (overallCont.firstChild) {
        overallCont.removeChild(overallCont.lastChild);
    }
    const city = form.elements.query.value;
    getWeather(city);  
})