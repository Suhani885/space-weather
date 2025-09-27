import { useState, useMemo, useCallback, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Brush,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Maximize2,
  Settings,
  Activity,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";

const generateDummyData = (hours = 24) => {
  const data = [];
  const now = Date.now();

  for (let i = hours; i >= 0; i--) {
    const timestamp = now - i * 3600000;
    const baseKp = 3 + Math.sin(i / 4) * 2 + Math.random() * 1.5;
    const baseSolarWind = 400 + Math.cos(i / 6) * 100 + Math.random() * 50;
    const baseBz = Math.sin(i / 3) * 10 + Math.random() * 5 - 2.5;
    data.push({
      timestamp,
      kp: Math.max(0, Math.min(9, baseKp)),
      solarWind: Math.max(200, Math.min(800, baseSolarWind)),
      bz: Math.max(-30, Math.min(30, baseBz)),
    });
  }

  return data;
};

const TimeSeriesChart = ({
  metric = "kp",
  data: externalData,
  onMetricChange,
  showBrush = false,
  showReferenceLines = true,
  showStats = true,
  allowFullscreen = true,
  allowExport = true,
  height = 320,
  timeRange = "24h",
  autoUpdate = true,
  updateInterval = 5000,
}) => {
  const [selectedMetric, setSelectedMetric] = useState(metric || "kp");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dummyData, setDummyData] = useState(() => generateDummyData(24));
  const [isLiveMode, setIsLiveMode] = useState(autoUpdate);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [chartSettings, setChartSettings] = useState({
    showGrid: true,
    showArea: true,
    showPoints: false,
    smoothLine: true,
    showTrend: true,
  });

  const data = externalData || dummyData;

  useEffect(() => {
    if (!isLiveMode || externalData) return;

    const interval = setInterval(() => {
      setDummyData((prevData) => {
        const newData = [...prevData];
        const lastEntry = newData[newData.length - 1];
        const newTimestamp = Date.now();

        const newEntry = {
          timestamp: newTimestamp,
          kp: Math.max(
            0,
            Math.min(9, lastEntry.kp + (Math.random() - 0.5) * 0.8)
          ),
          solarWind: Math.max(
            200,
            Math.min(800, lastEntry.solarWind + (Math.random() - 0.5) * 40)
          ),
          bz: Math.max(
            -30,
            Math.min(30, lastEntry.bz + (Math.random() - 0.5) * 4)
          ),
        };
        const cutoffTime = newTimestamp - 48 * 3600000;
        return [...newData.filter((d) => d.timestamp > cutoffTime), newEntry];
      });
      setLastUpdate(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isLiveMode, updateInterval, externalData]);

  const formatTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return date.toLocaleTimeString("en-US", {
        minute: "2-digit",
        second: "2-digit",
      });
    } else if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      });
    }
  }, []);

  const getMetricConfig = useCallback((metricKey) => {
    const configs = {
      kp: {
        color: "#3b82f6",
        name: "Kp Index",
        unit: "",
        min: 0,
        max: 9,
        criticalLevel: 5,
        format: (val) => val?.toFixed(1),
        description: "Planetary magnetic activity index",
      },
      solarWind: {
        color: "#10b981",
        name: "Solar Wind Speed",
        unit: "km/s",
        min: 200,
        max: 800,
        criticalLevel: 600,
        format: (val) => Math.round(val),
        description: "Speed of solar wind particles",
      },
      bz: {
        color: "#f59e0b",
        name: "Bz Component",
        unit: "nT",
        min: -30,
        max: 30,
        criticalLevel: -10,
        format: (val) => val?.toFixed(1),
        description: "North-south component of solar magnetic field",
      },
    };
    return configs[metricKey] || configs.kp;
  }, []);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((d) => ({
      time: formatTimestamp(d.timestamp),
      value: d[selectedMetric] || 0,
      timestamp: d.timestamp,
      formattedValue: getMetricConfig(selectedMetric).format(
        d[selectedMetric] || 0
      ),
    }));
  }, [data, selectedMetric, formatTimestamp, getMetricConfig]);

  const stats = useMemo(() => {
    if (!chartData.length) return {};

    const values = chartData.map((d) => d.value).filter((v) => !isNaN(v));
    const current = values[values.length - 1] || 0;
    const previous = values[values.length - 2] || 0;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    return {
      current,
      previous,
      change,
      changePercent,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
    };
  }, [chartData]);

  const config = getMetricConfig(selectedMetric);

  const handleMetricChange = useCallback(
    (newMetric) => {
      setSelectedMetric(newMetric);
      onMetricChange?.(newMetric);
    },
    [onMetricChange]
  );

  const handleExport = useCallback(() => {
    const csvContent = [
      ["Timestamp", "Time", config.name, "Unit"],
      ...chartData.map((d) => [d.timestamp, d.time, d.value, config.unit]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.name.toLowerCase().replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [chartData, config]);

  const refreshData = useCallback(() => {
    if (!externalData) {
      setDummyData(generateDummyData(24));
      setLastUpdate(new Date());
    }
  }, [externalData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg p-4 shadow-xl">
          <div className="text-gray-300 text-sm mb-2">{label}</div>
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-white font-semibold">
              {data.formattedValue} {config.unit}
            </span>
          </div>
          {stats.trend && (
            <div className="flex items-center mt-2 text-xs">
              {stats.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
              ) : stats.trend === "down" ? (
                <TrendingDown className="w-3 h-3 text-red-400 mr-1" />
              ) : (
                <Minus className="w-3 h-3 text-gray-400 mr-1" />
              )}
              <span
                className={`${
                  stats.trend === "up"
                    ? "text-green-400"
                    : stats.trend === "down"
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {Math.abs(stats.changePercent).toFixed(1)}% from previous
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const MetricButton = ({ metricKey, label, isActive }) => (
    <button
      onClick={() => handleMetricChange(metricKey)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-blue-500 text-white shadow-lg transform scale-105"
          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
      }`}
      title={getMetricConfig(metricKey).description}
    >
      {label}
    </button>
  );

  const chartHeight = isFullscreen ? window.innerHeight - 200 : height;

  return (
    <div
      className={`bg-gray-800 rounded-xl shadow-lg border border-gray-700 transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 flex flex-col" : ""
      }`}
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              {config.name} Trend
            </h3>
            <p className="text-sm text-gray-400">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!externalData && (
            <>
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isLiveMode
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title={
                  isLiveMode ? "Pause Live Updates" : "Resume Live Updates"
                }
              >
                {isLiveMode ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={refreshData}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4 text-gray-300" />
              </button>
            </>
          )}

          {allowExport && (
            <button
              onClick={handleExport}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4 text-gray-300" />
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Chart Settings"
          >
            <Settings className="w-4 h-4 text-gray-300" />
          </button>

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

      {showStats && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Current</div>
              <div className="text-lg font-bold text-white">
                {config.format(stats.current)} {config.unit}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Change</div>
              <div
                className={`text-lg font-bold flex items-center ${
                  stats.trend === "up"
                    ? "text-green-400"
                    : stats.trend === "down"
                    ? "text-red-400"
                    : "text-gray-300"
                }`}
              >
                {stats.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : stats.trend === "down" ? (
                  <TrendingDown className="w-4 h-4 mr-1" />
                ) : (
                  <Activity className="w-4 h-4 mr-1" />
                )}
                {Math.abs(stats.changePercent).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Average</div>
              <div className="text-lg font-bold text-white">
                {config.format(stats.avg)} {config.unit}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Range</div>
              <div className="text-lg font-bold text-white">
                {config.format(stats.min)} - {config.format(stats.max)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {["kp", "solarWind", "bz"].map((m) => (
            <MetricButton
              key={m}
              metricKey={m}
              label={getMetricConfig(m).name.split(" ")[0]}
              isActive={selectedMetric === m}
            />
          ))}
        </div>
      </div>

      {showSettings && (
        <div className="px-6 pb-4 border-t border-gray-700 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(chartSettings).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setChartSettings((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div
        className={`px-6 ${isFullscreen ? "flex-1 pb-6" : ""}`}
        style={{ height: chartHeight }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: showBrush ? 60 : 10,
            }}
          >
            {chartSettings.showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                strokeOpacity={0.5}
              />
            )}

            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 5%", "dataMax + 5%"]}
              tickFormatter={(value) => config.format(value)}
            />

            <Tooltip content={<CustomTooltip />} />

            {showReferenceLines && config.criticalLevel && (
              <ReferenceLine
                y={config.criticalLevel}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                label={{
                  value: `Critical: ${config.criticalLevel}`,
                  position: "topRight",
                  fontSize: 12,
                }}
              />
            )}

            {chartSettings.showArea && (
              <Area
                type={chartSettings.smoothLine ? "monotone" : "linear"}
                dataKey="value"
                stroke={config.color}
                fill={config.color}
                fillOpacity={0.2}
                strokeWidth={2}
                dot={chartSettings.showPoints}
                activeDot={{
                  r: 6,
                  stroke: config.color,
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
            )}

            {showBrush && (
              <Brush
                dataKey="time"
                height={30}
                stroke={config.color}
                fill="rgba(59, 130, 246, 0.1)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
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

export default TimeSeriesChart;
