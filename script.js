(function () {
  "use strict";

  var REFRESH_MS = 30 * 60 * 1000;
  var CLOCK_MS = 30 * 1000;

  function pad(number) {
    return number < 10 ? "0" + number : String(number);
  }

  function dayName(day) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
  }

  function shortDayName(day) {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
  }

  function monthName(month) {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
  }

  function updateClock() {
    var now = new Date();
    document.getElementById("time").innerHTML = pad(now.getHours()) + ":" + pad(now.getMinutes());
    document.getElementById("date").innerHTML = dayName(now.getDay()) + ", " + now.getDate() + " " + monthName(now.getMonth()) + " " + now.getFullYear();
  }

  function buildCalendar() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var firstDay = new Date(year, month, 1).getDay();
    var daysThisMonth = new Date(year, month + 1, 0).getDate();
    var daysPreviousMonth = new Date(year, month, 0).getDate();
    var html = "<tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr>";
    var cell = 0;
    var day = 1;
    var nextDay = 1;
    var row;
    var column;
    var previousDay;

    document.getElementById("month-title").innerHTML = monthName(month) + " " + year;

    for (row = 0; row < 6; row += 1) {
      html += "<tr>";
      for (column = 0; column < 7; column += 1) {
        cell = row * 7 + column;
        if (cell < firstDay) {
          previousDay = daysPreviousMonth - firstDay + cell + 1;
          html += "<td class='muted'>" + previousDay + "</td>";
        } else if (day <= daysThisMonth) {
          if (day === now.getDate()) {
            html += "<td class='today'>" + day + "</td>";
          } else {
            html += "<td>" + day + "</td>";
          }
          day += 1;
        } else {
          html += "<td class='muted'>" + nextDay + "</td>";
          nextDay += 1;
        }
      }
      html += "</tr>";
    }
    document.getElementById("calendar").innerHTML = html;
  }

  function renderDashboard(data) {
    var forecastHtml = "";
    var i;
    var item;
    var forecastDate;

    document.getElementById("temperature").innerHTML = data.current.temperature + "°C";
    document.getElementById("condition").innerHTML = data.current.condition;
    document.getElementById("weather-meta").innerHTML = "Humidity " + data.current.humidity + "% &nbsp; Wind " + data.current.wind + " km/h";
    document.getElementById("sun").innerHTML = "Sunrise " + data.sunrise + " &nbsp; Sunset " + data.sunset;
    document.getElementById("lunar").innerHTML = data.lunar;

    for (i = 0; i < data.forecast.length; i += 1) {
      item = data.forecast[i];
      forecastDate = new Date(item.date + "T12:00:00");
      forecastHtml += "<div class='forecast-day'>";
      forecastHtml += "<div class='forecast-name'>" + shortDayName(forecastDate.getDay()) + "</div>";
      forecastHtml += "<div class='forecast-text'>" + item.condition + "</div>";
      forecastHtml += "<div class='forecast-temp'>" + item.high + "° / " + item.low + "°</div>";
      forecastHtml += "</div>";
    }

    document.getElementById("forecast-row").innerHTML = forecastHtml;
    document.getElementById("footer").innerHTML = "Updated " + data.updated;
  }

  function loadDashboard() {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/dashboard?t=" + new Date().getTime(), true);
    request.onreadystatechange = function () {
      var data;
      if (request.readyState === 4) {
        if (request.status >= 200 && request.status < 300) {
          try {
            data = JSON.parse(request.responseText);
            renderDashboard(data);
          } catch (error) {
            document.getElementById("condition").innerHTML = "Data error";
          }
        } else {
          document.getElementById("condition").innerHTML = "Weather unavailable";
        }
      }
    };
    request.send(null);
  }

  updateClock();
  buildCalendar();
  loadDashboard();
  window.setInterval(updateClock, CLOCK_MS);
  window.setInterval(loadDashboard, REFRESH_MS);
  window.setInterval(buildCalendar, REFRESH_MS);
}());
