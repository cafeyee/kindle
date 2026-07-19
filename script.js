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
      sun: "<svg viewBox='0 0 64 64' aria-hidden='true'><circle cx='32' cy='32' r='12'/><path d='M32 4v10M32 50v10M4 32h10M50 32h10M12 12l7 7M45 45l7 7M52 12l-7 7M19 45l-7 7' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round'/></svg>",
      cloud: "<svg viewBox='0 0 64 64' aria-hidden='true'><path d='M17 49h31c8 0 13-5 13-12s-5-12-12-12h-2C44 16 37 11 28 11c-11 0-19 8-20 19C3 32 1 36 1 40c0 5 5 9 16 9z'/></svg>",
      partly: "<svg viewBox='0 0 64 64' aria-hidden='true'><circle cx='22' cy='22' r='11'/><path d='M22 3v7M22 34v7M3 22h7M34 22h7M8 8l5 5M31 31l5 5M36 8l-5 5M13 31l-5 5' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><path d='M19 53h31c8 0 13-5 13-12s-5-12-12-12h-2c-3-8-9-12-17-12-10 0-17 7-18 17-6 1-9 5-9 10 0 5 5 9 14 9z'/></svg>",
      rain: "<svg viewBox='0 0 64 64' aria-hidden='true'><path d='M16 39h32c8 0 13-5 13-12s-5-12-12-12h-2C44 7 37 3 29 3 18 3 11 11 10 21 4 22 1 26 1 31c0 5 5 8 15 8z'/><path d='M18 46l-5 11M34 46l-5 11M50 46l-5 11' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round'/></svg>",
      snow: "<svg viewBox='0 0 64 64' aria-hidden='true'><path d='M16 36h32c8 0 13-5 13-12s-5-12-12-12h-2C44 5 37 1 29 1 18 1 11 9 10 19 4 20 1 24 1 29c0 5 5 7 15 7z'/><g fill='none' stroke='currentColor' stroke-width='3'><path d='M18 44v16M10 52h16M12 46l12 12M24 46L12 58M46 44v16M38 52h16M40 46l12 12M52 46L40 58'/></g></svg>",
      storm: "<svg viewBox='0 0 64 64' aria-hidden='true'><path d='M16 36h32c8 0 13-5 13-12s-5-12-12-12h-2C44 5 37 1 29 1 18 1 11 9 10 19 4 20 1 24 1 29c0 5 5 7 15 7z'/><path d='M31 39h13L35 49h9L25 64l6-13h-9z'/></svg>"
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
