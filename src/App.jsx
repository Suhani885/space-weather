import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import TimeSeriesChart from "./components/TimeChart";
import InteractiveMap from "./components/InteractiveMap";
import RenderDashboard from "./components/Dashboard";
import "./App.css";
import {
  Bell,
  Settings,
  Map,
  BarChart3,
  Activity,
  Globe,
  Zap,
  Radio,
  User,
  Shield,
  ChevronRight,
  TrendingUp,
  Database,
  X,
  Mail,
  UserPlus,
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

const Earth3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      wireframe: false,
      transparent: true,
      opacity: 0.8,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    const earth = new THREE.Mesh(geometry, material);
    const wireframeEarth = new THREE.Mesh(geometry, wireframeMaterial);

    scene.add(earth);
    scene.add(wireframeEarth);

    const atmosphereGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    camera.position.z = 3;

    sceneRef.current = scene;
    rendererRef.current = renderer;

    const animate = () => {
      requestAnimationFrame(animate);

      earth.rotation.y += 0.005;
      wireframeEarth.rotation.y += 0.005;
      atmosphere.rotation.y -= 0.002;

      camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-96 h-96 mx-auto" />;
};

const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        twinkle: Math.random() * 0.02 + 0.01,
      });
    }

    let animationId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.opacity += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

const RegistrationModal = ({ isOpen, onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      alert("Please enter an email address");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://contributor-trends-fluid-nurses.trycloudflare.com/api/subscribe/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
          }),
        }
      );

      if (response.ok) {
        onRegister("Registration successful!", "success");
        onClose();
        setFormData({ username: "", email: "" });
      } else {
        onRegister("Registration failed. Please try again.", "error");
      }
    } catch (error) {
      onRegister("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ username: "", email: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700/50 rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserPlus className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Register</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-800/60 hover:bg-gray-700/80 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 border border-gray-600/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          By registering, you agree to receive space weather monitoring updates
          and alerts.
        </p>
      </div>
    </div>
  );
};

const App = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [activeTab, setActiveTab] = useState("landing");
  const [mockMode, setMockMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
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
          rScale: Math.min(5, prev.rScale + (Math.random() > 0.8 ? 1 : 0)),
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
          rScale: Math.max(
            0,
            Math.min(
              5,
              prev.rScale +
                (Math.random() > 0.8 ? 1 : 0) -
                (Math.random() > 0.8 ? 1 : 0)
            )
          ),
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

  const handleRegistration = (message, type) => {
    addNotification(message, type);
  };

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="bg-gray-900/60 rounded-xl p-6 shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white">Historical Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-10">
          {["kp", "solarWind", "bz"].map((metric) => (
            <div key={metric} className="h-40">
              <TimeSeriesChart metric={metric} data={historicalData} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLandingPage = () => (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/80 to-blue-950/60"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-pattern"></div>
      </div>

      <StarField />

      {/* Enhanced animated elements */}
      <div className="absolute inset-0">
        <div className="solar-wind"></div>
        <div className="solar-wind-secondary"></div>
        <div className="magnetic-field"></div>
        <div className="magnetic-field-inner"></div>
        <div className="aurora"></div>
        <div className="aurora-secondary"></div>
        <div className="orbital-rings"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="text-left space-y-8">
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
                    <span className="block bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl">
                      Space Weather
                    </span>
                    <span className="block text-white mt-2">Monitor</span>
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed font-light">
                    Advanced real-time monitoring platform delivering critical
                    space environment intelligence for
                    <span className="text-cyan-300 font-medium">
                      {" "}
                      aerospace operations
                    </span>
                    ,
                    <span className="text-blue-300 font-medium">
                      {" "}
                      satellite communications
                    </span>
                    , and
                    <span className="text-purple-300 font-medium">
                      {" "}
                      scientific research
                    </span>
                    .
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="group relative bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 text-white font-semibold py-5 px-12 rounded-2xl transition-all duration-500 flex items-center justify-center shadow-2xl shadow-blue-500/25 hover:shadow-cyan-500/40 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <span className="relative z-10">Access Dashboard</span>
                    <ChevronRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform relative z-10" />
                  </button>

                  <button
                    onClick={() => setActiveTab("map")}
                    className="group bg-black/40 hover:bg-gray-800/60 backdrop-blur-xl text-white font-semibold py-5 px-12 rounded-2xl transition-all duration-500 flex items-center justify-center border-2 border-gray-600/50 hover:border-cyan-500/50 shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    <span>Global Map</span>
                    <ChevronRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-12">
                {/* <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
                  <div className="relative z-10 p-8 bg-black/20 backdrop-blur-xl rounded-3xl border border-gray-700/30">
                    <Earth3D />
                  </div>
                </div> */}

                <div className="w-full max-w-3xl">
                  <div className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-2xl border border-gray-700/30 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white font-semibold text-lg">
                          Live Telemetry
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono bg-gray-800/50 px-3 py-1 rounded-full">
                        UTC{" "}
                        {new Date().toLocaleTimeString("en-US", {
                          hour12: false,
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 hover:border-blue-500/40 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                          <Activity className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                          <div
                            className={`w-2 h-2 rounded-full ${
                              currentMetrics.kpIndex > 5
                                ? "bg-red-400 animate-pulse"
                                : currentMetrics.kpIndex > 3
                                ? "bg-yellow-400"
                                : "bg-green-400"
                            }`}
                          ></div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                            Kp Index
                          </div>
                          <div
                            className={`text-4xl font-bold ${
                              currentMetrics.kpIndex > 5
                                ? "text-red-400"
                                : currentMetrics.kpIndex > 3
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {currentMetrics.kpIndex.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {currentMetrics.kpIndex > 5
                              ? "Storm Active"
                              : currentMetrics.kpIndex > 3
                              ? "Disturbed"
                              : "Quiet"}
                          </div>
                        </div>
                      </div>

                      <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 hover:border-cyan-500/40 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                          <Zap className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                            Solar Wind
                          </div>
                          <div className="text-4xl font-bold text-cyan-400">
                            {Math.round(currentMetrics.solarWindSpeed)}
                          </div>
                          <div className="text-xs text-gray-500">
                            km/s velocity
                          </div>
                        </div>
                      </div>

                      <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 hover:border-orange-500/40 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                          <Globe className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                            Solar Flares
                          </div>
                          <div className="text-4xl font-bold text-orange-400">
                            {currentMetrics.flareClass}
                          </div>
                          <div className="text-xs text-gray-500">
                            X-Ray Class
                          </div>
                        </div>
                      </div>

                      <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/40 hover:border-red-500/40 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                          <Radio className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
                          <div
                            className={`w-2 h-2 rounded-full ${
                              currentMetrics.rScale > 2
                                ? "bg-red-400 animate-pulse"
                                : currentMetrics.rScale > 0
                                ? "bg-yellow-400"
                                : "bg-green-400"
                            }`}
                          ></div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                            Radio Impact
                          </div>
                          <div
                            className={`text-4xl font-bold ${
                              currentMetrics.rScale > 2
                                ? "text-red-400"
                                : currentMetrics.rScale > 0
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            R{currentMetrics.rScale}
                          </div>
                          <div className="text-xs text-gray-500">
                            Blackout Scale
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-700/30">
                      <div className="flex items-center justify-between"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                Trusted by aerospace organizations worldwide for comprehensive
                space weather monitoring, risk assessment, and mission
                protection services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 hover:border-blue-500/40 rounded-3xl p-10 hover:transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-cyan-100 transition-colors">
                    Real-Time Analytics
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg group-hover:text-gray-300 transition-colors">
                    Advanced data processing and visualization of solar wind
                    parameters, magnetic field variations, and particle flux
                    measurements with microsecond precision timing.
                  </p>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 hover:border-cyan-500/40 rounded-3xl p-10 hover:transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-cyan-100 transition-colors">
                    Multi-Source Integration
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg group-hover:text-gray-300 transition-colors">
                    Consolidated data streams from NASA DSCOVR, NOAA SWPC, ESA
                    satellites, and ground-based observatories providing
                    comprehensive space environment monitoring.
                  </p>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 hover:border-red-500/40 rounded-3xl p-10 hover:transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-red-100 transition-colors">
                    Mission Protection
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg group-hover:text-gray-300 transition-colors">
                    Proactive risk assessment and intelligent alert systems
                    designed to safeguard critical infrastructure, satellite
                    operations, and crewed space missions.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
                  50+
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">
                  Data Sources
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  24/7
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">
                  Monitoring
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                  99.9%
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">
                  Uptime
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                  &lt;1s
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">
                  Response Time
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .grid-pattern {
          background-image: linear-gradient(
              rgba(59, 130, 246, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 100px 100px;
          width: 100%;
          height: 100%;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100px, 100px);
          }
        }

        @keyframes solarWind {
          0% {
            transform: translateX(-100vw) rotate(0deg);
          }
          100% {
            transform: translateX(100vw) rotate(360deg);
          }
        }

        @keyframes magneticField {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: rotate(180deg) scale(1.2);
            opacity: 0.6;
          }
        }

        @keyframes aurora {
          0%,
          100% {
            opacity: 0.2;
            transform: translateY(0);
          }
          33% {
            opacity: 0.6;
            transform: translateY(-10px);
          }
          66% {
            opacity: 0.8;
            transform: translateY(5px);
          }
        }

        .solar-wind {
          position: absolute;
          top: 25%;
          left: -20%;
          width: 140%;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 215, 0, 0.2) 10%,
            rgba(255, 165, 0, 0.6) 30%,
            rgba(255, 215, 0, 0.8) 50%,
            rgba(255, 165, 0, 0.6) 70%,
            rgba(255, 215, 0, 0.2) 90%,
            transparent 100%
          );
          animation: solarWind 25s linear infinite;
          filter: blur(1px);
        }

        .solar-wind-secondary {
          position: absolute;
          top: 70%;
          left: -20%;
          width: 140%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0, 191, 255, 0.3) 20%,
            rgba(0, 255, 255, 0.5) 50%,
            rgba(0, 191, 255, 0.3) 80%,
            transparent 100%
          );
          animation: solarWind 18s linear infinite reverse;
          filter: blur(0.5px);
        }

        .magnetic-field {
          position: absolute;
          top: 30%;
          right: 15%;
          width: 250px;
          height: 250px;
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 50%;
          animation: magneticField 20s ease-in-out infinite;
        }

        .magnetic-field-inner {
          position: absolute;
          top: 35%;
          right: 20%;
          width: 150px;
          height: 150px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          animation: magneticField 15s ease-in-out infinite reverse;
        }

        .aurora {
          position: absolute;
          bottom: 25%;
          left: 15%;
          width: 400px;
          height: 120px;
          background: linear-gradient(
            45deg,
            rgba(0, 255, 127, 0.4) 0%,
            rgba(0, 191, 255, 0.5) 25%,
            rgba(147, 0, 211, 0.4) 50%,
            rgba(255, 20, 147, 0.3) 75%,
            rgba(0, 255, 127, 0.2) 100%
          );
          border-radius: 60px;
          filter: blur(15px);
          animation: aurora 12s ease-in-out infinite;
        }

        .aurora-secondary {
          position: absolute;
          bottom: 15%;
          right: 20%;
          width: 300px;
          height: 80px;
          background: linear-gradient(
            -45deg,
            rgba(255, 20, 147, 0.3) 0%,
            rgba(147, 0, 211, 0.4) 50%,
            rgba(0, 191, 255, 0.3) 100%
          );
          border-radius: 40px;
          filter: blur(12px);
          animation: aurora 8s ease-in-out infinite reverse;
        }

        .orbital-rings {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 600px;
          height: 600px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: magneticField 30s linear infinite;
        }

        .orbital-rings::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 400px;
          height: 400px;
          border: 1px solid rgba(147, 51, 234, 0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: magneticField 25s linear infinite reverse;
        }

        .orbital-rings::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 800px;
          height: 800px;
          border: 1px solid rgba(6, 182, 212, 0.05);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: magneticField 40s linear infinite;
        }
      `}</style>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative">
      <header className="bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10" />

        <div className="max-w-7xl mx-auto px-6 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                    Space Weather Monitor
                  </h1>
                  <div className="text-xs text-cyan-400/80 font-medium">
                    Real-time Space Activity Tracking
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex items-center space-x-1">
              {[
                {
                  id: "landing",
                  label: "Overview",
                  icon: Activity,
                  color: "from-cyan-500 to-blue-500",
                },
                {
                  id: "dashboard",
                  label: "Control Center",
                  icon: BarChart3,
                  color: "from-purple-500 to-pink-500",
                },
                {
                  id: "map",
                  label: "Global Map",
                  icon: Map,
                  color: "from-green-500 to-emerald-500",
                },
                // {
                //   id: "analytics",
                //   label: "Analytics",
                //   icon: TrendingUp,
                //   color: "from-orange-500 to-red-500",
                // },
                {
                  id: "settings",
                  label: "Settings",
                  icon: Settings,
                  color: "from-gray-500 to-slate-500",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r " +
                        tab.color +
                        " text-white shadow-2xl shadow-cyan-500/25 scale-105"
                      : "text-gray-300 hover:bg-gray-800/80 hover:text-white hover:shadow-lg hover:scale-102"
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  )}
                  <tab.icon
                    className={`w-4 h-4 relative z-10 ${
                      activeTab === tab.id ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="hidden md:inline text-sm relative z-10">
                    {tab.label}
                  </span>

                  {activeTab !== tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsRegistrationModalOpen(true)}
                className="group relative flex items-center space-x-2 bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:from-cyan-800/80 hover:to-blue-900/80 text-white px-5 py-2.5 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/25 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <User className="w-4 h-4 relative z-10 group-hover:animate-pulse" />
                <span className="text-sm font-medium relative z-10">
                  Register
                </span>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main
        className={activeTab === "landing" ? "" : "max-w-7xl mx-auto px-6 py-8"}
      >
        {activeTab === "landing" && renderLandingPage()}
        {activeTab === "dashboard" && (
          <RenderDashboard
            addNotification={addNotification}
            currentMetrics={currentMetrics}
          />
        )}
        {activeTab === "map" && (
          <InteractiveMap currentMetrics={currentMetrics} />
        )}
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "settings" && (
          <div className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">
              System Configuration
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
                <div>
                  <label className="text-white font-medium">
                    Simulation Mode
                  </label>
                  <p className="text-gray-400 text-sm">
                    Enable enhanced solar activity simulation for testing and
                    training
                  </p>
                </div>
                <button
                  onClick={() => setMockMode(!mockMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    mockMode ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mockMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <h3 className="text-white font-medium mb-3">
                    Alert Thresholds
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kp Index Warning:</span>
                      <span className="text-yellow-400">≥ 5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Radio Blackout:</span>
                      <span className="text-red-400">R-Scale ≥ 3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Solar Flare:</span>
                      <span className="text-orange-400">≥ M-Class</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <h3 className="text-white font-medium mb-3">Data Sources</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">NASA DSCOVR:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NOAA SWPC:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ESA Solar Orbiter:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onRegister={handleRegistration}
      />

      <div className="fixed top-20 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 backdrop-blur-lg border ${
              notification.type === "success"
                ? "bg-green-600/90 border-green-500/50 text-white"
                : notification.type === "error"
                ? "bg-red-600/90 border-red-500/50 text-white"
                : "bg-blue-600/90 border-blue-500/50 text-white"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5" />
              <div>
                <div className="font-medium">{notification.message}</div>
                <div className="text-xs opacity-80">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeTab !== "landing" && (
        <footer className="bg-black/90 backdrop-blur-lg border-t border-gray-800/50 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="border-t border-gray-800/50 pt-6 mt-8 flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                © 2025 Space Weather Platform • Space Weather Monitoring
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Data Sources: NASA • NOAA • ESA</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
