const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;


const EXCHANGE_RATE_API_KEY="7ecd58a887936857f9806f83"  ;
const NEWS_API_KEY="950e2028b7984458a01d77576be0d939";


app.use(express.json());
app.use(express.static("public"));


// TASK 1: Get Random User
app.get("/api/random-user", async (req, res) => {
  try {
    // Get random user from API
    const response = await axios.get("https://randomuser.me/api/");
    const user = response.data.results[0];

    // Extract the data we need
    const userData = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      profilePicture: user.picture.large,
      age: user.dob.age,
      dateOfBirth: new Date(user.dob.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      city: user.location.city,
      country: user.location.country,
      fullAddress: `${user.location.street.number} ${user.location.street.name}`,
    };

    res.json(userData);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

// TASK 2: Get Country Information
app.get("/api/country/:countryName", async (req, res) => {
  try {
    const countryName = req.params.countryName;
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: "Country not found" });
    }

    const country = response.data[0];

    // Get currency info
    let currencyCode = "N/A";
    let currencyName = "N/A";
    if (country.currencies) {
      currencyCode = Object.keys(country.currencies)[0];
      currencyName = country.currencies[currencyCode].name;
    }

    // Get languages
    let languages = "N/A";
    if (country.languages) {
      languages = Object.values(country.languages).join(", ");
    }

    const countryData = {
      countryName: country.name?.common || country.name?.official || "N/A",
      capital: country.capital?.[0] || "N/A",
      officialLanguages: languages,
      currency: {
        code: currencyCode,
        name: currencyName,
      },
      flag: country.flags?.png || country.flags?.svg || "N/A",
    };

    res.json(countryData);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to get country data" });
  }
});

// TASK 3: Get Exchange Rates
app.get("/api/exchange-rate/:currencyCode", async (req, res) => {
  try {
    const currencyCode = req.params.currencyCode.toUpperCase();

    // Check if API key is set
    if (EXCHANGE_RATE_API_KEY === "your_exchange_rate_api_key_here") {
      return res.status(500).json({
        error: "Please set your EXCHANGE_RATE_API_KEY in server.js",
      });
    }

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${currencyCode}`
    );

    if (response.data.result === "error") {
      return res.status(400).json({ error: "Invalid currency code" });
    }

    const rates = response.data.conversion_rates;

    const exchangeRates = {
      baseCurrency: currencyCode,
      usd: rates.USD ? rates.USD.toFixed(2) : "N/A",
      kzt: rates.KZT ? rates.KZT.toFixed(2) : "N/A",
    };

    res.json(exchangeRates);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to get exchange rates" });
  }
});

// TASK 4: Get News Headlines
app.get("/api/news/:countryName", async (req, res) => {
  try {
    const countryName = req.params.countryName;

    // Check if API key is set
    if (NEWS_API_KEY === "your_news_api_key_here") {
      return res.status(500).json({
        error: "Please set your NEWS_API_KEY in server.js",
      });
    }

    // Get news articles
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: countryName,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 20,
        apiKey: NEWS_API_KEY,
      },
    });

    if (response.data.status !== "ok") {
      return res.status(400).json({ error: "News API error" });
    }

    // Filter articles that contain country name in title
    const allArticles = response.data.articles;
    const filteredArticles = [];

    for (
      let i = 0;
      i < allArticles.length && filteredArticles.length < 5;
      i++
    ) {
      const article = allArticles[i];
      if (
        article.title &&
        article.title.toLowerCase().includes(countryName.toLowerCase())
      ) {
        filteredArticles.push({
          title: article.title || "No title",
          image: article.urlToImage || null,
          description: article.description || "No description available",
          sourceUrl: article.url || "#",
        });
      }
    }

    res.json(filteredArticles);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to get news" });
  }
});

// MAIN ROUTE: Get All Data Together
app.get("/api/user-data", async (req, res) => {
  try {
    // Step 1: Get random user
    const userResponse = await axios.get("https://randomuser.me/api/");
    const user = userResponse.data.results[0];

    const userData = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      profilePicture: user.picture.large,
      age: user.dob.age,
      dateOfBirth: new Date(user.dob.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      city: user.location.city,
      country: user.location.country,
      fullAddress: `${user.location.street.number} ${user.location.street.name}`,
    };

    // Step 2: Get country information
    let countryData = null;
    let exchangeRates = null;
    let newsData = [];

    try {
      const countryResponse = await axios.get(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(
          userData.country
        )}`
      );

      if (countryResponse.data && countryResponse.data.length > 0) {
        const country = countryResponse.data[0];

        // Get currency info
        let currencyCode = "N/A";
        let currencyName = "N/A";
        if (country.currencies) {
          currencyCode = Object.keys(country.currencies)[0];
          currencyName = country.currencies[currencyCode].name;
        }

        // Get languages
        let languages = "N/A";
        if (country.languages) {
          languages = Object.values(country.languages).join(", ");
        }

        countryData = {
          countryName: country.name?.common || country.name?.official || "N/A",
          capital: country.capital?.[0] || "N/A",
          officialLanguages: languages,
          currency: {
            code: currencyCode,
            name: currencyName,
          },
          flag: country.flags?.png || country.flags?.svg || "N/A",
        };

        // Step 3: Get exchange rates
        if (
          currencyCode !== "N/A" &&
          EXCHANGE_RATE_API_KEY !== "your_exchange_rate_api_key_here"
        ) {
          try {
            const exchangeResponse = await axios.get(
              `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${currencyCode}`
            );

            if (
              exchangeResponse.data.result !== "error" &&
              exchangeResponse.data.conversion_rates
            ) {
              const rates = exchangeResponse.data.conversion_rates;
              exchangeRates = {
                baseCurrency: currencyCode,
                usd: rates.USD ? rates.USD.toFixed(2) : "N/A",
                kzt: rates.KZT ? rates.KZT.toFixed(2) : "N/A",
              };
            }
          } catch (exchangeError) {
            console.error("Exchange rate error:", exchangeError.message);
          }
        }

        // Step 4: Get news
        if (NEWS_API_KEY !== "your_news_api_key_here") {
          try {
            const newsResponse = await axios.get(
              "https://newsapi.org/v2/everything",
              {
                params: {
                  q: userData.country,
                  language: "en",
                  sortBy: "publishedAt",
                  pageSize: 20,
                  apiKey: NEWS_API_KEY,
                },
              }
            );

            if (newsResponse.data.status === "ok") {
              const allArticles = newsResponse.data.articles;
              const filteredArticles = [];

              for (
                let i = 0;
                i < allArticles.length && filteredArticles.length < 5;
                i++
              ) {
                const article = allArticles[i];
                if (
                  article.title &&
                  article.title
                    .toLowerCase()
                    .includes(userData.country.toLowerCase())
                ) {
                  filteredArticles.push({
                    title: article.title || "No title",
                    image: article.urlToImage || null,
                    description:
                      article.description || "No description available",
                    sourceUrl: article.url || "#",
                  });
                }
              }

              newsData = filteredArticles;
            }
          } catch (newsError) {
            console.error("News error:", newsError.message);
          }
        }
      }
    } catch (countryError) {
      console.error("Country error:", countryError.message);
    }

    // Return all data
    res.json({
      user: userData,
      country: countryData,
      exchangeRates: exchangeRates,
      news: newsData,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Put your API keys at the top of server.js file!");
});
