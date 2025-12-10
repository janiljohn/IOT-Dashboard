import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for sensor readings
let sensorReadings = [];
const MAX_READINGS = 100; // Keep last 100 readings

// POST endpoint for ESP32 to send data
app.post('/api/sensor', (req, res) => {
  const { timeOccurred, angle } = req.body;

  if (timeOccurred === undefined || angle === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: timeOccurred and angle'
    });
  }

  const reading = {
    id: Date.now(),
    timeOccurred,
    angle: parseFloat(angle),
    receivedAt: new Date().toISOString()
  };

  sensorReadings.unshift(reading);

  // Keep only the last MAX_READINGS
  if (sensorReadings.length > MAX_READINGS) {
    sensorReadings = sensorReadings.slice(0, MAX_READINGS);
  }

  console.log(`📡 Received: Time=${timeOccurred}, Angle=${angle}°`);

  res.status(201).json({
    message: 'Data received successfully',
    reading
  });
});

// GET endpoint for dashboard to fetch all readings
app.get('/api/sensor', (req, res) => {
  res.json({
    count: sensorReadings.length,
    readings: sensorReadings
  });
});

// GET endpoint for latest reading only
app.get('/api/sensor/latest', (req, res) => {
  if (sensorReadings.length === 0) {
    return res.json({ reading: null });
  }
  res.json({ reading: sensorReadings[0] });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     🌐 IoT Dashboard Backend Running       ║
║────────────────────────────────────────────║
║  Server:  http://localhost:${PORT}            ║
║                                            ║
║  Endpoints:                                ║
║  POST /api/sensor     - Receive ESP32 data ║
║  GET  /api/sensor     - Get all readings   ║
║  GET  /api/sensor/latest - Get latest      ║
║  GET  /api/health     - Health check       ║
╚════════════════════════════════════════════╝
  `);
});

