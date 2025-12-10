# ESP32 IoT Sensor Dashboard

A simple dashboard to receive and display sensor data (Time Occurred & Angle) from an ESP32 chip.

## Project Structure

```
final/
├── backend/          # Express API server
│   ├── package.json
│   └── server.js
├── frontend/         # React dashboard (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

## Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:3001`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## API Endpoints

### POST `/api/sensor`
Receive data from ESP32.

**Request Body:**
```json
{
  "timeOccurred": "14:32:05",
  "angle": 45.5
}
```

**Response:**
```json
{
  "message": "Data received successfully",
  "reading": {
    "id": 1702234567890,
    "timeOccurred": "14:32:05",
    "angle": 45.5,
    "receivedAt": "2024-12-10T22:32:47.890Z"
  }
}
```

### GET `/api/sensor`
Get all readings (up to 100 most recent).

### GET `/api/sensor/latest`
Get only the most recent reading.

### GET `/api/health`
Health check endpoint.

## ESP32 Example Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3001/api/sensor";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");
}

void sendSensorData(String timeOccurred, float angle) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["timeOccurred"] = timeOccurred;
    doc["angle"] = angle;
    
    String json;
    serializeJson(doc, json);
    
    int httpCode = http.POST(json);
    
    if (httpCode > 0) {
      Serial.printf("Response: %d\n", httpCode);
    } else {
      Serial.printf("Error: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
  }
}

void loop() {
  // Example: Send data every 5 seconds
  String currentTime = "12:34:56";  // Replace with actual time
  float angle = 45.0;               // Replace with actual sensor reading
  
  sendSensorData(currentTime, angle);
  delay(5000);
}
```

## Testing with cURL

Send test data to the API:

```bash
# Send a reading
curl -X POST http://localhost:3001/api/sensor \
  -H "Content-Type: application/json" \
  -d '{"timeOccurred": "12:34:56", "angle": 45.5}'

# Get all readings
curl http://localhost:3001/api/sensor

# Get latest reading
curl http://localhost:3001/api/sensor/latest
```

## Features

- **Real-time Updates**: Dashboard polls every second for new data
- **Visual Angle Gauge**: Displays current angle with an animated gauge
- **Reading History**: Shows the last 20 readings in a grid
- **Connection Status**: Live indicator showing backend connectivity
- **Responsive Design**: Works on desktop and mobile devices

