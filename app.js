const form = document.querySelector(".form");

const getTemp = async() => {
    try {
        const res = await 
        console.log(res.data);
    } catch(e) {
        console.log("Error!", e);
    }
}

form.addEventListener("submit", e => {
    e.preventDefault();
    const city = form.elements.query.value;
    let latitude, longitude;
    axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(res => {
        try {
            latitude = res.data.results[0].latitude;
            longitude = res.data.results[0].longitude;

            axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&timezone=auto&forecast_days=1`)
            .then(res => {
                try {
                    console.log(res.data);
                } catch (e) {
                    console.log("Error!", e);
                }
            })
        } catch (e) {
            console.log("Error!", e);
        }
    })
})