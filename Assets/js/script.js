let isNew = false;

$("#searchBtn").on("click", () => {
  let cityVal = $("input").val();

  isNew = true;

  whoYouGonnaCall(cityVal);

  $("input").val("");
});

$("#city-list").on("click", (event) => {
  if (event.target.matches("button")) {
    let cityVal = event.target.textContent;

    isNew = false;
    whoYouGonnaCall(cityVal);
  }
});

function cityListPopulator(cityVal) {
  let alreadyMade = false;

  localStorage.setItem("lastCity", cityVal);
  $(".cityListBtn").each(function () {
    if (cityVal === $(this).text()) {
      console.log("inside");
      alreadyMade = true;
      return alreadyMade;
    }
  });
  if (!alreadyMade) {
    let cityEL = $("<button>");
    cityEL.text(cityVal);
    cityEL.attr("class", "btn btn-block cityListBtn");
    cityEL.attr("data-city", cityVal);
    $("#city-list").prepend(cityEL);
  }
}

function whoYouGonnaCall(cityVal) {
  let apiKey = "46c83042b2cdf276d685079cb38dbf65";

  let apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityVal +
    "&units=imperial&appid=" +
    apiKey;

  $.ajax({
    url: apiUrl,
    method: "GET",
  })
    .then((response) => {
      let cityName = response.name;

      if (isNew) {
        cityListPopulator(cityName);
      }

      $(".fiveDayForecast").remove();

      $("#cityNameDate").text(cityName + " " + moment().format("L"));
      $("#cityNameDate").append(
        $("<img>").attr(
          "src",
          "https://openweathermap.org/img/wn/" +
            response.weather[0].icon +
            "@2x.png"
        )
      );
      $("#temp").html("Temperature: " + response.main.temp + "9&#176" + "F");
      $("#humidity").text(response.main.humidity + "%");
      $("#windSpeed").text(response.wind.speed + " MPH");

      let lon = response.coord.lon;
      let lat = response.coord.lat;
      $.ajax({
        url:
          "https://api.openweathermap.org/data/2.5/uvi?lat=" +
          lat +
          "&lon=" +
          lon +
          "&appid=" +
          apiKey,
        method: "GET",
      }).then((response) => {
        let uvi = response.value;
        $("#uv").text("UV Index: ");
        if (uvi < 3) {
          $("#uv").append($("<div>").attr("class", "low").text(uvi));
        } else if (uvi < 6) {
          $("#uv").append($("<div>").attr("class", "moderate").text(uvi));
        } else if (uvi < 8) {
          $("#uv").append($("<div>").attr("class", "high").text(uvi));
        } else {
          $("#uv").append($("<div>").attr("class", "veryHigh").text(uvi));
        }
      });

      $.ajax({
        url:
          "https://api.openweathermap.org/data/2.5/onecall?lat=" +
          lat +
          "&lon=" +
          lon +
          "&units=imperial&exclude=current,minutely,hourly,alerts&appid=" +
          apiKey,
        method: "GET",
      }).then((response) => {
        let dailyForecastArr = response.daily;
        for (let i = 1; i < 6; i++) {
          let forecastDiv = $("<div>").attr("class", "fiveDayForecast");
          let date = String(moment().add(i, "day").format("L"));

          forecastDiv.prepend($("<p>").text(date));
          forecastDiv.append(
            $("<img>").attr(
              "src",
              "https://openweathermap.org/img/wn/" +
                dailyForecastArr[i].weather[0].icon +
                "@2x.png"
            )
          );
          forecastDiv.append(
            $("<p>").html(
              "Temp: " + dailyForecastArr[i].temp.day + "9&#176" + "F"
            )
          );
          forecastDiv.append(
            $("<p>").text("Humidity: " + dailyForecastArr[i].humidity + "%")
          );
          $("#fiveDay").append(forecastDiv);
        }
      });
    })
    .catch(() => {
      alert("Not a valid city, Please check the spelling and try again.");
    });
}

whoYouGonnaCall(localStorage.getItem("lastCity"));
cityListPopulator(localStorage.getItem("lastCity"));
