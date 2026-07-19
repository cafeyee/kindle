const https = require("https");

const conditionNames = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm"
};

function condition(code) {
  return conditionNames[code] || "Weather";
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "KindleDashboard/1.0" } }, response => {
      let body = "";
      response.on("data", chunk => { body += chunk; });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error("Weather provider returned " + response.statusCode));
          return;
        }
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    }).on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=-41.2865&longitude=174.7762&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=6&timezone=Pacific%2FAuckland";
  try {
    const source = await getJson(url);
    const forecast = [];
    for (let index = 1; index < source.daily.time.length && forecast.length < 5; index += 1) {
      forecast.push({
        date: source.daily.time[index],
        condition: condition(source.daily.weather_code[index]),
        high: source.daily.temperature_2m_max[index],
        low: source.daily.temperature_2m_min[index]
      });
    }
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    res.status(200).json({
      current: {
        temperature: source.current.temperature_2m,
        humidity: source.current.relative_humidity_2m,
        wind: source.current.wind_speed_10m,
        condition: condition(source.current.weather_code)
      },
      forecast,
      updated: new Intl.DateTimeFormat("en-NZ", {
        timeZone: "Pacific/Auckland",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date())
    });
  } catch (error) {
    res.status(502).json({ error: "Weather service unavailable" });
  }
};
