import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Popup,
  useMap,
  LayersControl,
} from "react-leaflet";
import {
  Globe,
  Zap,
  Satellite,
  Maximize2,
  Settings,
  Download,
  RefreshCw,
  MapPin,
  Activity,
  Compass,
} from "lucide-react";

const MapController = ({ center, zoom, onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (map && center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  return null;
};

const InteractiveMap = ({
  data,
  height = 500,
  showControls = true,
  allowFullscreen = true,
  onLocationClick,
}) => {
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

  const [mapSettings, setMapSettings] = useState({
    showAuroralZone: true,
    showObservatories: true,
    showSatellites: true,
    showRadarStations: true,
    showSolarWind: true,
    showMagnetosphere: false,
    animateAurora: true,
    showPopups: true,
  });

  const [mapView, setMapView] = useState({
    center: [65, 0],
    zoom: 2,
    projection: "mercator",
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const mapRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetrics((prev) => ({
        ...prev,
        gScale: Math.max(
          0,
          Math.min(5, prev.gScale + (Math.random() - 0.5) * 0.5)
        ),
        kpIndex: Math.max(
          0,
          Math.min(9, prev.kpIndex + (Math.random() - 0.5) * 0.3)
        ),
        riskScore: Math.max(
          0,
          Math.min(100, prev.riskScore + (Math.random() - 0.5) * 8)
        ),
      }));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const auroralZones = {
    northern: [
      [70, -180],
      [65, -120],
      [60, -90],
      [65, -60],
      [70, 0],
      [65, 60],
      [60, 90],
      [65, 120],
      [70, 180],
      [75, 150],
      [80, 120],
      [85, 60],
      [80, 0],
      [85, -60],
      [80, -120],
      [75, -150],
      [70, -180],
    ],
    southern: [
      [-70, -180],
      [-65, -120],
      [-60, -90],
      [-65, -60],
      [-70, 0],
      [-65, 60],
      [-60, 90],
      [-65, 120],
      [-70, 180],
      [-75, 150],
      [-80, 120],
      [-85, 60],
      [-80, 0],
      [-85, -60],
      [-80, -120],
      [-75, -150],
      [-70, -180],
    ],
  };

  const observatories = [
    {
      lat: 69.6,
      lng: 18.9,
      name: "Tromsø Geophysical Observatory",
      country: "Norway",
      type: "geomagnetic",
      intensity: currentMetrics.gScale,
    },
    {
      lat: 64.8,
      lng: -147.7,
      name: "Poker Flat Research Range",
      country: "Alaska, USA",
      type: "geomagnetic",
      intensity: currentMetrics.gScale,
    },
    {
      lat: 64.1,
      lng: -21.9,
      name: "Reykjavik Observatory",
      country: "Iceland",
      type: "geomagnetic",
      intensity: Math.max(0, currentMetrics.gScale - 1),
    },
    {
      lat: 71.0,
      lng: -8.0,
      name: "Longyearbyen",
      country: "Svalbard",
      type: "geomagnetic",
      intensity: Math.min(5, currentMetrics.gScale + 1),
    },
    {
      lat: 68.8,
      lng: 33.1,
      name: "Murmansk Observatory",
      country: "Russia",
      type: "geomagnetic",
      intensity: currentMetrics.gScale,
    },
    {
      lat: 67.8,
      lng: 20.4,
      name: "Kiruna Observatory",
      country: "Sweden",
      type: "geomagnetic",
      intensity: currentMetrics.gScale,
    },
    {
      lat: -77.8,
      lng: 166.7,
      name: "McMurdo Station",
      country: "Antarctica",
      type: "geomagnetic",
      intensity: Math.max(0, currentMetrics.gScale - 0.5),
    },
  ];

  const satellites = [
    {
      lat: 45.2,
      lng: -75.8,
      name: "ACE Satellite",
      type: "solar_wind",
      status: "operational",
    },
    {
      lat: 38.9,
      lng: -77.0,
      name: "DSCOVR",
      type: "solar_wind",
      status: "operational",
    },
    { lat: 0, lng: 0, name: "SOHO", type: "solar", status: "operational" },
    {
      lat: 89.5,
      lng: 0,
      name: "Polar Satellite",
      type: "magnetosphere",
      status: "operational",
    },
  ];

  const radarStations = [
    {
      lat: 54.9,
      lng: -2.3,
      name: "Millstone Hill",
      country: "UK",
      type: "ionospheric",
    },
    {
      lat: 42.6,
      lng: -71.5,
      name: "Haystack",
      country: "USA",
      type: "ionospheric",
    },
    {
      lat: 69.3,
      lng: 19.2,
      name: "EISCAT Tromsø",
      country: "Norway",
      type: "ionospheric",
    },
    {
      lat: 67.9,
      lng: 21.1,
      name: "EISCAT Kiruna",
      country: "Sweden",
      type: "ionospheric",
    },
  ];

  const getIntensityColor = (intensity) => {
    if (intensity >= 4) return "#dc2626";
    if (intensity >= 3) return "#ea580c";
    if (intensity >= 2) return "#f59e0b";
    if (intensity >= 1) return "#eab308";
    return "#10b981";
  };

  const getIntensityLabel = (intensity) => {
    if (intensity >= 4) return "Extreme";
    if (intensity >= 3) return "Severe";
    if (intensity >= 2) return "Strong";
    if (intensity >= 1) return "Moderate";
    return "Quiet";
  };

  const exportMapData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: currentMetrics,
      observatories: observatories.map((obs) => ({
        name: obs.name,
        location: [obs.lat, obs.lng],
        intensity: obs.intensity,
        visibility: getIntensityLabel(obs.intensity),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aurora_map_data_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const quickViews = [
    { name: "Global", center: [20, 0], zoom: 2, icon: Globe },
    { name: "Arctic", center: [75, 0], zoom: 3, icon: Compass },
    { name: "Antarctic", center: [-75, 0], zoom: 3, icon: Compass },
    { name: "North America", center: [65, -100], zoom: 4, icon: MapPin },
    { name: "Europe", center: [65, 20], zoom: 4, icon: MapPin },
  ];

  const mapHeight = isFullscreen ? "100vh" : `${height}px`;

  return (
    <div
      className={`bg-gray-800 rounded-xl shadow-lg border border-gray-700 transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 flex flex-col rounded-none" : ""
      }`}
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              Global Space Weather Map
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Real-time auroral activity</span>
              <span
                className={`flex items-center ${
                  currentMetrics.gScale >= 3 ? "text-red-400" : "text-green-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-1 ${
                    currentMetrics.gScale >= 3 ? "bg-red-400" : "bg-green-400"
                  } animate-pulse`}
                />
                G{currentMetrics.gScale} conditions
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportMapData}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Export Map Data"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => setLastUpdate(new Date())}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-gray-300" />
          </button>

          {showControls && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Map Settings"
            >
              <Settings className="w-4 h-4 text-gray-300" />
            </button>
          )}

          {allowFullscreen && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="w-4 h-4 text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="px-6 pb-4 border-b border-gray-700">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Layer Controls</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(mapSettings).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setMapSettings((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-gray-300 capitalize">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Aurora Intensity</div>
                <div
                  className={`text-lg font-bold ${getIntensityColor(
                    currentMetrics.gScale
                  ).replace("#", "text-")}`}
                >
                  {getIntensityLabel(currentMetrics.gScale)}
                </div>
              </div>
              <Activity
                className={`w-5 h-5 ${getIntensityColor(
                  currentMetrics.gScale
                ).replace("#", "text-")}`}
              />
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Kp Index</div>
                <div className="text-lg font-bold text-blue-400">
                  {currentMetrics.kpIndex.toFixed(1)}
                </div>
              </div>
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Observatories</div>
                <div className="text-lg font-bold text-green-400">
                  {observatories.length}
                </div>
              </div>
              <Satellite className="w-5 h-5 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Coverage</div>
                <div className="text-lg font-bold text-purple-400">Global</div>
              </div>
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${isFullscreen ? "flex-1" : ""} px-6 mb-5`}
        style={{ height: mapHeight }}
      >
        <div className="h-full rounded-lg overflow-hidden border border-gray-600">
          <MapContainer
            ref={mapRef}
            center={mapView.center}
            zoom={mapView.zoom}
            style={{ height: "100%", width: "100%" }}
            className="leaflet-container-dark"
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <MapController
              center={mapView.center}
              zoom={mapView.zoom}
              onMapReady={(map) => {
                mapRef.current = map;
              }}
            />

            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Dark">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Terrain">
                <TileLayer
                  url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png"
                  attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>'
                />
              </LayersControl.BaseLayer>

              {mapSettings.showAuroralZone && (
                <LayersControl.Overlay checked name="Northern Aurora Zone">
                  <Polygon
                    positions={auroralZones.northern}
                    pathOptions={{
                      color: getIntensityColor(currentMetrics.gScale),
                      fillColor: getIntensityColor(currentMetrics.gScale),
                      fillOpacity: mapSettings.animateAurora
                        ? 0.2 + Math.sin(Date.now() / 2000) * 0.1
                        : 0.3,
                      weight: 2,
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {mapSettings.showAuroralZone && (
                <LayersControl.Overlay checked name="Southern Aurora Zone">
                  <Polygon
                    positions={auroralZones.southern}
                    pathOptions={{
                      color: getIntensityColor(currentMetrics.gScale),
                      fillColor: getIntensityColor(currentMetrics.gScale),
                      fillOpacity: mapSettings.animateAurora
                        ? 0.2 + Math.sin(Date.now() / 2000) * 0.1
                        : 0.3,
                      weight: 2,
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {mapSettings.showObservatories && (
                <LayersControl.Overlay checked name="Observatories">
                  <>
                    {observatories.map((obs, index) => (
                      <CircleMarker
                        key={`obs-${index}`}
                        center={[obs.lat, obs.lng]}
                        radius={8 + obs.intensity * 2}
                        pathOptions={{
                          color: getIntensityColor(obs.intensity),
                          fillColor: getIntensityColor(obs.intensity),
                          fillOpacity: 0.8,
                          weight: 3,
                        }}
                        eventHandlers={{
                          click: () => {
                            setSelectedLocation(obs);
                            if (onLocationClick) onLocationClick(obs);
                          },
                        }}
                      >
                        {mapSettings.showPopups && (
                          <Popup>
                            <div className="text-sm max-w-xs">
                              <div className="font-semibold text-white mb-2">
                                {obs.name}
                              </div>
                              <div className="space-y-1 text-gray-300">
                                <div className="flex justify-between">
                                  <span>Location:</span>
                                  <span>{obs.country}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Aurora Intensity:</span>
                                  <span
                                    className={`font-medium`}
                                    style={{
                                      color: getIntensityColor(obs.intensity),
                                    }}
                                  >
                                    G{obs.intensity} -{" "}
                                    {getIntensityLabel(obs.intensity)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Visibility:</span>
                                  <span>
                                    {obs.intensity >= 2
                                      ? "Excellent"
                                      : obs.intensity >= 1
                                      ? "Good"
                                      : "Limited"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Coordinates:</span>
                                  <span>
                                    {obs.lat.toFixed(1)}°, {obs.lng.toFixed(1)}°
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Popup>
                        )}
                      </CircleMarker>
                    ))}
                  </>
                </LayersControl.Overlay>
              )}

              {mapSettings.showSatellites && (
                <LayersControl.Overlay name="Satellites">
                  <>
                    {satellites.map((sat, index) => (
                      <CircleMarker
                        key={`sat-${index}`}
                        center={[sat.lat, sat.lng]}
                        radius={6}
                        pathOptions={{
                          color:
                            sat.status === "operational"
                              ? "#10b981"
                              : "#ef4444",
                          fillColor:
                            sat.status === "operational"
                              ? "#10b981"
                              : "#ef4444",
                          fillOpacity: 0.8,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="font-semibold">{sat.name}</div>
                            <div>
                              Type: {sat.type.replace("_", " ").toUpperCase()}
                            </div>
                            <div>
                              Status:{" "}
                              <span
                                className={
                                  sat.status === "operational"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }
                              >
                                {sat.status}
                              </span>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </>
                </LayersControl.Overlay>
              )}

              {mapSettings.showRadarStations && (
                <LayersControl.Overlay name="Radar Stations">
                  <>
                    {radarStations.map((station, index) => (
                      <CircleMarker
                        key={`radar-${index}`}
                        center={[station.lat, station.lng]}
                        radius={5}
                        pathOptions={{
                          color: "#8b5cf6",
                          fillColor: "#8b5cf6",
                          fillOpacity: 0.8,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="font-semibold">{station.name}</div>
                            <div>Location: {station.country}</div>
                            <div>
                              Type:{" "}
                              {station.type.replace("_", " ").toUpperCase()}
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </>
                </LayersControl.Overlay>
              )}
            </LayersControl>
          </MapContainer>
        </div>
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
};

export default InteractiveMap;
