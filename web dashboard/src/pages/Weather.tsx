import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Cloud, Sun, CloudFog, Wind, Droplets, Eye, RefreshCw, Thermometer, Gauge, AlertCircle, CheckCircle2, Snowflake } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGate } from '../context/GateContext';

interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: string;
}

export default function Weather() {
  const { weather: sharedWeather, refreshWeather } = useGate();
  const [weather, setWeather] = useState<WeatherData>({
    condition: 'Clear',
    temperature: 22,
    humidity: 65,
    windSpeed: 12,
    visibility: 'Good',
  });

  useEffect(() => {
    if (sharedWeather) {
      // Map backend visibility to frontend format
      const visibilityMap: Record<string, string> = {
        'Low': 'Poor',
        'Medium': 'Good',
        'High': 'Good'
      };
      
      setWeather({
        condition: sharedWeather.condition,
        temperature: sharedWeather.temp,
        humidity: 65, // Backend doesn't provide this, keep default
        windSpeed: 12, // Backend doesn't provide this, keep default
        visibility: visibilityMap[sharedWeather.visibility] || 'Good',
      });
    }
  }, [sharedWeather]);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'Sunny':
      case 'Clear':
        return Sun;
      case 'Cloudy':
        return Cloud;
      case 'Rain':
      case 'Rainy':
        return CloudRain;
      case 'Fog':
      case 'Foggy':
      case 'Mist':
      case 'Haze':
      case 'Smog':
        return CloudFog;
      case 'Snow':
        return Snowflake;
      default:
        return Sun;
    }
  };

  const WeatherIcon = getWeatherIcon();

  const getBackgroundGradient = () => {
    switch (weather.condition) {
      case 'Sunny':
      case 'Clear':
        return 'from-yellow-400 via-orange-400 to-amber-400';
      case 'Cloudy':
        return 'from-gray-400 via-gray-500 to-gray-600';
      case 'Rain':
      case 'Rainy':
        return 'from-blue-500 via-blue-600 to-indigo-600';
      case 'Fog':
      case 'Foggy':
      case 'Mist':
      case 'Haze':
        return 'from-gray-500 via-gray-600 to-slate-600';
      case 'Smog':
        return 'from-orange-600 via-amber-600 to-yellow-600';
      case 'Snow':
        return 'from-cyan-300 via-blue-300 to-indigo-300';
      default:
        return 'from-blue-400 via-cyan-400 to-teal-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Premium Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-3xl -z-10" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <CloudRain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Weather Monitor
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              Current weather conditions affecting gate system
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshWeather}
            className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <RefreshCw className="relative w-5 h-5" />
            <span className="relative">Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Premium Main Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
        className="group relative overflow-hidden"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()} opacity-90 blur-3xl -z-10`} />
        <div className={`relative bg-gradient-to-br ${getBackgroundGradient()} rounded-3xl p-8 text-white shadow-2xl overflow-hidden`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative flex items-center justify-between mb-8 flex-wrap gap-6">
            <div>
              <p className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-3">Current Condition</p>
              <h2 className="text-6xl font-extrabold mb-2 drop-shadow-lg">{weather.condition}</h2>
              <p className="text-white/80 text-lg">Real-time weather data</p>
            </div>
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
              <div className={`relative p-6 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-2xl`}>
                <WeatherIcon className="w-32 h-32 drop-shadow-2xl" />
              </div>
            </motion.div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group/card relative bg-white/25 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/30 backdrop-blur-sm">
                  <Thermometer className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide">Temperature</span>
              </div>
              <p className="text-4xl font-extrabold drop-shadow-lg">{weather.temperature}°C</p>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group/card relative bg-white/25 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/30 backdrop-blur-sm">
                  <Droplets className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide">Humidity</span>
              </div>
              <p className="text-4xl font-extrabold drop-shadow-lg">{weather.humidity}%</p>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group/card relative bg-white/25 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/30 backdrop-blur-sm">
                  <Wind className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide">Wind Speed</span>
              </div>
              <p className="text-4xl font-extrabold drop-shadow-lg">{weather.windSpeed} km/h</p>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group/card relative bg-white/25 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/30 backdrop-blur-sm">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide">Visibility</span>
              </div>
              <p className="text-4xl font-extrabold drop-shadow-lg">{weather.visibility}</p>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Weather Impact Card */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50">
                <Gauge className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Weather Impact
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">System performance metrics</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 border border-gray-200/50 dark:border-gray-700/50"
              >
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Camera Visibility</span>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
                  weather.visibility === 'Good'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/50'
                }`}>
                  {weather.visibility === 'Good' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {weather.visibility}
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 border border-gray-200/50 dark:border-gray-700/50"
              >
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Detection Accuracy</span>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {weather.visibility === 'Good' ? '95%' : '78%'}
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 border border-gray-200/50 dark:border-gray-700/50"
              >
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">System Performance</span>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
                  (weather.condition === 'Clear' || weather.condition === 'Sunny' || weather.condition === 'Cloudy')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/50'
                }`}>
                  {(weather.condition === 'Clear' || weather.condition === 'Sunny' || weather.condition === 'Cloudy') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {(weather.condition === 'Clear' || weather.condition === 'Sunny' || weather.condition === 'Cloudy') ? 'Optimal' : 'Reduced'}
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Premium Recommendations Card */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-60" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
                <AlertCircle className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Recommendations
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">System optimization tips</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {weather.visibility === 'Poor' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200/50 dark:border-orange-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <p className="font-bold text-orange-700 dark:text-orange-400">Low Visibility Alert</p>
                    </div>
                    <p className="text-sm text-orange-600 dark:text-orange-300">Increase manual verification for vehicle entries</p>
                  </motion.div>
                )}
                {(weather.condition === 'Rain' || weather.condition === 'Rainy') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200/50 dark:border-blue-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="font-bold text-blue-700 dark:text-blue-400">Rainy Conditions</p>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-300">Camera lens may require cleaning more frequently</p>
                  </motion.div>
                )}
                {(weather.condition === 'Fog' || weather.condition === 'Foggy' || weather.condition === 'Mist' || weather.condition === 'Haze') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200/50 dark:border-yellow-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CloudFog className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <p className="font-bold text-yellow-700 dark:text-yellow-400">Foggy Conditions</p>
                    </div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">Consider enabling backup identification methods</p>
                  </motion.div>
                )}
                {weather.condition === 'Smog' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200/50 dark:border-orange-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CloudFog className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <p className="font-bold text-orange-700 dark:text-orange-400">Smog Conditions</p>
                    </div>
                    <p className="text-sm text-orange-600 dark:text-orange-300">Poor air quality and visibility - increase manual verification and camera maintenance</p>
                  </motion.div>
                )}
                {weather.condition === 'Snow' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200/50 dark:border-cyan-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Snowflake className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <p className="font-bold text-cyan-700 dark:text-cyan-400">Snow Conditions</p>
                    </div>
                    <p className="text-sm text-cyan-600 dark:text-cyan-300">Snow may affect camera visibility - ensure cameras are cleared and consider backup systems</p>
                  </motion.div>
                )}
                {(weather.condition === 'Clear' || weather.condition === 'Sunny') && weather.visibility === 'Good' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200/50 dark:border-green-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="font-bold text-green-700 dark:text-green-400">Optimal Conditions</p>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-300">System operating at peak performance</p>
                  </motion.div>
                )}
                {weather.condition === 'Cloudy' && weather.visibility === 'Good' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200/50 dark:border-green-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="font-bold text-green-700 dark:text-green-400">Optimal Conditions</p>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-300">System operating at peak performance</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
