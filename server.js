import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

// Setup __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables for Airtable API
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;

// Validate environment variables
if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID || !AIRTABLE_ACCESS_TOKEN) {
  console.error('Missing required Airtable environment variables.');
  console.error('Ensure AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID, and AIRTABLE_ACCESS_TOKEN are set in your .env file.');
  process.exit(1);
}

// Middleware to serve static files from React app's build directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

// API endpoint to fetch Airtable records
app.get('/api/records', async (req, res) => {
  const offset = req.query.offset || '';
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}${offset ? `?offset=${offset}` : ''}`;

  try {
    console.log(`Fetching records from: ${url}`);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API Error: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    console.log('Airtable Data:', JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Error fetching records:', error.message);
    res.status(500).json({ error: 'Failed to fetch records from Airtable.' });
  }
});

// Catch-all route: Serve React's index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Start the server and handle port conflicts
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
