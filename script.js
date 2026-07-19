(function () {
  var REFRESH_MS = 30 * 60 * 1000;
  var CLOCK_MS = 30 * 1000;
  var serverMinutes = null;
  var serverSetAt = null;
  var serverDateText = "";

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function monthName(month) {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month - 1];
  }

  function updateClock() {
    var elapsed;
    var total;
    var hour;
    var minute;
    if (serverMinutes === null || serverSetAt === null) {
      return;
    }
    elapsed = Math.floor((new Date().getTime() - serverSetAt) / 60000);
    total = (serverMinutes + elapsed) % 1440;
    hour = Math.floor(total / 60);
    minute = total % 60;
    document.getElementById("time").innerHTML = pad(hour) + ":" + pad(minute);
    document.getElementById("date").innerHTML = serverDateText;
  }

  function buildCalendar(year, month, today) {
    var firstDay = new Date(year, month - 1, 1).getDay();
    var daysThisMonth = new Date(year, month, 0).getDate();
    var daysPreviousMonth = new Date(year, month - 1, 0).getDate();
    var html = "<tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr>";
    var day = 1;
    var nextDay = 1;
    var row;
    var column;
    var cell;
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
          html += day === today ? "<td class='today'>" + day + "</td>" : "<td>" + day + "</td>";
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


  function weatherIcon(name) {
    var icons = {
      sun: "<svg viewBox='0 0 64 64' aria-hidden='true'><circle cx='32' cy='32' r='13' fill='currentColor'/><path d='M32 5v10M32 49v10M5 32h10M49 32h10M13 13l7 7M44 44l7 7M51 13l-7 7M20 44l-7 7' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round'/></svg>",
      cloud: "<svg viewBox='0 0 64 64' aria-hidden='true'><path d='M17 49h30c8 0 13-5 13-12 0-7-5-12-12-12h-2C43 16 37 12 29 12 19 12 12 19 11 29 5 30 2 34 2 39c0 6 5 10 15 10z' fill='none' stroke='currentColor' stroke-width='5' stroke-linejoin='round' stroke-linecap='round'/></svg>",
      partly: "<svg viewBox='0 0 64 64' aria-hidden='true'><circle cx='22' cy='21' r='9' fill='currentColor'/><path d='M22 4v7M22 31v6M5 21h7M32 21h7M10 9l5 5M34 9l-5 5' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><path d='M18 53h30c8 0 13-5 13-12 0-7-5-12-12-12h-2c-3-8-9-12-17-12-10 0-17 7-18 17-6 1-9 5-9 10 0 5 5 9 15 9z' fill='white' stroke='currentColor' stroke-width='5' stroke-linejoin='round' stroke-linecap='round'/></svg>",
      rain: "<svg viewBox='0 0 64 64' aria-hidden='true'><path d='M16 39h32c8 0 13-5 13-12 0-7-5-12-12-12h-2C44 7 37 3 29 3 18 3 11 11 10 21 4 22 1 26 1 31c0 5 5 8 15 8z' fill='none' stroke='currentColor' stroke-width='5' stroke-linejoin='round' stroke-linecap='round'/><path d='M18 47l-4 10M34 47l-4 10M50 47l-4 10' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round'/></svg>",
      snow: "<svg viewBox='0 0 64 64' aria-hidden='true'><path d='M16 36h32c8 0 13-5 13-12 0-7-5-12-12-12h-2C44 5 37 2 29 2 18 2 11 9 10 19 4 20 1 24 1 29c0 5 5 7 15 7z' fill='none' stroke='currentColor' stroke-width='5' stroke-linejoin='round' stroke-linecap='round'/><g fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'><path d='M19 44v16M11 52h16M13 46l12 12M25 46L13 58M47 44v16M39 52h16M41 46l12 12M53 46L41 58'/></g></svg>",
      storm: "<svg viewBox='0 0 64 64' aria-hidden='true'><path d='M16 36h32c8 0 13-5 13-12 0-7-5-12-12-12h-2C44 5 37 2 29 2 18 2 11 9 10 19 4 20 1 24 1 29c0 5 5 7 15 7z' fill='none' stroke='currentColor' stroke-width='5' stroke-linejoin='round' stroke-linecap='round'/><path d='M31 39h13L35 49h9L25 64l6-13h-9z' fill='currentColor'/></svg>"
    };
    return icons[name] || icons.cloud;
  }

  function render(data) {
    var html = "";
    var i;
    var item;
    serverMinutes = data.clock.hour * 60 + data.clock.minute;
    serverSetAt = new Date().getTime();
    serverDateText = data.clock.dateText;
    updateClock();
    document.getElementById("lunar").innerHTML = data.lunar;
    document.getElementById("current-icon").innerHTML = weatherIcon(data.current.icon);
    document.getElementById("temperature").innerHTML = data.current.temperature + "°C";
    document.getElementById("condition").innerHTML = data.current.condition;
    document.getElementById("weather-meta").innerHTML = "Humidity " + data.current.humidity + "% &nbsp; Wind " + data.current.wind + " km/h";
    document.getElementById("sun").innerHTML = "Sunrise " + data.sunrise + " &nbsp; Sunset " + data.sunset;
    for (i = 0; i < data.forecast.length; i += 1) {
      item = data.forecast[i];
      html += "<div class='forecast-day'>";
      html += "<div class='forecast-name'>" + item.day + "</div>";
      html += "<div class='weather-icon forecast-icon'>" + weatherIcon(item.icon) + "</div>";
      html += "<div class='forecast-text'>" + item.condition + "</div>";
      html += "<div class='forecast-temp'>" + item.high + "° / " + item.low + "°</div>";
      html += "</div>";
    }
    document.getElementById("forecast-row").innerHTML = html;
    buildCalendar(data.clock.year, data.clock.month, data.clock.day);
    document.getElementById("footer").innerHTML = "Updated " + data.updated;
  }

  function loadDashboard() {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/dashboard?t=" + new Date().getTime(), true);
    request.onreadystatechange = function () {
      var data;
      if (request.readyState !== 4) {
        return;
      }
      if (request.status >= 200 && request.status < 300) {
        try {
          data = JSON.parse(request.responseText);
          render(data);
        } catch (error) {
          document.getElementById("condition").innerHTML = "Data error";
          document.getElementById("footer").innerHTML = "Invalid dashboard data";
        }
      } else {
        document.getElementById("condition").innerHTML = "Weather unavailable";
        document.getElementById("footer").innerHTML = "API error " + request.status;
      }
    };
    request.send(null);
  }

  loadDashboard();
  window.setInterval(updateClock, CLOCK_MS);
  window.setInterval(loadDashboard, REFRESH_MS);
}());
