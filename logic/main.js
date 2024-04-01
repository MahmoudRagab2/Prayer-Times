const savedLocation = localStorage.getItem("Location");
const LocationFromLocalstorage = JSON.parse(
  localStorage.getItem("Location")
);
const Location = savedLocation
  ? JSON.parse(savedLocation)
  : {
      country: "مصر",
      city: "القاهرة",
    };

const cityName = document.querySelector(".city");
const dateElement = document.querySelector(".date");

const days = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const dateNow = new Date();
const arabicDate = `${days[dateNow.getDay()]} - ${dateNow.getDate()}/ ${
  dateNow.getMonth() + 1
} / ${dateNow.getFullYear()} `;
dateElement.textContent = arabicDate;

const countriesOptions = document.querySelector(".country-option");
const citiesOptions = document.querySelector(".city-option");

function getCountries() {
  axios
    .get("https://mahmoudragab2.github.io/Prayer-Times/countries.json")
    .then((response) => {
      for (const country in response.data) {
        let optionElement = document.createElement("option");
        optionElement.value = optionElement.textContent = country;
        countriesOptions.appendChild(optionElement);
      }
      // إذا كان هناك قيمة محفوظة في localStorage، قم بتعيينها إلى countriesOptions.value
      if (LocationFromLocalstorage) {
        countriesOptions.value = LocationFromLocalstorage.country;
      }
      
      // احصل على المدن بناءً على البلد المحدد
      const selectedCountry = countriesOptions.value;
      getCities(selectedCountry, response.data[selectedCountry], LocationFromLocalstorage ? LocationFromLocalstorage.city : "");
    })
    .catch((error) => {
      console.error("Error fetching countries data:", error);
    });
}


getCountries();

function getCities(selectedCountry, cities, selectedCity) {
  citiesOptions.innerHTML = "";
  for (city in cities) {
    let optionElement = document.createElement("option");
    optionElement.value = optionElement.textContent = cities[city];
    citiesOptions.appendChild(optionElement);
  }
  cityName.value = selectedCity ? selectedCity : cities[0];
  cityName.textContent = `${selectedCountry} - ${citiesOptions.value}`;
}

countriesOptions.addEventListener("change", function () {
  axios
    .get("https://mahmoudragab2.github.io/Prayer-Times/countries.json")
    .then((response) => {
      getCities(this.value, response.data[this.value]);
      Location.country = this.value;
      Location.city = citiesOptions.value;
      localStorage.setItem("Location", JSON.stringify(Location));
      prayerTimes();
    })
    .catch((error) => {
      console.error("Error fetching countries data:", error);
    });
});

citiesOptions.addEventListener("change", function () {
  Location.city = this.value;
  Location.country = countriesOptions.value;
  cityName.textContent = `${Location.country} - ${citiesOptions.value}`;
  Location.city = LocationFromLocalstorage.city || "القاهرة";
  localStorage.setItem("Location", JSON.stringify(Location));
  prayerTimes();
});

function convertTo12HourFormat(time24) {
  const [hours, minutes] = time24.split(":");
  let hours12 = hours % 12 || 12;
  hours12 = hours12 < 10 ? "0" + hours12 : hours12;
  const ampm = hours < 12 ? "صباحًا" : "مساءً";
  return hours12 + ":" + minutes + " " + ampm;
}

function prayerTimes() {
  axios
    .get("https://api.aladhan.com/v1/calendarByCity", {
      params: Location,
    })
    .then((response) => {
      const times = response.data.data[dateNow.getDate() - 1].timings;
      fajr.textContent = convertTo12HourFormat(times.Fajr.split(" ")[0]);
      sunrise.textContent = convertTo12HourFormat(times.Sunrise.split(" ")[0]);
      dhuhr.textContent = convertTo12HourFormat(times.Dhuhr.split(" ")[0]);
      asr.textContent = convertTo12HourFormat(times.Asr.split(" ")[0]);
      maghrib.textContent = convertTo12HourFormat(times.Maghrib.split(" ")[0]);
      isha.textContent = convertTo12HourFormat(times.Isha.split(" ")[0]);
    })
    .catch((error) => {
      alert("لا يمكن جلب مواقيت الصلاة لهذا البلد")
    });
}

prayerTimes();
