const searchForm = document.querySelector(".search-form");
const locationForm = document.querySelector(".location-form");
const cont = document.querySelector(".container");
const today = document.querySelector(".today");
const useLocation = document.querySelector(".location-btn");
const loader = document.querySelector(".loader");
const contentCont = document.querySelector(".content-container");

const DateTime = luxon.DateTime;

function apiFunctionWrapper() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (successResponse) => {
        resolve(successResponse);
      },
      (errorResponse) => {
        reject(errorResponse);
      }
    );
  });
}

function getToday(data) {
  let is_day_icon = document.createElement("i");
  is_day_icon.classList.add("is-day-icon");

  if (data.current.is_day) {
    is_day_icon.classList.add("fas", "fa-sun");
  } else if (!data.current.is_day) {
    is_day_icon.classList.add("fas", "fa-moon");
  }

  let temp = document.createElement("div");
  temp.innerHTML = `Temperature: ${data.current.temperature_2m}${data.current_units.temperature_2m}`;

  let wind_speed = document.createElement("div");
  wind_speed.innerHTML = `Wind Speed: ${data.current.wind_speed_10m}${data.current_units.wind_speed_10m}`;

  let humidity = document.createElement("div");
  humidity.innerHTML = `Humidity: ${data.current.relative_humidity_2m}${data.current_units.relative_humidity_2m}`;

  let today_stats = document.createElement("div");
  today_stats.append(temp, wind_speed, humidity);
  today_stats.classList.add("today-stats");

  let today = document.createElement("div");
  today.append(is_day_icon, today_stats);
  today.classList.add("today");

  cont.append(today);
}

function getForecast(data) {
  let forecastCont = document.createElement("div");
  for (let i = 1; i < data.daily.temperature_2m_max.length; i++) {
    const forecast = document.createElement("div");

    const date = document.createElement("div");
    const forecastMax = document.createElement("div");
    const forecastMin = document.createElement("div");

    const todayDate = DateTime.now();

    date.innerHTML = todayDate.plus({ days: i }).toFormat("LLL dd',' yyyy");
    date.classList.add("forecast-date");

    forecastMax.innerHTML = `Max: ${data.daily.temperature_2m_max[i]}${data.daily_units.temperature_2m_max}`;
    forecastMin.innerHTML = `Min: ${data.daily.temperature_2m_min[i]}${data.daily_units.temperature_2m_min}`;

    forecast.append(date, forecastMax, forecastMin);
    forecast.classList.add("forecast");

    forecastCont.append(forecast);
    forecastCont.classList.add("forecast-container");
  }
  cont.append(forecastCont);
}

async function getCity(city) {
  let latitude, longitude;

  const res = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
  );
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
    cityLatitude = await getCity(city).then((res) => res[0]);
    cityLongitude = await getCity(city).then((res) => res[1]);
  } else {
    cityLatitude = await getCoords().then((res) => res[0]);
    cityLongitude = await getCoords().then((res) => res[1]);
  }

  axios
    .get(
      `https://api.open-meteo.com/v1/forecast?latitude=${cityLatitude}&longitude=${cityLongitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
    )
    .then((res) => {
      try {
        console.log(res.data);
        getToday(res.data);
        getForecast(res.data);
      } catch (e) {
        console.log("Error!", e);
      }
    });
}

searchForm.addEventListener("submit", async (e) => {
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
});

locationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  contentCont.children[0].children[0].style.opacity = 0;

  while (cont.firstChild) {
    cont.removeChild(cont.lastChild);
  }

  loader.style.display = "block";
  await getWeather();
  loader.style.display = "none";

  contentCont.children[0].children[0].innerHTML = "Your Location";
  contentCont.children[0].children[0].style.opacity = 1;
});
