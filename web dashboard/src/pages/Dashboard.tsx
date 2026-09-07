import { motion } from 'framer-motion';
import { Car, CheckCircle, XCircle, DoorOpen, DoorClosed, CloudRain, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { vehicleAPI } from '../utils/api';
import { useGate } from '../context/GateContext';
import { CardSkeleton } from '../components/LoadingSkeleton';

interface DashboardStats {
  totalToday: number;
  authorized: number;
  unauthorized: number;
  gateStatus: 'open' | 'closed';
  weather: string;
  temperature: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { gateStatus, weather } = useGate();

  useEffect(() => {
    loadStats();
    // Update stats every 5 seconds to match Live Feed refresh rate
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update stats when gate status or weather changes
  useEffect(() => {
    if (stats) {
      const newWeather = weather?.condition || stats.weather;
      const newTemp = weather?.temp || stats.temperature;
      
      if (gateStatus !== stats.gateStatus || newWeather !== stats.weather || newTemp !== stats.temperature) {
        setStats({
          ...stats,
          gateStatus,
          weather: newWeather,
          temperature: newTemp,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateStatus, weather]);

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all events and filter for today
      const response = await vehicleAPI.getEvents({ page: 1, limit: 1000 });
      const allEvents = response.events;
      
      const todayEvents = allEvents.filter(e => {
        const eventDate = new Date(e.timestamp);
        return eventDate >= today;
      });

      const totalToday = todayEvents.length;
      const authorized = todayEvents.filter(e => e.status === 'allowed').length;
      const unauthorized = todayEvents.filter(e => e.status === 'denied').length;

      // Use weather from context (shared with Weather page)
      const currentWeather = weather?.condition || 'Clear';
      const currentTemp = weather?.temp || 22;

      setStats({
        totalToday,
        authorized,
        unauthorized,
        gateStatus: gateStatus, // Use from context
        weather: currentWeather,
        temperature: currentTemp,
      });
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      if (error.response?.status === 403) {
        // If user doesn't have access to events, show empty stats
        setStats({
          totalToday: 0,
          authorized: 0,
          unauthorized: 0,
          gateStatus: gateStatus,
          weather: weather?.condition || 'Clear',
          temperature: weather?.temp || 22,
        });
      }
      setLoading(false);
    }
  };

  // Create stat cards with dynamic Gate Status based on context
  const statCards = [
    {
      title: 'Total Vehicles Today',
      value: stats?.totalToday || 0,
      icon: Car,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    },
    {
      title: 'Authorized Entries',
      value: stats?.authorized || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    },
    {
      title: 'Unauthorized Attempts',
      value: stats?.unauthorized || 0,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-500/10 dark:bg-red-500/20',
    },
    {
      title: 'Gate Status',
      value: gateStatus, // Use gateStatus from context directly
      icon: gateStatus === 'open' ? DoorOpen : DoorClosed, // Dynamic icon based on gate status
      color: gateStatus === 'open' ? 'from-green-500 to-emerald-500' : 'from-gray-500 to-gray-600', // Dynamic colors
      bgColor: gateStatus === 'open' ? 'bg-green-500/10 dark:bg-green-500/20' : 'bg-gray-500/10 dark:bg-gray-500/20', // Dynamic background
      isStatus: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time system overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

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
        <div className="relative flex items-center gap-4">
          <motion.div 
            key={gateStatus}
            className={`w-16 h-16 rounded-xl flex-shrink-0 relative overflow-hidden transition-all duration-500 ${
              gateStatus === 'open' 
                ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30' 
                : 'bg-gradient-to-br from-gray-500/20 to-gray-600/20'
            }`}
            animate={{
              scale: gateStatus === 'open' ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: gateStatus === 'open' ? Infinity : 0,
              repeatDelay: 2,
            }}
          >
            {/* Gate status indicator ring */}
            <motion.div 
              className={`absolute inset-0 rounded-xl border-2 ${
                gateStatus === 'open'
                  ? 'border-green-500 shadow-lg shadow-green-500/50'
                  : 'border-gray-500/50 shadow-lg shadow-gray-500/30'
              }`}
              animate={{
                opacity: gateStatus === 'open' ? [0.5, 1, 0.5] : 0.5,
              }}
              transition={{
                duration: 2,
                repeat: gateStatus === 'open' ? Infinity : 0,
              }}
            />
            <img
              src="/logo.svg"
              alt="Smart Vehicle Access"
              className={`w-full h-full object-contain p-2 transition-all duration-500 ${
                gateStatus === 'open' 
                  ? 'brightness-125 saturate-125' 
                  : 'brightness-75 saturate-75'
              }`}
              style={{ 
                imageRendering: 'crisp-edges' as const,
                filter: gateStatus === 'open' 
                  ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.6)) hue-rotate(120deg)' 
                  : 'drop-shadow(0 0 4px rgba(107, 114, 128, 0.3)) grayscale(0.3)',
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </motion.div>
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Real-time system overview & analytics</p>
          </div>
        </div>
      </motion.div>

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.isStatus ? `gate-status-${gateStatus}` : card.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.03, 
                y: -8,
                transition: { duration: 0.2 }
              }}
              className="group relative overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 -z-10`} />
              
              {/* Card content */}
              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
                {/* Decorative gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-60`} />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {card.title}
                    </p>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
                      {card.isStatus ? (
                        <span className="capitalize text-3xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {card.value}
                        </span>
                      ) : (
                        <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {card.value}
                        </span>
                      )}
                    </p>
                  </div>
                  <motion.div 
                    className={`relative ${card.bgColor} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    key={card.isStatus ? gateStatus : card.title}
                    animate={card.isStatus && gateStatus === 'open' ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={card.isStatus && gateStatus === 'open' ? {
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    } : {}}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-20 rounded-2xl blur-sm`} />
                    <Icon className={`relative w-7 h-7 text-white`} style={{ 
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }} />
                  </motion.div>
                </div>
                
                {/* Live indicator with pulse */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                    <TrendingUp className="relative w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Bar Chart - Vehicle Entries Today */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Vehicle Entries Today
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time access statistics</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Authorized</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    {stats?.authorized || 0}
                  </span>
                </div>
                <div className="relative w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-8 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats && stats.totalToday > 0 ? (stats.authorized / stats.totalToday) * 100 : 0}%` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                    className="relative h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-400 to-rose-500 shadow-lg shadow-red-500/50" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Unauthorized</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                    {stats?.unauthorized || 0}
                  </span>
                </div>
                <div className="relative w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-8 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats && stats.totalToday > 0 ? (stats.unauthorized / stats.totalToday) * 100 : 0}%` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    className="relative h-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-700 dark:text-gray-300">Total Entries</span>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {stats?.totalToday || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Pie Chart - Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-60" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Status Distribution
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Access breakdown analysis</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 drop-shadow-lg">
                  {/* Background circle with glow */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-gray-200/30 dark:text-gray-700/50"
                  />
                  {/* Authorized segment */}
                  {stats && stats.totalToday > 0 && (
                    <motion.circle
                      initial={{ strokeDasharray: '0 251.2' }}
                      animate={{
                        strokeDasharray: `${(stats.authorized / stats.totalToday) * 251.2} 251.2`,
                      }}
                      transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#gradientGreen)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDashoffset="0"
                      filter="url(#glow)"
                    />
                  )}
                  {/* Unauthorized segment */}
                  {stats && stats.totalToday > 0 && stats.unauthorized > 0 && (
                    <motion.circle
                      initial={{ strokeDasharray: '0 251.2' }}
                      animate={{
                        strokeDasharray: `${(stats.unauthorized / stats.totalToday) * 251.2} 251.2`,
                      }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#gradientRed)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDashoffset={stats ? `-${(stats.authorized / stats.totalToday) * 251.2}` : '0'}
                      filter="url(#glow)"
                    />
                  )}
                  <defs>
                    <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="gradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {stats?.totalToday || 0}
                    </div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Total</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50"></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Authorized</span>
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  {stats?.authorized || 0} <span className="text-xs text-gray-500 dark:text-gray-400">({stats && stats.totalToday > 0 ? Math.round((stats.authorized / stats.totalToday) * 100) : 0}%)</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-500/50"></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Unauthorized</span>
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  {stats?.unauthorized || 0} <span className="text-xs text-gray-500 dark:text-gray-400">({stats && stats.totalToday > 0 ? Math.round((stats.unauthorized / stats.totalToday) * 100) : 0}%)</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Weather Card */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-60" />
            <div className="flex items-center gap-4 mb-6">
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg shadow-blue-500/50">
                <CloudRain className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Current Weather
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Environmental conditions</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-800/50">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Condition</span>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {stats?.weather}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Temperature</span>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {stats?.temperature}°C
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium System Status Card */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-60" />
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                System Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">All systems operational</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'AI Model', status: 'Online', color: 'green' },
                { label: 'Camera Feed', status: 'Active', color: 'green' },
                { label: 'Database', status: 'Connected', color: 'green' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-700/50 transition-all"
                >
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                      <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50">
                      {item.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
