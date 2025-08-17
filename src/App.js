import React, { useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // Changed from loadFull to loadSlim
import "./App.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const INITIAL_ALERTS = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    timestamp: "2025-08-13T17:30:00Z",
    score: 0.98,
    ip_address: "203.0.113.42",
    reason: "Brute-force attack detected due to 50+ failed logins in one minute.",
    geolocation: {
      country: "United States",
      city: "New York",
      lat: 40.7128,
      lng: -74.006,
    },
    logs: [
      "Jul 22 03:00:05 server sshd[1234]: Failed password for root from 203.0.113.42 port 22",
      "Jul 22 03:00:06 server sshd[1235]: Failed password for root from 203.0.113.42 port 22",
    ],
  },
  {
    id: "b2c3d4e5-f678-9012-3456-7890abcdef01",
    timestamp: "2025-08-13T17:35:15Z",
    score: 0.91,
    ip_address: "198.51.100.10",
    reason: "Suspicious port scanning activity.",
    geolocation: {
      country: "Germany",
      city: "Berlin",
      lat: 52.52,
      lng: 13.405,
    },
    logs: ["Jul 22 03:05:15 firewall: PORT_SCAN from 198.51.100.10"],
  },
  {
    id: "c3d4e5f6-7890-1234-5678-90abcdef0123",
    timestamp: "2025-08-13T18:45:22Z",
    score: 0.85,
    ip_address: "192.0.2.15",
    reason: "SQL injection attempt detected.",
    geolocation: {
      country: "China",
      city: "Beijing",
      lat: 39.9042,
      lng: 116.4074,
    },
    logs: [
      "Jul 22 04:45:22 web-server: SQL_INJECTION_ATTEMPT from 192.0.2.15",
      "Jul 22 04:45:23 web-server: Blocked malicious SQL query"
    ],
  },
  {
    id: "d4e5f678-9012-3456-7890-abcdef012345",
    timestamp: "2025-08-13T19:10:33Z",
    score: 0.76,
    ip_address: "203.0.113.75",
    reason: "Multiple failed API authentication attempts.",
    geolocation: {
      country: "Brazil",
      city: "São Paulo",
      lat: -23.5505,
      lng: -46.6333,
    },
    logs: [
      "Jul 22 05:10:33 api-gateway: Failed authentication for user admin from 203.0.113.75",
      "Jul 22 05:10:34 api-gateway: Failed authentication for user admin from 203.0.113.75"
    ],
  }
];

export default function App() {
  const [alerts] = useState(INITIAL_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const mapRef = useRef(null);

  // Updated particles initialization
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine); // Using loadSlim instead of loadFull
  }, []);

  const particlesOptions = {
    background: {
      color: "transparent"
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push"
        },
        onHover: {
          enable: true,
          mode: "repulse"
        }
      },
      modes: {
        push: {
          quantity: 4
        },
        repulse: {
          distance: 100,
          duration: 0.4
        }
      }
    },
    particles: {
      color: {
        value: "#7be5ff"
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out"
        },
        random: true,
        speed: 3,
        straight: false,
        trail: {
          enable: true,
          length: 10,
          fillColor: "#020617"
        }
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 30
      },
      opacity: {
        value: 0.5,
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.1,
          sync: false
        }
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 5,
          minimumValue: 0.1,
          sync: false
        }
      }
    }
  };

  const chartData = {
    labels: alerts.map(a => new Date(a.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Alert Score',
      data: alerts.map(a => a.score),
      borderColor: '#7be5ff',
      backgroundColor: 'rgba(123, 229, 255, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#7be5ff',
      pointBorderColor: '#020617',
      pointHoverRadius: 6,
      pointRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        titleColor: '#7be5ff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(123, 229, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const alert = alerts[context.dataIndex];
            return [
              `Score: ${alert.score.toFixed(2)}`,
              `IP: ${alert.ip_address}`,
              `Reason: ${alert.reason}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.2,
          color: 'rgba(255, 255, 255, 0.6)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        border: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          maxRotation: 45
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        border: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div className="app-root">
      <Particles 
        id="tsparticles" 
        init={particlesInit} 
        options={particlesOptions} 
      />

      <div className="container">
        <div className="left-column">
          <div className="panel card chart-panel">
            <div className="panel-header">
              <h3>Attack Trends</h3>
            </div>
            <div className="panel-body chart-body">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="panel card map-panel">
            <div className="panel-header">
              <h3>Geolocation Map</h3>
            </div>
            <div className="panel-body map-body">
              <MapContainer
                ref={mapRef}
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles"
                />
                {alerts.map((alert) => (
                  <Marker
                    key={alert.id}
                    position={[alert.geolocation.lat, alert.geolocation.lng]}
                    icon={markerIcon}
                    eventHandlers={{
                      click: () => setSelectedAlert(alert),
                    }}
                  >
                    <Popup>
                      <div>
                        <h4>{alert.geolocation.city}, {alert.geolocation.country}</h4>
                        <p>{alert.reason}</p>
                        <small>IP: {alert.ip_address}</small>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="panel-header">
            <h3>Real-time Feed</h3>
          </div>
          <div className="panel-body">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="feed-item"
                onClick={() => setSelectedAlert(alert)}
              >
                <div style={{ marginBottom: '8px' }}>
                  <strong>{new Date(alert.timestamp).toLocaleString()}</strong>
                </div>
                <div style={{ marginBottom: '4px', color: '#7be5ff' }}>
                  Score: {alert.score.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.8)' }}>
                  {alert.reason}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.8em', color: 'rgba(255,255,255,0.6)' }}>
                  IP: {alert.ip_address} • {alert.geolocation.city}, {alert.geolocation.country}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedAlert && (
        <div className="modal-backdrop" onClick={() => setSelectedAlert(null)}>
          <div className="modal card" onClick={e => e.stopPropagation()}>
            <h3>Alert Details</h3>
            <div style={{ marginTop: '12px' }}>
              <div><strong>Time:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}</div>
              <div><strong>IP:</strong> {selectedAlert.ip_address}</div>
              <div><strong>Location:</strong> {selectedAlert.geolocation.city}, {selectedAlert.geolocation.country}</div>
              <div><strong>Score:</strong> {selectedAlert.score.toFixed(2)}</div>
              <div><strong>Reason:</strong> {selectedAlert.reason}</div>
            </div>
            <div className="panel-header" style={{ marginTop: '16px' }}>
              <h3>Log Entries</h3>
            </div>
            <div className="log-block">
              {selectedAlert.logs.join('\n')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}