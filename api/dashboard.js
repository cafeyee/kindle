const LAT = -41.2865;
const LON = 174.7762;
const TIMEZONE = "Pacific/Auckland";

function condition(code) {
  const map = {0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",56:"Freezing drizzle",57:"Heavy freezing drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Heavy freezing rain",71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",80:"Light showers",81:"Rain showers",82:"Heavy showers",85:"Snow showers",86:"Heavy snow showers",95:"Thunderstorm",96:"Thunderstorm with hail",99:"Heavy thunderstorm"};
  return map[code] || "Weather";
}

function getParts(date, options) {
  const parts = new Intl.DateTimeFormat("en-NZ", options).formatToParts(date);
  const values = {};
  for (const part of parts) values[part.type] = part.value;
  return values;
}

function wellingtonClock(date) {
  const values = getParts(date, {timeZone:TIMEZONE,weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:false});
  const numeric = getParts(date, {timeZone:TIMEZONE,year:"numeric",month:"numeric",day:"numeric"});
  return {hour:Number(values.hour),minute:Number(values.minute),year:Number(numeric.year),month:Number(numeric.month),day:Number(numeric.day),dateText:values.weekday + ", " + values.day + " " + values.month + " " + values.year};
}

function weekdayForDate(value) {
  return new Intl.DateTimeFormat("en-NZ", {timeZone:"UTC",weekday:"short"}).format(new Date(value + "T12:00:00Z"));
}

function lunarDate(date) {
  try {
    return "农历 " + new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {timeZone:TIMEZONE,year:"numeric",month:"long",day:"numeric"}).format(date);
  } catch (error) {
    return "Lunar date unavailable";
  }
}

function timeOnly(value) {
  return String(value || "").slice(11, 16);
}

function updatedTime(date) {
  return new Intl.DateTimeFormat("en-NZ", {timeZone:TIMEZONE,hour:"2-digit",minute:"2-digit",hour12:false}).format(date);
}

module.exports = async function handler(req, res) {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + LAT + "&longitude=" + LON + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=6&timezone=" + encodeURIComponent(TIMEZONE);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather service error");
    const weather = await response.json();
    const forecast = [];
    for (let i = 1; i <= 5; i += 1) {
      forecast.push({date:weather.daily.time[i],day:weekdayForDate(weather.daily.time[i]),condition:condition(weather.daily.weather_code[i]),high:Math.round(weather.daily.temperature_2m_max[i]),low:Math.round(weather.daily.temperature_2m_min[i])});
    }
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    res.status(200).json({clock:wellingtonClock(new Date()),current:{temperature:Math.round(weather.current.temperature_2m),humidity:Math.round(weather.current.relative_humidity_2m),wind:Math.round(weather.current.wind_speed_10m),condition:condition(weather.current.weather_code)},sunrise:timeOnly(weather.daily.sunrise[0]),sunset:timeOnly(weather.daily.sunset[0]),forecast:forecast,lunar:lunarDate(new Date()),updated:updatedTime(new Date())});
  } catch (error) {
    res.status(502).json({error:"Weather data unavailable"});
  }
};
