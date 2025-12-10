import { useState, useEffect } from 'react';

const API_BASE = '/api';

function AngleGauge({ angle }) {
  const normalizedAngle = Math.min(Math.max(angle, -180), 180);
  const rotation = normalizedAngle;
  
  return (
    <div className="gauge-container">
      <svg viewBox="0 0 200 200" className="gauge">
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" className="gauge-bg" />
        
        {/* Tick marks */}
        {[...Array(36)].map((_, i) => {
          const deg = i * 10 - 180;
          const isMajor = i % 9 === 0;
          const innerR = isMajor ? 70 : 78;
          const outerR = 85;
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={100 + innerR * Math.cos(rad)}
              y1={100 + innerR * Math.sin(rad)}
              x2={100 + outerR * Math.cos(rad)}
              y2={100 + outerR * Math.sin(rad)}
              className={isMajor ? 'tick-major' : 'tick-minor'}
            />
          );
        })}
        
        {/* Labels */}
        <text x="100" y="30" className="gauge-label">0°</text>
        <text x="175" y="105" className="gauge-label">90°</text>
        <text x="100" y="185" className="gauge-label">±180°</text>
        <text x="20" y="105" className="gauge-label">-90°</text>
        
        {/* Needle */}
        <g style={{ transform: `rotate(${rotation - 90}deg)`, transformOrigin: '100px 100px' }}>
          <polygon
            points="100,25 95,100 100,110 105,100"
            className="gauge-needle"
          />
          <circle cx="100" cy="100" r="8" className="gauge-center" />
        </g>
      </svg>
      <div className="gauge-value">
        <span className="value-number">{angle.toFixed(1)}</span>
        <span className="value-unit">°</span>
      </div>
    </div>
  );
}

function ReadingCard({ reading, index }) {
  return (
    <div className="reading-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="reading-angle">
        <span className="angle-value">{reading.angle.toFixed(1)}°</span>
      </div>
      <div className="reading-details">
        <div className="reading-time">
          <span className="label">Event Time</span>
          <span className="value">{reading.timeOccurred}</span>
        </div>
        <div className="reading-received">
          <span className="label">Received</span>
          <span className="value">{new Date(reading.receivedAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [readings, setReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/sensor`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setReadings(data.readings);
      setLatestReading(data.readings[0] || null);
      setConnectionStatus('connected');
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // Poll every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <div className="background-grid"></div>
      
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                <path d="M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
            </div>
            <div className="logo-text">
              <h1>ESP32 Sensor</h1>
              <span>IoT Dashboard</span>
            </div>
          </div>
          
          <div className="status-bar">
            <div className={`status-indicator ${connectionStatus}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Error'}
              </span>
            </div>
            {lastUpdate && (
              <span className="last-update">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="live-section">
          <div className="section-header">
            <h2>Live Reading</h2>
            <span className="reading-count">{readings.length} total readings</span>
          </div>
          
          <div className="live-display">
            <div className="gauge-panel">
              <AngleGauge angle={latestReading?.angle ?? 0} />
              <div className="gauge-title">Current Angle</div>
            </div>
            
            <div className="stats-panel">
              <div className="stat-card highlight">
                <div className="stat-icon">⏱</div>
                <div className="stat-content">
                  <span className="stat-label">Event Time</span>
                  <span className="stat-value">
                    {latestReading?.timeOccurred ?? '--'}
                  </span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📐</div>
                <div className="stat-content">
                  <span className="stat-label">Angle</span>
                  <span className="stat-value">
                    {latestReading ? `${latestReading.angle.toFixed(1)}°` : '--'}
                  </span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <span className="stat-label">Readings</span>
                  <span className="stat-value">{readings.length}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🕐</div>
                <div className="stat-content">
                  <span className="stat-label">Last Received</span>
                  <span className="stat-value">
                    {latestReading 
                      ? new Date(latestReading.receivedAt).toLocaleTimeString()
                      : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="history-section">
          <div className="section-header">
            <h2>Reading History</h2>
          </div>
          
          <div className="readings-grid">
            {readings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📡</div>
                <p>Waiting for sensor data...</p>
                <span>Send a POST request to /api/sensor with your ESP32</span>
              </div>
            ) : (
              readings.slice(0, 20).map((reading, index) => (
                <ReadingCard key={reading.id} reading={reading} index={index} />
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <span>ESP32 IoT Dashboard</span>
          <span className="divider">•</span>
          <span>POST to /api/sensor with {"{ timeOccurred, angle }"}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

