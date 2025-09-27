import { Gauge } from "lucide-react";
const RiskScoreGauge = ({ score }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Gauge className="w-6 h-6 mr-2 text-blue-400" />
        Global Risk Score
      </h3>
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={
              score <= 30
                ? "text-green-500"
                : score <= 60
                ? "text-yellow-500"
                : score <= 80
                ? "text-orange-500"
                : "text-red-500"
            }
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round(score)}
            </div>
            <div className="text-xs text-gray-400">RISK</div>
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            score <= 30
              ? "bg-green-500/20 text-green-400"
              : score <= 60
              ? "bg-yellow-500/20 text-yellow-400"
              : score <= 80
              ? "bg-orange-500/20 text-orange-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {score <= 30
            ? "Low Risk"
            : score <= 60
            ? "Moderate Risk"
            : score <= 80
            ? "High Risk"
            : "Extreme Risk"}
        </span>
      </div>
    </div>
  );
};

export default RiskScoreGauge;
