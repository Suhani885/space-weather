import { useState } from "react";
import MetricCard from "./MetricCard";
import RiskScoreGauge from "./RiskScore";
import TimeSeriesChart from "./TimeChart";
import InteractiveMap from "./InteractiveMap";
import {
  Sun,
  Wind,
  Activity,
  Compass,
  Zap,
  AlertTriangle,
  Shield,
  Radio,
  Bell,
} from "lucide-react";

const RenderDashboard = ({ addNotification }) => {
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
  const [subscriptionForm, setSubscriptionForm] = useState({
    email: "",
    phone: "",
    threshold: 6,
    showForm: false,
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    addNotification("Alert subscription activated successfully!", "success");
    setSubscriptionForm((prev) => ({ ...prev, showForm: false }));
  };

  const AlertsPanel = () => (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-yellow-400" />
          Active Alerts
        </h3>
        <button
          onClick={() =>
            setSubscriptionForm((prev) => ({
              ...prev,
              showForm: !prev.showForm,
            }))
          }
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <Bell className="w-4 h-4 mr-2" />
          Subscribe
        </button>
      </div>

      <div className="space-y-3">
        {currentMetrics.gScale >= 2 && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-orange-400 mr-3" />
              <div>
                <div className="text-orange-400 font-medium">
                  Geomagnetic Storm Watch
                </div>
                <div className="text-orange-300 text-sm">
                  G{currentMetrics.gScale} conditions detected. Aurora visible
                  at lower latitudes.
                </div>
              </div>
            </div>
          </div>
        )}

        {currentMetrics.kpIndex >= 5 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <div className="text-red-400 font-medium">
                  High Kp Index Alert
                </div>
                <div className="text-red-300 text-sm">
                  Kp {currentMetrics.kpIndex.toFixed(1)} - Enhanced geomagnetic
                  activity
                </div>
              </div>
            </div>
          </div>
        )}

        {currentMetrics.rScale >= 2 && (
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center">
              <Radio className="w-5 h-5 text-purple-400 mr-3" />
              <div>
                <div className="text-purple-400 font-medium">
                  Radio Blackout
                </div>
                <div className="text-purple-300 text-sm">
                  R{currentMetrics.rScale} - HF radio communications affected
                </div>
              </div>
            </div>
          </div>
        )}

        {currentMetrics.gScale < 2 &&
          currentMetrics.kpIndex < 5 &&
          currentMetrics.rScale < 2 && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-3" />
                <div>
                  <div className="text-green-400 font-medium">
                    Conditions Normal
                  </div>
                  <div className="text-green-300 text-sm">
                    All space weather parameters within normal ranges
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {subscriptionForm.showForm && (
        <div className="mt-6 border-t border-gray-700 pt-6">
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={subscriptionForm.email}
                onChange={(e) =>
                  setSubscriptionForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={subscriptionForm.phone}
                onChange={(e) =>
                  setSubscriptionForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alert Threshold (Kp ≥)
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={subscriptionForm.threshold}
                onChange={(e) =>
                  setSubscriptionForm((prev) => ({
                    ...prev,
                    threshold: parseInt(e.target.value),
                  }))
                }
              >
                {[4, 5, 6, 7, 8, 9].map((val) => (
                  <option key={val} value={val}>
                    Kp {val}+
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Subscribe
              </button>
              <button
                type="button"
                onClick={() =>
                  setSubscriptionForm((prev) => ({ ...prev, showForm: false }))
                }
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <RiskScoreGauge score={currentMetrics.riskScore} />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <MetricCard
            title="Kp Index"
            value={currentMetrics.kpIndex.toFixed(1)}
            unit=""
            icon={Activity}
            color="blue"
            trend={Math.random() > 0.5 ? 2.3 : -1.1}
          />
          <MetricCard
            title="Solar Wind"
            value={Math.round(currentMetrics.solarWindSpeed)}
            unit="km/s"
            icon={Wind}
            color="green"
            trend={Math.random() > 0.5 ? 5.7 : -3.2}
          />
          <MetricCard
            title="Bz Component"
            value={currentMetrics.bz.toFixed(1)}
            unit="nT"
            icon={Compass}
            color="yellow"
            trend={Math.random() > 0.5 ? 12.5 : -8.9}
          />
          <MetricCard
            title="Solar Flare"
            value={currentMetrics.flareClass}
            unit="Class"
            icon={Sun}
            color="orange"
          />
          {/* <MetricCard
            title="Radio Scale"
            value={`R${currentMetrics.rScale}`}
            unit=""
            icon={Radio}
            color="purple"
          /> */}
          {/* <MetricCard
            title="Geomag Scale"
            value={`G${currentMetrics.gScale}`}
            unit=""
            icon={Shield}
            color="red"
          /> */}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TimeSeriesChart
          autoUpdate={true}
          updateInterval={3000}
          showBrush={true}
          height={400}
        />
        <AlertsPanel />
      </div>

      <InteractiveMap />
    </div>
  );
};

export default RenderDashboard;
