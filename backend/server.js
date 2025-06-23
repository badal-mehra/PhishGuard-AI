const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: ['https://phishguard-ai.vercel.app', 'http://localhost:3000']
}));
app.use(express.json());

// Load environment variables
require('dotenv').config();
const API_KEY = process.env.VIRUS_TOTAL_API;

// VirusTotal Scan Endpoint
app.post('/scan', async (req, res) => {
  try {
    // Validate input
    if (!req.body.url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    let urlToScan = req.body.url;
    if (!urlToScan.startsWith('http')) {
      urlToScan = 'https://' + urlToScan;
    }

    // Submit URL to VirusTotal
    const submission = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      `url=${encodeURIComponent(urlToScan)}`,
      {
        headers: {
          'x-apikey': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const analysisId = submission.data.data.id;
    
    // Wait for analysis to complete (15 seconds)
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Get analysis results
    const analysis = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: { 'x-apikey': API_KEY } }
    );

    // Format response for frontend
    const result = {
      success: true,
      data: {
        attributes: analysis.data.data.attributes,
        url: urlToScan
      }
    };

    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`VirusTotal API Key: ${API_KEY ? 'Loaded' : 'Missing'}`);
});