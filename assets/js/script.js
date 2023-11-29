// Get API key from OpenWeatherMap
var apiKey = '9932e3bec384759282ee1e9f8df09927';

// Var to store user input
var cityInput = document.getElementById("cityInput");
var cityForm = document.getElementById("cityForm");

// Create variables for API endpoints
var currentWeatherEndpoint = "https://api.openweathermap.org/data/2.5/weather";
var forecastEndpoint = "https://api.openweathermap.org/data/2.5/forecast";

// Event listener for the form
cityForm.addEventListener("submit", function(event) {
  event.preventDefault();
  var city = cityInput.value.trim();

  if (city !== "") {
    // Call the function to get weather data for city
    getWeatherData(city);

    // Call the function to update search history
    updateSearchHistory(city);
  }
});

// Function to handle the API call
function getWeatherData(city) {

  // Construct the URL for the current weather data
  var currentWeatherUrl = `${currentWeatherEndpoint}?q=${city}&appid=${apiKey}&units=imperial`;

  // Make API call for current weather
  fetch(currentWeatherUrl)
    .then(response => response.json())
    .then(data => {
      // Handle and display current weather data
      console.log("Current Weather Data:", data);
      displayCurrentWeather(data);
    })
    .catch(error => {
      console.error("Error fetching current weather data:", error);
    });

  // Construct the URL for the 5-day forecast
  var forecastUrl = `${forecastEndpoint}?q=${city}&appid=${apiKey}&units=imperial`;

  // Make API call for 5-day forecast
  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => {
      // Handle and display forecast data
      console.log("5-Day Forecast Data", data);
      displayForecast(data);
    })
    .catch(error => {
      console.error("Error fetching forecast data:", error);
    });
}

// Function to display data
function displayCurrentWeather(data) {
  var currentWeatherContainer = document.getElementById("currentWeather");

  // Clear previous content
  currentWeatherContainer.innerHTML = "";

  // Extract relevant data from teh API response
  var cityName = data.name;
  var date = new Date(data.dt * 1000); 
  var temperature = data.main.temp;
  var humidity = data.main.humidity;
  var windSpeed = data.wind.speed;
  var weatherIcon = data.weather[0].icon;

  // Create HTML elements to display the current weather
  var weatherHTML = `
    <h3>${cityName} - ${date.toLocaleDateString()}<h3>
    <img src="https://openweathermap.org/img/w/${weatherIcon}.png" alt = "Weather Icon">
    <p>Temperature: ${temperature} &#8457;</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${windSpeed} m/s</p>
    `;

    // Append the HTML to the container
    currentWeatherContainer.innerHTML = weatherHTML;
}

function displayForecast(data) {

  var forecastContainer = document.getElementById("forecast");

  // Clear previous content
  forecastContainer.innerHTML = "";

  // Extract relevant data from the API response
  var forecastList = data.list;

  // Group forecastdata by day
  var groupedForecast = {};

  // Loop through each foreacst in th elist
  forecastList.forEach(day => {

    var date = new Date(day.dt * 1000);

    // Skip the current day
    if (isSameDay(date, new Date())) {
      return;
    }

    var dayKey = date.toDateString();

    // Check if the day key exists, if not, create an array for it
    if (!groupedForecast[dayKey]) {
      groupedForecast[dayKey] = [];
    }

    // Push the forecast data to the array for the corresponding day
    groupedForecast[dayKey].push({
      date: date,
      temperature: day.main.temp,
      humidity: day.main.humidity,
      windSpeed: day.wind.speed,
      weatherIcon: day.weather[0].icon,
    });
  });

  // Loop through the grouped forecast data and display a summary for each day
  for (var dayKey in groupedForecast) {
    var dayForecasts = groupedForecast[dayKey];

    // Calculate average values for the day
    var avgTemperature = dayForecasts.reduce((sum, forecast) => sum + forecast.temperature, 0) / dayForecasts.length;
    var avgHumidity = dayForecasts.reduce((sum, forecast) => sum + forecast.humidity, 0) / dayForecasts.length;
    var avgWindSpeed = dayForecasts.reduce((sum, forecast) => sum + forecast.windSpeed, 0) / dayForecasts.length;
    var weatherIcon = dayForecasts[0].weatherIcon;

    // Create HTML elements for each day's summary
    var forecastHTML = `
    <div class="card forecast-card">
        <p>Date: ${dayForecasts[0].date.toLocaleDateString()}</p>
        <img src="https://openweathermap.org/img/w/${weatherIcon}.png" alt="Weather icon">
        <p>Avg Temperature: ${avgTemperature.toFixed(2)} &#8457;</p>
        <p>Avg Humidity: ${avgHumidity.toFixed(2)}%</p>
        <p>Avg Wind Speed: ${avgWindSpeed.toFixed(2)} m/s</p>
      </div>
    `;

    // Append the HTML to the container
    forecastContainer.innerHTML += forecastHTML;
  }
}

// Function to check if two dates are the same day
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear()  &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function updateSearchHistory(city) {
  // Get existing seach history from local storage
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // Add the new city to the search history
  searchHistory.push(city);

  // Limit the search history
  if (searchHistory.length > 5) {
    searchHistory.shift(); // Removes the oldest city
  }

  // Save the updated search to local storage
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

  // Display the updated search history on the page
  displaySearchHistory(searchHistory);
}

function displaySearchHistory(searchHistory) {
  var historyList = document.getElementById("historyList");

  // Clear preveious content
  historyList.innerHTML = "";

  // Display each chity in the search history
  searchHistory.forEach(city => {
    var listItem = document.createElement("li");
    listItem.textContent = city;
    historyList.appendChild(listItem);
  })
}