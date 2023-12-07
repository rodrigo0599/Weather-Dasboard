let isFreshSearch = false;

$("#searchBtn").on("click", () => {
  let inputValue = $("input").val();

  isFreshSearch = true;

  initiateSearch(inputValue);

  $("input").val("");
});

$("#city-list").on("click", (event) => {
  if (event.target.matches("button")) {
    let inputValue = event.target.textContent;

    isFreshSearch = false;
    initiateSearch(inputValue);
  }
});

function updateCityList(inputValue) {
  let isCityExisting = false;

  localStorage.setItem("lastCity", inputValue);
  $(".cityListBtn").each(function () {
    if (inputValue === $(this).text()) {
      console.log("City already in the list");
      isCityExisting = true;
      return isCityExisting;
    }
  });
  if (!isCityExisting) {
    let newCityButton = $("<button>");
    newCityButton.text(inputValue);
    newCityButton.attr("class", "btn btn-block cityListBtn");
    newCityButton.attr("data-city", inputValue);
    $("#city-list").prepend(newCityButton);
  }
}

async function initiateSearch(inputValue) {
  const weatherApiKey = "46c83042b2cdf276d685079cb38dbf65";
  const baseUrl = "https://api.openweathermap.org/data/2.5";

  try {
    const weatherResponse = await fetch(
      `${baseUrl}/weather?q=${inputValue}&units=imperial&appid=${weatherApiKey}`
    );
    if (!weatherResponse.ok) throw new Error("Weather data not found.");

    const weatherData = await weatherResponse.json();
    const { name: retrievedCityName, weather, main, wind, coord } = weatherData;

    if (isFreshSearch) {
      updateCityList(retrievedCityName);
    }

    $(".fiveDayForecast").empty();
    $("#cityNameDate").text(`${retrievedCityName} ${moment().format("L")}`);
    $("#cityNameDate").append(
      $("<img>").attr(
        "src",
        `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`
      )
    );
    $("#temp").html(`Temperature: ${main.temp}&#176F`);
    $("#humidity").text(`${main.humidity}%`);
    $("#windSpeed").text(`${wind.speed} MPH`);

    const uvResponse = await fetch(
      `${baseUrl}/uvi?lat=${coord.lat}&lon=${coord.lon}&appid=${weatherApiKey}`
    );
    if (uvResponse.ok) {
      const uvData = await uvResponse.json();
      const uvi = uvData.value;
      $("#uv").text("UV Index: ");
      $("#uv").append($("<div>").addClass(getUVIndexClass(uvi)).text(uvi));
    }

    const forecastResponse = await fetch(
      `${baseUrl}/onecall?lat=${coord.lat}&lon=${coord.lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${weatherApiKey}`
    );
    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      updateFiveDayForecast(forecastData.daily);
    }
  } catch (error) {
    alert(
      "City name not recognized. Please verify the spelling and try again."
    );
  }
}

function getUVIndexClass(uvi) {
  if (uvi < 3) return "low";
  if (uvi < 6) return "moderate";
  if (uvi < 8) return "high";
  return "veryHigh";
}

function updateFiveDayForecast(dailyForecastArr) {
  for (let i = 1; i < 6; i++) {
    const forecastDiv = $("<div>").addClass("fiveDayForecast");
    const date = moment().add(i, "days").format("L");

    forecastDiv.prepend($("<p>").text(date));
    forecastDiv.append(
      $("<img>").attr(
        "src",
        `https://openweathermap.org/img/wn/${dailyForecastArr[i].weather[0].icon}@2x.png`
      )
    );
    forecastDiv.append(
      $("<p>").html(`Temp: ${dailyForecastArr[i].temp.day}&#176F`)
    );
    forecastDiv.append(
      $("<p>").text(`Humidity: ${dailyForecastArr[i].humidity}%`)
    );
    $("#fiveDay").append(forecastDiv);
  }
}

initiateSearch(localStorage.getItem("lastCity"));
updateCityList(localStorage.getItem("lastCity"));

