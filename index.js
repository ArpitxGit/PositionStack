const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

// Replace 'API_KEY' with your Positionstack API key
const positionstackApiKey = process.env.API_KEY;

app.use(express.json());

// Endpoint for forward geocoding (coordinates from location)
app.get("/forward-geocode", async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      throw new Error("location is required in the query parameters");
    }
    const response = await axios.get(
      "http://api.positionstack.com/v1/forward",
      {
        params: {
          access_key: positionstackApiKey,
          query: location,
          limit: 1,
        },
      }
    );
    res.status(200).json({
      statusMessage: "success",
      data: {
        latitude: response?.data?.data[0]?.latitude,
        longitude: response?.data?.data[0]?.longitude,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusMessage: "failed",
      errorMessage: error.message,
    });
  }
});

// Endpoint for reverse geocoding (location from coordinates)
app.get("/reverse-geocode", async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
      throw new Error(
        "Latitude and longitude are required in the query parameters"
      );
    }
    const response = await axios.get(
      "http://api.positionstack.com/v1/reverse",
      {
        params: {
          access_key: positionstackApiKey,
          query: `${latitude},${longitude}`,
          limit: 1,
        },
      }
    );
    res.json({
      statusMessage: "success",
      data: {
        place: response?.data?.data[0].label,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusMessage: "failed",
      errorMessage: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
