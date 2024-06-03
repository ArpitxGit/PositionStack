// const express = require("express");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const app = express();
// const port = process.env.PORT || 3000;

// dotenv.config();

// // Ensure the API key is available
// if (!process.env.API_KEY) {
//   console.error("API_KEY is missing. Please add it to your .env file.");
//   process.exit(1);
// }

// // Replace 'API_KEY' with your Positionstack API key
// const positionstackApiKey = process.env.API_KEY;

// app.use(express.json());

// // Endpoint for forward geocoding (coordinates from location)
// app.get("/forward-geocode", async (req, res) => {
//   try {
//     const { location } = req.query;
//     if (!location) {
//       return res.status(400).json({
//         statusMessage: "failed",
//         errorMessage: "location is required in the query parameters",
//       });
//     }
//     const response = await axios.get(
//       "http://api.positionstack.com/v1/forward",
//       {
//         params: {
//           access_key: positionstackApiKey,
//           query: location,
//           limit: 1,
//         },
//       }
//     );

//     const data = response?.data?.data[0];
//     if (!data) {
//       return res.status(404).json({
//         statusMessage: "failed",
//         errorMessage: "No data found for the specified location",
//       });
//     }

//     res.status(200).json({
//       statusMessage: "success",
//       data: {
//         latitude: data.latitude,
//         longitude: data.longitude,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       statusMessage: "failed",
//       errorMessage: error.message,
//     });
//   }
// });

// // Endpoint for reverse geocoding (location from coordinates)
// app.get("/reverse-geocode", async (req, res) => {
//   try {
//     const { latitude, longitude } = req.query;
//     if (!latitude || !longitude) {
//       return res.status(400).json({
//         statusMessage: "failed",
//         errorMessage:
//           "Latitude and longitude are required in the query parameters",
//       });
//     }
//     const response = await axios.get(
//       "http://api.positionstack.com/v1/reverse",
//       {
//         params: {
//           access_key: positionstackApiKey,
//           query: `${latitude},${longitude}`,
//           limit: 1,
//         },
//       }
//     );

//     const data = response?.data?.data[0];
//     if (!data) {
//       return res.status(404).json({
//         statusMessage: "failed",
//         errorMessage: "No data found for the specified coordinates",
//       });
//     }

//     res.json({
//       statusMessage: "success",
//       data: {
//         place: data.label,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       statusMessage: "failed",
//       errorMessage: error.message,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const express = require("express");
const env = require("dotenv");
const { default: OpenAI } = require("openai");

const app = express();
env.config();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = {
  role: "system",
  content:
    "Create a one-liner historic factoid output based on the input location in JSON format. Do not mention the location in the output, just the output.",
};

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const apiMessages = [{ role: "user", content: userMessage }];

    const requestData = {
      model: "gpt-4o",
      messages: [systemMessage, ...apiMessages],
    };

    const response = await openai.chat.completions.create(requestData);
    console.log("OpenAI API Call", response);

    if (response && response.choices && response.choices.length > 0) {
      let content = response.choices[0].message.content.trim();

      // Remove any surrounding quotes
      if (content.startsWith('"') && content.endsWith('"')) {
        content = content.slice(1, -1);
      }

      // Remove any unnecessary escape characters
      content = content.replace(/\\"/g, '"');

      res.status(200).json({ factoid: content });
    } else {
      throw new Error("No valid response from OpenAI.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: "Failed",
      error: error.message,
    });
  }
});

const port = process.env.PORT || 3000;
const startServer = () => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer();
