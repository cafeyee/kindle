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

  function render(data) {
    var html = "";
    var i;
    var item;
    serverMinutes = data.clock.hour * 60 + data.clock.minute;
    serverSetAt = new Date().getTime();
    serverDateText = data.clock.dateText;
    updateClock();
    document.getElementById("lunar").innerHTML = data.lunar;
    document.getElementById("temperature").innerHTML = data.current.temperature + "°C";
    document.getElementById("condition").innerHTML = data.current.condition;
    document.getElementById("weather-meta").innerHTML = "Humidity " + data.current.humidity + "% &nbsp; Wind " + data.current.wind + " km/h";
    document.getElementById("sun").innerHTML = "Sunrise " + data.sunrise + " &nbsp; Sunset " + data.sunset;
    for (i = 0; i < data.forecast.length; i += 1) {
      item = data.forecast[i];
      html += "<div class='forecast-day'>";
      html += "<div class='forecast-name'>" + item.day + "</div>";
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
