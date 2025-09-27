import { useState, useEffect } from "react";
import TimeSeriesChart from "./components/TimeChart";
import InteractiveMap from "./components/InteractiveMap";
import RenderDashboard from "./components/Dashboard";
import "./App.css";
import {
  Satellite,
  Bell,
  Settings,
  Map,
  BarChart3,
  Activity,
} from "lucide-react";

const generateMockData = () => {
  const now = Date.now();
  const data = [];
  for (let i = 23; i >= 0; i--) {
    data.push({
      timestamp: now - i * 3600000,
      kp: Math.random() * 9,
      solarWind: 300 + Math.random() * 400,
      bz: (Math.random() - 0.5) * 20,
      flareClass: Math.random() > 0.8 ? "M" : Math.random() > 0.6 ? "C" : "B",
      rScale: Math.floor(Math.random() * 6),
      sScale: Math.floor(Math.random() * 6),
      gScale: Math.floor(Math.random() * 6),
    });
  }
  return data;
};

const App = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mockMode, setMockMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    riskScore: 45,
    kpIndex: 3.2,
    solarWindSpeed: 425,
    bz: -8.5,
    flareClass: "C2.1",
    rScale: 1,
    sScale: 0,
    gScale: 2,
  });

  useEffect(() => {
    const data = generateMockData();
    setHistoricalData(data);

    const interval = setInterval(() => {
      if (mockMode) {
        setCurrentMetrics((prev) => ({
          ...prev,
          riskScore: Math.min(95, prev.riskScore + Math.random() * 10),
          kpIndex: Math.min(9, prev.kpIndex + Math.random() * 2),
          solarWindSpeed: Math.min(
            800,
            prev.solarWindSpeed + Math.random() * 50
          ),
          gScale: Math.min(5, prev.gScale + (Math.random() > 0.7 ? 1 : 0)),
        }));
      } else {
        setCurrentMetrics((prev) => ({
          ...prev,
          riskScore: Math.max(
            0,
            Math.min(100, prev.riskScore + (Math.random() - 0.5) * 5)
          ),
          kpIndex: Math.max(
            0,
            Math.min(9, prev.kpIndex + (Math.random() - 0.5) * 0.5)
          ),
          solarWindSpeed: Math.max(
            200,
            Math.min(700, prev.solarWindSpeed + (Math.random() - 0.5) * 30)
          ),
          bz: Math.max(-30, Math.min(30, prev.bz + (Math.random() - 0.5) * 3)),
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [mockMode]);

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, message, type, timestamp: Date.now() },
    ]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          Historical Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {["kp", "solarWind", "bz"].map((metric) => (
            <div key={metric} className="h-64">
              <TimeSeriesChart metric={metric} data={historicalData} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 text-white">
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* <div className="bg-blue-500 p-2 rounded-lg">
                <Satellite className="w-8 h-8 text-white" />
              </div> */}
              <div>
                <h1 className="text-2xl font-bold">Space Weather Monitor</h1>
                <p className="text-gray-400">
                  Real-time space weather tracking
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              {[
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "map", label: "Map", icon: Map },
                { id: "analytics", label: "Analytics", icon: Activity },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <RenderDashboard addNotification={addNotification} />
        )}
        {activeTab === "map" && <InteractiveMap />}
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "settings" && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <p className="text-gray-400">
              Settings panel would be implemented here.
            </p>
          </div>
        )}
      </main>

      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          </div>
        ))}
      </div>

      <footer className="bg-gray-800/50 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2025 Solar Weather Monitor. Data updates every 30 seconds.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>NOAA/SWPC</span>
              <span>•</span>
              <span>NASA SDO</span>
              <span>•</span>
              <span>ESA</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .leaflet-container-dark {
          background: #1f2937;
        }
        .leaflet-popup-content-wrapper {
          background: #374151;
          color: white;
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: #374151;
        }
        .leaflet-control-zoom a {
          background: #374151;
          color: white;
          border: 1px solid #4b5563;
        }
        .leaflet-control-zoom a:hover {
          background: #4b5563;
        }
        .leaflet-control-attribution {
          background: rgba(55, 65, 81, 0.8);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default App;
