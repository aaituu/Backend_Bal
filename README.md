# Assignment 2: API Integration - Backend Report

**Author:** Balgyn Yermakhanbet  
**Group:** SE-2404  
**Assignment:** API Integration using Node.js and Express

---

## Introduction

This report describes the backend implementation of a web application that integrates four different APIs to retrieve, process, and display user and country information. All API logic is implemented server-side using Node.js and Express.js framework.

---

## Backend Architecture

The backend server is built using **Express.js** and runs on **port 3000**. We chose Express because it is simple to use and perfect for creating RESTful API endpoints. The server handles all API calls and data processing, keeping the business logic separate from the frontend.

### Technologies Used

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for Node.js
- **Axios** - HTTP client library for making API requests

---

## API Keys Configuration

For this project, we store API keys directly in the `server.js` file at the top. This approach is simple and straightforward for beginners. We define the keys as constants:

```javascript
const EXCHANGE_RATE_API_KEY = "7ecd58a887936857f9806f83";
const NEWS_API_KEY = "950e2028b7984458a01d77576be0d939";
```

**Note:** The Random User API and REST Countries API do not require API keys.

---

## Server Setup and Middleware

We start by importing the necessary libraries and setting up the Express application:

```javascript
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;
```

Then we configure middleware:

- `express.json()` - Allows the server to parse JSON data
- `express.static("public")` - Serves static files (HTML, CSS, JS) from the public folder

```javascript
app.use(express.json());
app.use(express.static("public"));
```

---

## API Endpoints Implementation

### Task 1: Random User API

**Endpoint:** `GET /api/random-user`

We fetch random user data from `https://randomuser.me/api/`. This API returns a JSON object with user information. We extract only the required fields:

- First name and last name
- Gender
- Profile picture URL (large size)
- Age and formatted date of birth
- City and country
- Full address (street number and name)

**Implementation approach:**

1. We make a GET request to the Random User API
2. We access the first user from the results array
3. We extract the needed fields and format the date of birth
4. We send the cleaned data as JSON response

**Error handling:** If the request fails, we catch the error and send a 500 status with an error message.

---

### Task 2: REST Countries API

**Endpoint:** `GET /api/country/:countryName`

We use the country name from the Random User API to fetch country information from `https://restcountries.com/v3.1/name/{countryName}`.

**Data we extract:**

- Country name (common or official)
- Capital city
- Official languages (joined as a comma-separated string)
- Currency code and name (we get the first currency if multiple exist)
- National flag image URL (PNG or SVG)

**Implementation approach:**

1. We take the country name from the URL parameter
2. We encode it properly to handle special characters
3. We check if the response contains data
4. We safely extract fields using optional chaining (`?.`) to handle missing data
5. For currencies and languages, we convert objects to arrays and extract values

**Error handling:** We check if the country exists, otherwise return 404. Missing data fields return "N/A" instead of crashing.

---

### Task 3: Exchange Rate API

**Endpoint:** `GET /api/exchange-rate/:currencyCode`

We use the currency code from the REST Countries API to fetch exchange rates from `https://v6.exchangerate-api.com/v6/{apiKey}/latest/{currencyCode}`.

**What we do:**

- We convert the currency code to uppercase
- We check if the API key is configured
- We fetch exchange rates for USD and KZT
- We format the rates to 2 decimal places

**Implementation approach:**

1. We validate that the API key is set (not the default placeholder)
2. We make a GET request with the API key and currency code
3. We check if the response is successful
4. We extract USD and KZT rates from the conversion_rates object
5. We format numbers to 2 decimal places using `toFixed(2)`

**Error handling:** If API key is not set, we return an error message. If the currency is invalid, we return 400 status.

---

### Task 4: News API

**Endpoint:** `GET /api/news/:countryName`

We fetch news headlines related to the user's country from `https://newsapi.org/v2/everything`.

**Requirements:**

- Get exactly 5 news articles
- Articles must be in English
- Headlines must contain the country name
- Extract: title, image (if available), description, and source URL

**Implementation approach:**

1. We validate the API key is set
2. We search for news using the country name as query
3. We filter articles where the title contains the country name (case-insensitive)
4. We limit the results to 5 articles
5. We map each article to extract only needed fields

**Error handling:** We check if the API key is configured. If the API returns an error status, we return 400. We handle missing images and descriptions gracefully.

---

### Main Route: Combined Data Endpoint

**Endpoint:** `GET /api/user-data`

This is the main endpoint that combines all four APIs in sequence. The frontend calls this single endpoint to get all data at once.

**How it works:**

1. **Step 1:** Fetch random user data
2. **Step 2:** Use the user's country to fetch country information
3. **Step 3:** Use the country's currency code to fetch exchange rates (if available)
4. **Step 4:** Use the user's country to fetch news headlines (if API key is set)

**Implementation approach:**

- We use nested try-catch blocks to handle errors gracefully
- If one API fails, others can still work
- We check if currency code and API keys exist before making requests
- We return all collected data in a single JSON object

**Response structure:**

```javascript
{
  user: { ... },
  country: { ... },
  exchangeRates: { ... },
  news: [ ... ]
}
```

---

## Data Processing and Formatting

### Date Formatting

We format dates using JavaScript's `toLocaleDateString()`:

```javascript
new Date(user.dob.date).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
```

### Currency Extraction

For countries with multiple currencies, we get the first one:

```javascript
const currencyCode = Object.keys(country.currencies)[0];
const currencyName = country.currencies[currencyCode].name;
```

### Language Formatting

We convert language object to a readable string:

```javascript
Object.values(country.languages).join(", ");
```

### Number Formatting

We format exchange rates to 2 decimal places:

```javascript
rates.USD.toFixed(2);
```

---

## Server Startup

The server starts listening on port 3000:

```javascript
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Put your API keys at the top of server.js file!");
});
```

When the server starts, it logs a message to confirm it's running and reminds about API keys configuration.

---

## Conclusion

This backend implementation successfully integrates four different APIs:

1. Random User API - for user profiles
2. REST Countries API - for country information
3. Exchange Rate API - for currency conversion rates
4. News API - for country-related news

All logic is implemented server-side using Express.js, ensuring security and proper separation of concerns. The code is structured simply and clearly, making it easy to understand and maintain.

---

**Report prepared by:** Balgyn Yermakhanbet  
**Group:** SE-2404  
**Date:** 2025
