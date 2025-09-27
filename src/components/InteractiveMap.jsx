import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Popup,
} from "react-leaflet";
import { Globe } from "lucide-react";

const InteractiveMap = () => {
  const auroralZone = [
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
  ];
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
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Globe className="w-6 h-6 mr-2 text-blue-400" />
        Auroral Activity Map
      </h3>
      <div className="h-96 w-full rounded-lg overflow-hidden">
        <MapContainer
          center={[65, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
          className="leaflet-container-dark"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <Polygon
            positions={auroralZone}
            pathOptions={{
              color:
                currentMetrics.gScale >= 3
                  ? "#ef4444"
                  : currentMetrics.gScale >= 1
                  ? "#f59e0b"
                  : "#10b981",
              fillColor:
                currentMetrics.gScale >= 3
                  ? "#ef4444"
                  : currentMetrics.gScale >= 1
                  ? "#f59e0b"
                  : "#10b981",
              fillOpacity: 0.3,
              weight: 2,
            }}
          />
          {[
            {
              lat: 69.6,
              lng: 18.9,
              name: "Tromsø, Norway",
              intensity: currentMetrics.gScale,
            },
            {
              lat: 64.8,
              lng: -147.7,
              name: "Fairbanks, Alaska",
              intensity: currentMetrics.gScale,
            },
            {
              lat: 64.1,
              lng: -21.9,
              name: "Reykjavik, Iceland",
              intensity: Math.max(0, currentMetrics.gScale - 1),
            },
          ].map((point) => (
            <CircleMarker
              key={point.name}
              center={[point.lat, point.lng]}
              radius={8 + point.intensity * 2}
              pathOptions={{
                color:
                  point.intensity >= 3
                    ? "#ef4444"
                    : point.intensity >= 1
                    ? "#f59e0b"
                    : "#10b981",
                fillColor:
                  point.intensity >= 3
                    ? "#ef4444"
                    : point.intensity >= 1
                    ? "#f59e0b"
                    : "#10b981",
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{point.name}</strong>
                  <br />
                  Aurora Intensity: G{point.intensity}
                  <br />
                  Visibility:{" "}
                  {point.intensity >= 2
                    ? "High"
                    : point.intensity >= 1
                    ? "Moderate"
                    : "Low"}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-400">
        <span>Live auroral zone visualization</span>
        <span>G-Scale: G{currentMetrics.gScale}</span>
      </div>
    </div>
  );
};

export default InteractiveMap;
