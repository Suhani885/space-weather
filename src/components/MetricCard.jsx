import { useState } from "react";
import {
  Info,
  Lightbulb,
  X,
  ExternalLink,
  AlertCircle,
  BookOpen,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";

const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = "blue",
  description,
  showInfo = true,
  warningThreshold,
  criticalThreshold,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [storyData, setStoryData] = useState(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchStoryFromAPI = async () => {
    setIsLoadingStory(true);
    try {
      const queryParams = new URLSearchParams({
        topic: title.toLowerCase().replace(/\s+/g, ""),
      });

      const response = await fetch(
        `https://happy-suggestion-sanyo-usb.trycloudflare.com/story?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      const storyText = data.story;

      let audioUrl = data.audio_url;
      if (audioUrl && !audioUrl.startsWith("http")) {
        audioUrl = `https://happy-suggestion-sanyo-usb.trycloudflare.com${audioUrl}`;
      }

      setStoryData({
        story: storyText,
        audioUrl: audioUrl,
        character: getCharacterName(title),
        impact: getImpactDescription(title, value),
        whatNext: getWhatNextDescription(title, value),
      });

      if (audioUrl) {
        const audioElement = new Audio(audioUrl);
        audioElement.addEventListener("ended", () => setIsPlaying(false));
        audioElement.addEventListener("error", (e) => {
          console.error("Audio loading error:", e);
          console.error("Audio URL:", audioUrl);
        });
        audioElement.addEventListener("loadeddata", () => {
          console.log("Audio loaded successfully:", audioUrl);
        });
        setAudio(audioElement);
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      setStoryData(generateStoryContent(title, value));
    } finally {
      setIsLoadingStory(false);
    }
  };

  const getCharacterName = (title) => {
    const characters = {
      "Kp Index": "Flarey the Solar Flare",
      "Solar Wind": "Windy the Solar Wind",
      "Bz Component": "Buzzy the Magnetic Field",
      "Solar Flare": "Flarey the Solar Flare",
      "Risk Score": "Alert System Alpha",
      "Proton Flux": "Proton Pete",
    };
    return characters[title] || "Space Weather Monitor";
  };

  const getImpactDescription = (title, value) => {
    const numValue = parseFloat(value);
    if (title === "Kp Index" && numValue >= 5) {
      return "Minor to major geomagnetic storm conditions affecting technology systems.";
    } else if (title === "Solar Wind" && numValue >= 600) {
      return "High-speed solar wind enhancing geomagnetic activity.";
    }
    return "Current space weather conditions with minimal to moderate impacts.";
  };

  const getWhatNextDescription = (title, value) => {
    return "Continued monitoring will help predict and prepare for any changes in space weather patterns.";
  };

  const handlePlayPause = async () => {
    if (!storyData?.audioUrl) return;
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      const res = await fetch(storyData.audioUrl);
      const blob = await res.blob();
      const ext = storyData.audioUrl.split(".").pop().toLowerCase();
      const mime =
        ext === "wav"
          ? "audio/wav"
          : ext === "ogg"
          ? "audio/ogg"
          : "audio/mpeg";

      const fixedBlob = new Blob([blob], { type: mime });
      const fixedUrl = URL.createObjectURL(fixedBlob);

      const audioElement = new Audio(fixedUrl);
      audioElement.addEventListener("ended", () => setIsPlaying(false));

      await audioElement.play();
      setAudio(audioElement);
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  };

  const handleStoryClick = async () => {
    setShowStory(true);
    if (!storyData) {
      await fetchStoryFromAPI();
    }
  };

  const getStaticDescription = (title) => {
    const descriptions = {
      "Kp Index": {
        overview:
          "The Kp index is a global geomagnetic activity index that measures disturbances in Earth's magnetic field.",
        details:
          "Ranges from 0 (quiet) to 9 (extreme storm). Values above 5 indicate geomagnetic storms that can affect satellites, GPS, power grids, and create aurora visible at lower latitudes.",
        scale:
          "0-2: Quiet | 3-4: Unsettled | 5-6: Minor Storm | 7-8: Major Storm | 9: Extreme Storm",
        impact:
          "High Kp values can disrupt radio communications, GPS accuracy, and power systems while enhancing aurora visibility.",
        source:
          "Derived from magnetometer data at 13 geomagnetic observatories worldwide",
        learnMoreUrl: "https://www.swpc.noaa.gov/phenomena/geomagnetic-storms",
      },
      "Solar Wind": {
        overview:
          "Solar wind is a stream of charged particles released from the Sun's corona, traveling through space at high speeds.",
        details:
          "Typical speeds range from 300-800 km/s. Higher speeds often indicate coronal mass ejections (CMEs) or high-speed solar wind streams that can trigger geomagnetic activity.",
        scale:
          "300-400 km/s: Slow | 400-600 km/s: Medium | 600+ km/s: High-speed stream",
        impact:
          "High-speed solar wind can compress Earth's magnetosphere and trigger geomagnetic storms, affecting technology and creating aurora.",
        source:
          "Measured by spacecraft like ACE and DSCOVR positioned at the L1 Lagrange point",
        learnMoreUrl:
          "https://www.nasa.gov/feature/goddard/2016/what-is-the-solar-wind",
      },
      "Bz Component": {
        overview:
          "The Bz component measures the north-south direction of the interplanetary magnetic field in solar wind.",
        details:
          "When Bz turns negative (southward), it can reconnect with Earth's magnetic field, allowing solar wind energy to enter our magnetosphere more efficiently.",
        scale:
          "Positive (northward): Shields Earth | Negative (southward): Opens magnetosphere",
        impact:
          "Prolonged negative Bz values below -10 nT can trigger significant geomagnetic storms and intense aurora displays.",
        source: "Measured by magnetometers on solar wind monitoring satellites",
        learnMoreUrl:
          "https://www.swpc.noaa.gov/phenomena/interplanetary-magnetic-field",
      },
      "Solar Flare": {
        overview:
          "Solar flares are intense bursts of radiation from the Sun's surface, classified by their X-ray brightness.",
        details:
          "Classified as A, B, C, M, or X class, with each letter representing a 10-fold increase in energy. X-class flares are the most powerful.",
        scale:
          "A & B: Background | C: Small | M: Medium | X: Large (can cause radio blackouts)",
        impact:
          "Large flares can cause radio blackouts, radiation storms, and can damage satellites and affect astronaut safety.",
        source: "Monitored by GOES satellites and solar observatories like SDO",
        learnMoreUrl:
          "https://www.nasa.gov/content/goddard/what-is-a-solar-flare",
      },
      "Risk Score": {
        overview:
          "A composite risk assessment combining multiple space weather parameters to indicate overall threat level.",
        details:
          "Calculated using Kp index, solar wind parameters, flare activity, and other factors to provide a single threat indicator.",
        scale:
          "0-30: Low | 31-60: Moderate | 61-80: High | 81-100: Extreme Risk",
        impact:
          "Higher scores indicate increased likelihood of technology disruptions, communication issues, and power grid problems.",
        source:
          "Algorithmic combination of real-time space weather measurements",
        learnMoreUrl: "https://www.swpc.noaa.gov/impacts",
      },
      "Proton Flux": {
        overview:
          "Measures the number of high-energy protons hitting Earth from solar particle events.",
        details:
          "Expressed in particle flux units (pfu). High proton flux can occur during solar energetic particle (SEP) events.",
        scale:
          "< 10 pfu: Background | 10-100 pfu: Minor | 100+ pfu: Major radiation storm",
        impact:
          "Can cause radiation exposure to astronauts and airline crews, and can affect satellite electronics.",
        source: "Measured by particle detectors on GOES satellites",
        learnMoreUrl:
          "https://www.swpc.noaa.gov/phenomena/solar-energetic-particles",
      },
    };
    return (
      descriptions[title] || {
        overview: "This metric provides important space weather information.",
        details:
          "Real-time monitoring helps predict and mitigate space weather effects.",
        scale: "Values are continuously monitored and updated.",
        impact: "Space weather can affect technology and human activities.",
        source: "Data from various space weather monitoring systems",
        learnMoreUrl: "https://www.swpc.noaa.gov/",
      }
    );
  };

  const generateStoryContent = (title, value) => {
    return {
      character: getCharacterName(title),
      story:
        "Our space weather monitoring systems are currently tracking this important metric to help understand space weather conditions and their potential impacts.",
      impact:
        "This measurement contributes to our overall understanding of current space weather patterns.",
      whatNext:
        "Continued monitoring will help predict and prepare for any changes in space weather conditions.",
    };
  };

  const metricInfo = description || getStaticDescription(title);

  const getValueStatus = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "normal";

    if (criticalThreshold && numValue >= criticalThreshold) return "critical";
    if (warningThreshold && numValue >= warningThreshold) return "warning";
    return "normal";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      default:
        return "text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const valueStatus = getValueStatus();

  const SpaceAnimation = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 4}s`,
          }}
        />
      ))}

      {[...Array(20)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-green-500/10 animate-pulse" />

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div
          className="w-96 h-96 border border-purple-400/20 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-blue-400/20 rounded-full animate-spin"
          style={{ animationDuration: "15s", animationDirection: "reverse" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-green-400/20 rounded-full animate-spin"
          style={{ animationDuration: "10s" }}
        />
      </div>

      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={`wave-${i}`}
            className="absolute inset-0 border-2 border-cyan-400/20 rounded-full animate-ping"
            style={{
              animationDelay: `${i * 2}s`,
              animationDuration: "6s",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-gray-600 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${color}-500/20`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <div className="flex items-center space-x-2">
            <h3 className="text-gray-300 font-medium">{title}</h3>
            <div className="flex items-center space-x-1">
              {showInfo && (
                <button
                  onClick={() => setShowTooltip(true)}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  title="Learn more about this metric"
                >
                  <Lightbulb className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleStoryClick}
                className="text-gray-400 hover:text-purple-400 transition-colors"
                title="Explain with story"
                disabled={isLoadingStory}
              >
                {isLoadingStory ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(valueStatus)}
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
      </div>

      <div className="flex items-baseline space-x-2">
        <span className={`text-3xl font-bold ${getStatusColor(valueStatus)}`}>
          {value}
        </span>
        <span className="text-gray-400">{unit}</span>
      </div>

      {showTooltip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-600 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-${color}-500/20`}>
                  <Icon className={`w-8 h-8 text-${color}-400`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{title}</h3>
                  <p className="text-gray-400">Space Weather Metric</p>
                </div>
              </div>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      Current Value
                    </div>
                    <div
                      className={`text-3xl font-bold ${getStatusColor(
                        valueStatus
                      )}`}
                    >
                      {value} {unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Status</div>
                    <div
                      className={`text-lg font-medium capitalize ${getStatusColor(
                        valueStatus
                      )}`}
                    >
                      {valueStatus}
                    </div>
                  </div>
                </div>
                {trend && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">24h Change</span>
                      <span
                        className={
                          trend > 0 ? "text-red-400" : "text-green-400"
                        }
                      >
                        {trend > 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-400" />
                  Overview
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {metricInfo.overview}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Detailed Information
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {metricInfo.details}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Scale & Interpretation
                </h4>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-300 font-mono text-sm">
                    {metricInfo.scale}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                  Potential Impact
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {metricInfo.impact}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Data Source
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {metricInfo.source}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
                <a
                  href={metricInfo.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Learn More</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto border border-purple-600 shadow-2xl relative">
            <SpaceAnimation />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {title} Story
                    </h3>
                    <p className="text-gray-400">
                      AI-Generated Space Weather Explanation
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {audio && storyData?.audioUrl && (
                    <button
                      onClick={handlePlayPause}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isPlaying
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      }`}
                      title={isPlaying ? "Pause audio" : "Play audio"}
                    >
                      {isPlaying ? (
                        <VolumeX className="w-6 h-6" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowStory(false);
                      if (audio) {
                        audio.pause();
                        setIsPlaying(false);
                      }
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {isLoadingStory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-300">
                      Generating your space weather story...
                    </p>
                  </div>
                </div>
              ) : storyData ? (
                <div className="space-y-6">
                  <div className="bg-gray-900/70 rounded-xl p-4 backdrop-blur-sm border border-gray-600/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">
                          Current Reading
                        </div>
                        <div
                          className={`text-3xl font-bold ${getStatusColor(
                            valueStatus
                          )}`}
                        >
                          {value} {unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">
                          Character
                        </div>
                        <div className="text-lg font-medium text-purple-400">
                          {storyData.character}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
                      Explanation
                    </h4>
                    <div className="bg-purple-900/30 rounded-lg p-4 border-l-4 border-purple-400 backdrop-blur-sm">
                      <p className="text-gray-100 leading-relaxed text-base">
                        {storyData.story}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                      Real-World Impact
                    </h4>
                    <div className="bg-yellow-900/30 rounded-lg p-4 border-l-4 border-yellow-400 backdrop-blur-sm">
                      <p className="text-gray-100 leading-relaxed">
                        {storyData.impact}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-400" />
                      What Happens Next
                    </h4>
                    <div className="bg-blue-900/30 rounded-lg p-4 border-l-4 border-blue-400 backdrop-blur-sm">
                      <p className="text-gray-100 leading-relaxed">
                        {storyData.whatNext}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      AI Story Generated • {new Date().toLocaleTimeString()}
                    </div>
                    <button
                      onClick={() => {
                        setShowStory(false);
                        setShowTooltip(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm hover:underline"
                    >
                      View Technical Details
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
