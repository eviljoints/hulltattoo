// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Enable CORS so your frontend (e.g. http://localhost:3000) can make requests.
app.use(cors());
app.use(express.json());

const ACUITY_USER = process.env.NEXT_PUBLIC_ACUITY_USER;
const ACUITY_API_KEY = process.env.NEXT_PUBLIC_ACUITY_API_KEY;

if (!ACUITY_USER || !ACUITY_API_KEY) {
  console.error("Missing Acuity API credentials in environment variables.");
  process.exit(1);
}

const getAuthHeader = () => {
  return 'Basic ' + Buffer.from(`${ACUITY_USER}:${ACUITY_API_KEY}`).toString('base64');
};

// Endpoint to proxy /availability/dates
app.get('/api/acuity/availability/dates', async (req, res) => {
  const { appointmentTypeID, calendarID, month, timezone } = req.query;
  if (!appointmentTypeID || !calendarID || !month || !timezone) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }
  const params = new URLSearchParams({
    appointmentTypeID: appointmentTypeID.toString(),
    calendarID: calendarID.toString(),
    month,
    timezone
  });
  const acuityUrl = `https://acuityscheduling.com/api/v1/availability/dates?${params.toString()}`;

  try {
    // Using Node 20+ global fetch (no need for node‑fetch)
    const acuityRes = await fetch(acuityUrl, {
      headers: {
        Authorization: getAuthHeader()
      }
    });
    if (!acuityRes.ok) {
      return res.status(acuityRes.status).json({ error: `Acuity API error: ${acuityRes.status}` });
    }
    const data = await acuityRes.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching dates from Acuity:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to proxy /availability/times
app.get('/api/acuity/availability/times', async (req, res) => {
  const { appointmentTypeID, calendarID, date, timezone } = req.query;
  if (!appointmentTypeID || !calendarID || !date || !timezone) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }
  const params = new URLSearchParams({
    appointmentTypeID: appointmentTypeID.toString(),
    calendarID: calendarID.toString(),
    date,
    timezone
  });
  const acuityUrl = `https://acuityscheduling.com/api/v1/availability/times?${params.toString()}`;
  try {
    const acuityRes = await fetch(acuityUrl, {
      headers: {
        Authorization: getAuthHeader()
      }
    });
    if (!acuityRes.ok) {
      return res.status(acuityRes.status).json({ error: `Acuity API error: ${acuityRes.status}` });
    }
    const data = await acuityRes.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching times from Acuity:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Proxy server is listening on port ${PORT}`);
});
