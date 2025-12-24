/**
 * Frontend JavaScript - DOM Manipulation Only
 * All API logic is handled on the server side
 */

// DOM Elements
const fetchUserBtn = document.getElementById("fetchUserBtn");
const loadingIndicator = document.getElementById("loadingIndicator");
const errorMessage = document.getElementById("errorMessage");
const contentArea = document.getElementById("contentArea");

// User Information Elements
const profilePicture = document.getElementById("profilePicture");
const userName = document.getElementById("userName");
const userGender = document.getElementById("userGender");
const userAge = document.getElementById("userAge");
const userDOB = document.getElementById("userDOB");
const userCity = document.getElementById("userCity");
const userCountry = document.getElementById("userCountry");
const userAddress = document.getElementById("userAddress");

// Country Information Elements
const countryFlag = document.getElementById("countryFlag");
const countryName = document.getElementById("countryName");
const countryCapital = document.getElementById("countryCapital");
const countryLanguages = document.getElementById("countryLanguages");
const countryCurrency = document.getElementById("countryCurrency");

// Exchange Rate Elements
const baseCurrency = document.getElementById("baseCurrency");
const baseCurrency2 = document.getElementById("baseCurrency2");
const usdRate = document.getElementById("usdRate");
const kztRate = document.getElementById("kztRate");

// News Container
const newsContainer = document.getElementById("newsContainer");

/**
 * Show loading indicator
 */
function showLoading() {
  loadingIndicator.classList.remove("hidden");
  contentArea.classList.add("hidden");
  errorMessage.classList.add("hidden");
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  loadingIndicator.classList.add("hidden");
}

/**
 * Show error message
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  contentArea.classList.add("hidden");
}

/**
 * Hide error message
 */
function hideError() {
  errorMessage.classList.add("hidden");
}

/**
 * Display user information
 */
function displayUserData(user) {
  profilePicture.src = user.profilePicture;
  profilePicture.alt = `${user.firstName} ${user.lastName}`;
  userName.textContent = `${user.firstName} ${user.lastName}`;
  userGender.textContent =
    user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
  userAge.textContent = `${user.age} years old`;
  userDOB.textContent = user.dateOfBirth;
  userCity.textContent = user.city;
  userCountry.textContent = user.country;
  userAddress.textContent = user.fullAddress;
}

/**
 * Display country information
 */
function displayCountryData(country) {
  if (!country) {
    document.querySelector(".country-card").style.display = "none";
    return;
  }

  document.querySelector(".country-card").style.display = "block";
  countryFlag.src = country.flag;
  countryFlag.alt = `${country.countryName} flag`;
  countryName.textContent = country.countryName;
  countryCapital.textContent = country.capital;
  countryLanguages.textContent = country.officialLanguages;
  countryCurrency.textContent = `${country.currency.name} (${country.currency.code})`;
}

/**
 * Display exchange rates
 */
function displayExchangeRates(rates) {
  if (!rates) {
    document.querySelector(".exchange-card").style.display = "none";
    return;
  }

  document.querySelector(".exchange-card").style.display = "block";
  baseCurrency.textContent = rates.baseCurrency;
  baseCurrency2.textContent = rates.baseCurrency;
  usdRate.textContent = rates.usd;
  kztRate.textContent = rates.kzt;
}

/**
 * Display news articles
 */
function displayNews(news) {
  if (!news || news.length === 0) {
    newsContainer.innerHTML =
      '<p style="text-align: center; color: #666; padding: 20px;">No news articles available at this time.</p>';
    return;
  }

  newsContainer.innerHTML = "";
  news.forEach((article) => {
    const articleElement = document.createElement("div");
    articleElement.className = "news-article";

    if (!article.image) {
      articleElement.classList.add("no-image");
    }

    let html = '<div class="news-article-header">';

    if (article.image) {
      html += `<img src="${article.image}" alt="News image" class="news-image" onerror="this.style.display='none'">`;
    }

    html += `
            <div class="news-content">
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description}</p>
                <a href="${article.sourceUrl}" target="_blank" rel="noopener noreferrer" class="news-link">Read full article →</a>
            </div>
        </div>`;

    articleElement.innerHTML = html;
    newsContainer.appendChild(articleElement);
  });
}

/**
 * Fetch user data from server
 */
async function fetchUserData() {
  showLoading();
  hideError();

  try {
    const response = await fetch("/api/user-data");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch user data");
    }

    const data = await response.json();

    // Display all data
    displayUserData(data.user);
    displayCountryData(data.country);
    displayExchangeRates(data.exchangeRates);
    displayNews(data.news);

    // Show content area
    contentArea.classList.remove("hidden");
    hideLoading();
  } catch (error) {
    console.error("Error:", error);
    hideLoading();
    showError(`Error: ${error.message}. Please try again.`);
  }
}

// Event Listeners
fetchUserBtn.addEventListener("click", fetchUserData);

// Initial state
hideError();
contentArea.classList.add("hidden");
