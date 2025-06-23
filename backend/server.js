// Backend Code (server.js)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load API Key from .env
require('dotenv').config();
const API_KEY = process.env.VT_API_KEY;

// Scan Endpoint
app.post('/scan', async (req, res) => {
  try {
    const response = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      `url=${encodeURIComponent(req.body.url)}`,
      {
        headers: {
          'x-apikey': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'API request failed' });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));