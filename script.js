(function () {
  "use strict";

  var WEATHER_REFRESH_MS = 30 * 60 * 1000;

  function twoDigits(number) {
    return number < 10 ? "0" + number : String(number);
  }

  function weekdayName(day) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
  }

  function shortWeekday(day) {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
  }

  function monthName(month) {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
  }

  function updateClock() {
    var now = new Date();
    document.getElementById("time").innerHTML = twoDigits(now.getHours()) + ":" + twoDigits(now.getMinutes());
    document.getElementById("date").innerHTML = weekdayName(now.getDay()) + ", " + now.getDate() + " " + monthName(now.getMonth()) + " " + now.getFullYear();
  }

  function buildCalendar() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var day = 1;
    var row;
    var column;
    var html = "<tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr>";

    document.getElementById("month-title").innerHTML = monthName(month) + " " + year;

    for (row = 0; row < 6; row += 1) {
      html += "<tr>";
      for (column = 0; column < 7; column += 1) {
        if ((row === 0 && column < firstDay) || day > daysInMonth) {
          html += "<td>&nbsp;</td>";
        } else {
          if (day === now.getDate()) {
            html += "<td class="today">" + day + "</td>";
          } else {
            html += "<td>" + day + "</td>";
          }
          day += 1;
        }
      }
      html += "</tr>";
    }
    document.getElementById("calendar").innerHTML = html;
  }

  function parseLocalDate(text) {
    var parts = text.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function showWeather(data) {
    var forecastHtml = "";
    var i;
    var date;

    document.getElementById("temperature").innerHTML = Math.round(data.current.temperature) + "&deg;C";
    document.getElementById("condition").innerHTML = data.current.condition;
    document.getElementById("humidity").innerHTML = "Humidity: " + Math.round(data.current.humidity) + "%";
    document.getElementById("wind").innerHTML = "Wind: " + Math.round(data.current.wind) + " km/h";

    for (i = 0; i < data.forecast.length; i += 1) {
      date = parseLocalDate(data.forecast[i].date);
      forecastHtml += "<div class="forecast-day">";
      forecastHtml += "<div class="forecast-name">" + shortWeekday(date.getDay()) + "</div>";
      forecastHtml += "<div class="forecast-condition">" + data.forecast[i].condition + "</div>";
      forecastHtml += "<div class="forecast-temp">" + Math.round(data.forecast[i].high) + "&deg; / " + Math.round(data.forecast[i].low) + "&deg;</div>";
      forecastHtml += "</div>";
    }

    document.getElementById("forecast-row").innerHTML = forecastHtml;
    document.getElementById("updated").innerHTML = "Updated " + data.updated;
  }

  function weatherError(message) {
    document.getElementById("condition").innerHTML = "Weather unavailable";
    document.getElementById("updated").innerHTML = message;
  }

  function loadWeather() {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/weather?t=" + new Date().getTime(), true);
    request.onreadystatechange = function () {
      var data;
      if (request.readyState === 4) {
        if (request.status >= 200 && request.status < 300) {
          try {
            data = JSON.parse(request.responseText);
            showWeather(data);
          } catch (error) {
            weatherError("Weather data could not be read");
          }
        } else {
          weatherError("Weather request failed: " + request.status);
        }
      }
    };
    request.onerror = function () {
      weatherError("Weather connection failed");
    };
    request.send(null);
  }

  updateClock();
  buildCalendar();
  loadWeather();
  window.setInterval(updateClock, 60000);
  window.setInterval(loadWeather, WEATHER_REFRESH_MS);
  window.setInterval(buildCalendar, 60 * 60 * 1000);
}());
