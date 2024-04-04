const Location = {
  country: localStorage.getItem("selectedCountry") || "مصر",
  city: localStorage.getItem("selectedCity") || "القاهرة",
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

const today = new Date();
const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(today);
document.querySelector(".date.hijri").textContent = hijriDate;

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
        countriesOptions.value = Location.country;
      }
      getCities(
        Location.country,
        response.data[Location.country],
        Location.city
      );
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
  citiesOptions.value = selectedCity ? selectedCity : cities[0];
  cityName.textContent = `${selectedCountry} - ${citiesOptions.value}`;
}

countriesOptions.addEventListener("change", function () {
  axios
    .get("https://mahmoudragab2.github.io/Prayer-Times/countries.json")
    .then((response) => {
      getCities(this.value, response.data[this.value]);
      Location.country = this.value;
      Location.city = citiesOptions.value;
      localStorage.setItem("selectedCountry", this.value);
      localStorage.setItem("selectedCity", citiesOptions.value);
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
  localStorage.setItem("selectedCountry", countriesOptions.value);
  localStorage.setItem("selectedCity", this.value);
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
    .catch(() => {
      alert("خطا في جلب المواقيت لهذا البلد");
    });
}

prayerTimes();


document.querySelector(".footer-year").textContent = dateNow.getFullYear()

