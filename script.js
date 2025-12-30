const apiKey = "3c14fb090bd47827b08f746f19969668";

const cityInput = document.getElementById("city");
const cityBtn = document.getElementById("cityBtn");
const locBtn = document.getElementById("locBtn");
const loader = document.getElementById("loader");
const result = document.getElementById("result");
const forecastDiv = document.getElementById("forecast");

cityBtn.addEventListener("click", getWeather);
locBtn.addEventListener("click", getLocationWeather);
cityInput.addEventListener("keypress", (e) => e.key === "Enter" && getWeather());

function showLoader(show) {
    loader.style.display = show ? "block" : "none";
}

function applyDayNightTheme(data) {
    const now = data.dt;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    document.body.classList.toggle("day", now >= sunrise && now < sunset);
    document.body.classList.toggle("night", now < sunrise || now >= sunset);
}

function showWeather(data, place) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    result.innerHTML = `
        <div class="weather-header">
            <h2 style="font-size: 1.4rem;">${place}</h2>
            <img src="${iconUrl}" class="weather-icon" style="width: 100px;">
            <div class="temp">${Math.round(data.main.temp)}°</div>
            <p class="condition">${data.weather[0].description}</p>
        </div>
        <div class="weather-grid">
            <div class="weather-box"><span>Humidity</span><h3>${data.main.humidity}%</h3></div>
            <div class="weather-box"><span>Wind</span><h3>${data.wind.speed} m/s</h3></div>
            <div class="weather-box"><span>Pressure</span><h3>${data.main.pressure}</h3></div>
            <div class="weather-box"><span>Feels Like</span><h3>${Math.round(data.main.feels_like)}°</h3></div>
        </div>
    `;
    applyDayNightTheme(data);
    getForecast(data.coord.lat, data.coord.lon);
}

function getWeather() {
    const city = cityInput.value.trim();
    if (!city) return;
    showLoader(true);
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            showLoader(false);
            data.cod === 200 ? showWeather(data, city) : alert("City not found");
        })
        .catch(() => showLoader(false));
}

function getLocationWeather() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    showLoader(true);
    navigator.geolocation.getCurrentPosition(pos => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${apiKey}`)
            .then(res => res.json())
            .then(data => {
                showLoader(false);
                showWeather(data, "Current Location");
            });
    }, () => showLoader(false));
}

function getForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            let html = `<div class="forecast-grid">`;
            for (let i = 0; i < data.list.length; i += 8) {
                const day = data.list[i];
                const date = new Date(day.dt_txt).toDateString().slice(0, 3);
                html += `
                    <div class="forecast-box">
                        <p>${date}</p>
                        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                        <p>${Math.round(day.main.temp)}°</p>
                    </div>`;
            }
            forecastDiv.innerHTML = html + `</div>`;
        });
}