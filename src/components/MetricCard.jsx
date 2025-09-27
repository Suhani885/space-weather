const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = "blue",
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${color}-500/20`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <h3 className="text-gray-300 font-medium">{title}</h3>
        </div>
        {trend && (
          <span
            className={`text-sm px-2 py-1 rounded-full ${
              trend > 0
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-gray-400">{unit}</span>
      </div>
    </div>
  );
};

export default MetricCard;
