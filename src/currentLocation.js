import React from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  let months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = { color: "white", size: 112, animate: true };

class Weather extends React.Component {
  state = {
    lat: undefined,
    lon: undefined,
    city: undefined,
    country: undefined,
    temperatureC: undefined,
    temperatureF: undefined,
    humidity: undefined,
    main: undefined,
    icon: "CLEAR_DAY",
    errorMsg: undefined,
  };

  componentDidMount() {
    if (navigator.geolocation) {
      this.getPosition()
        .then((position) => {
          this.getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch(() => {
          this.getWeather(28.67, 77.22);
          alert("Location access denied. Showing default weather for Delhi.");
        });
    } else {
      alert("Geolocation not available");
    }

    this.timerID = setInterval(
      () => this.getWeather(this.state.lat, this.state.lon),
      600000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  getPosition = (options) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  getWeather = async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();

      if (!data.main || !data.weather) {
        console.error("Invalid API response:", data);
        return;
      }

      this.setState({
        lat,
        lon,
        city: data.name || "Unknown City",
        country: data.sys?.country || "N/A",
        temperatureC: data.main?.temp ? Math.round(data.main.temp) : "N/A",
        temperatureF: data.main?.temp ? Math.round(data.main.temp * 1.8 + 32) : "N/A",
        humidity: data.main?.humidity || "N/A",
        main: data.weather[0]?.main || "Unknown",
      }, this.updateWeatherIcon);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  updateWeatherIcon = () => {
    let weatherCondition = this.state.main || "CLEAR_DAY";
    const iconMapping = {
      Haze: "CLEAR_DAY",
      Clouds: "CLOUDY",
      Rain: "RAIN",
      Snow: "SNOW",
      Dust: "WIND",
      Tornado: "WIND",
      Drizzle: "SLEET",
      Fog: "FOG",
      Smoke: "FOG",
    };
    this.setState({ icon: iconMapping[weatherCondition] || "CLEAR_DAY" });
  };

  render() {
    return this.state.temperatureC ? (
      <React.Fragment>
        <div className="city">
          <div className="title">
            <h2>{this.state.city}</h2>
            <h3>{this.state.country}</h3>
          </div>
          <div className="mb-icon">
            <ReactAnimatedWeather
              icon={this.state.icon}
              color={defaults.color}
              size={defaults.size}
              animate={defaults.animate}
            />
            <p>{this.state.main}</p>
          </div>
          <div className="date-time">
            <div className="dmy">
              <div className="current-time">
                <Clock format="HH:mm:ss" interval={1000} ticking={true} />
              </div>
              <div className="current-date">{dateBuilder(new Date())}</div>
            </div>
            <div className="temperature">
              <p>{this.state.temperatureC}°<span>C</span></p>
            </div>
          </div>
        </div>
        <Forcast icon={this.state.icon} weather={this.state.main} />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} alt="Loading..." />
        <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
          Detecting your location
        </h3>
        <h3 style={{ color: "white", marginTop: "10px" }}>
          Your current location will be displayed on the App & used for calculating real-time weather.
        </h3>
      </React.Fragment>
    );
  }
}

export default Weather;
