// App.js
import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Use Leaflet's default marker via CDN asset (works in CRA)
const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- Your JSON data used as a JS object (two sample alerts) ---
const INITIAL_ALERTS = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    timestamp: "2025-08-13T17:30:00Z",
    score: 0.98,
    ip_address: "203.0.113.42",
    reason:
      "Brute-force attack detected due to 50+ failed logins in one minute.",
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
];

export default function App() {
  const [alerts] = useState(INITIAL_ALERTS); // static for now
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Prepare chart data (simple count per alert time)
  const chartData = useMemo(() => {
    const labels = alerts.map((a) =>
      new Date(a.timestamp).toLocaleString()
    );
    const dataset = alerts.map(() => 1); // each alert counts as 1
    return {
      labels,
      datasets: [
        {
          label: "Attacks",
          data: dataset,
          fill: false,
          borderColor: "#7be5ff",
          backgroundColor: "#7be5ff",
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    };
  }, [alerts]);

  // tsparticles init
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <div className="app-root">
      {/* Particle background (meteor shower-like) */}


<Particles
  id="tsparticles"
  className="particles"
  init={particlesInit}
  options={{
    background: { color: { value: "transparent" } }, // let page background show through
    fpsLimit: 60,
    particles: {
      number: { value: 120, density: { enable: true, area: 800 } },
      color: { value: "#9be7ff" },
      shape: { type: "circle" },
      opacity: { value: { min: 0.4, max: 0.9 }, random: true },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        speed: 4.5,
        direction: "bottom-right",
        outModes: "out",
        trail: { enable: true, length: 6, fillColor: "#020617" }
      },
      rotate: { value: 0, random: true, animation: { enable: false } }
    },
    interactivity: {
      detectsOn: "canvas",
      events: { onHover: { enable: false }, onClick: { enable: false }, resize: true }
    },
    detectRetina: true
  }}
/>



      {/* Layout grid */}
      <div className="container">
        {/* LEFT: stacked chart (top) and map (bottom) */}
        <div className="left-column">
          <div className="panel card chart-panel">
            <div className="panel-header">
              <h3>Attack Trends</h3>
            </div>
            <div className="panel-body chart-body">
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="panel card map-panel">
            <div className="panel-header">
              <h3>Geolocation Map</h3>
            </div>
            <div className="panel-body map-body">
              <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {alerts.map((a) => (
                  <Marker key={a.id} position={[a.geolocation.lat, a.geolocation.lng]} icon={markerIcon}>
                    <Popup>
                      <div>
                        <strong>{a.ip_address}</strong>
                        <div>{a.geolocation.city}, {a.geolocation.country}</div>
                        <div style={{ marginTop: 6 }}>
                          <button onClick={() => { setSelectedAlert(a); }}>
                            View details
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* RIGHT: real-time feed panel */}
        <aside className="right-column card feed-panel">
          <div className="panel-header">
            <h3>Real-time Feed</h3>
            <div className="feed-sub">Latest alerts — click to expand</div>
          </div>
          <div className="panel-body feed-body">
            <ul className="feed-list">
              {alerts.map((a) => (
                <li key={a.id} className="feed-item" onClick={() => setSelectedAlert(a)}>
                  <div className="feed-item-top">
                    <div className="feed-time">{new Date(a.timestamp).toLocaleString()}</div>
                    <div className="feed-score">score: {a.score}</div>
                  </div>
                  <div className="feed-reason">{a.reason}</div>
                  <div className="feed-ip">IP: {a.ip_address} • {a.geolocation.city}, {a.geolocation.country}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Modal: detailed alert view */}
      {selectedAlert && (
        <div className="modal-backdrop" onClick={() => setSelectedAlert(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Alert Details</h4>
              <button className="close-btn" onClick={() => setSelectedAlert(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p><strong>ID:</strong> {selectedAlert.id}</p>
              <p><strong>Timestamp:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}</p>
              <p><strong>Score:</strong> {selectedAlert.score}</p>
              <p><strong>Reason:</strong> {selectedAlert.reason}</p>
              <p><strong>IP Address:</strong> {selectedAlert.ip_address}</p>
              <p><strong>Location:</strong> {selectedAlert.geolocation.city}, {selectedAlert.geolocation.country}</p>
              <h5>Raw logs</h5>
              <pre className="log-block">{selectedAlert.logs.join("\n")}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
