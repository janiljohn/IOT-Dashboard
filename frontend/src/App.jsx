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
          <span className="label">Detection Time</span>
          <span className="value">{reading.timeOccurred}</span>
        </div>
        <div className="reading-received">
          <span className="label">Logged</span>
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
              {/* Flame Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.7 2.4 2.9 3.8 2.9 3.8z" />
              </svg>
            </div>
            <div className="logo-text">
              <h1>InfernoGuard</h1>
              <span>Flame Detection System</span>
            </div>
          </div>
          
          <div className="status-bar">
            <div className={`status-indicator ${connectionStatus}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {connectionStatus === 'connected' ? 'System Online' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Error'}
              </span>
            </div>
            {lastUpdate && (
              <span className="last-update">
                Synced: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="live-section">
          <div className="section-header">
            <h2>Live Monitor</h2>
            <span className="reading-count">{readings.length} events logged</span>
          </div>
          
          <div className="live-display">
            <div className="gauge-panel">
              <AngleGauge angle={latestReading?.angle ?? 0} />
              <div className="gauge-title">Flame Direction</div>
            </div>
            
            <div className="stats-panel">
              <div className="stat-card highlight">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <span className="stat-label">Last Detection</span>
                  <span className="stat-value">
                    {latestReading?.timeOccurred ?? '--'}
                  </span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📐</div>
                <div className="stat-content">
                  <span className="stat-label">Source Angle</span>
                  <span className="stat-value">
                    {latestReading ? `${latestReading.angle.toFixed(1)}°` : '--'}
                  </span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <span className="stat-label">Total Events</span>
                  <span className="stat-value">{readings.length}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📡</div>
                <div className="stat-content">
                  <span className="stat-label">Last Signal</span>
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
            <h2>Detection History</h2>
          </div>
          
          <div className="readings-grid">
            {readings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛡️</div>
                <p>System Active - No Flames Detected</p>
                <span>Waiting for sensor input...</span>
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
          <span>InfernoGuard Protection System</span>
          <span className="divider">•</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
