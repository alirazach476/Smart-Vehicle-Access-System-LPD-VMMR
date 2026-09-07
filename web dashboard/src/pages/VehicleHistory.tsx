import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw, History, Clock, Cloud, CloudRain, CloudFog, Sun, CheckCircle2, XCircle, TrendingUp, Users, Car, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { vehicleAPI, VehicleEvent } from '../utils/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import VehicleDetailModal from '../components/VehicleDetailModal';
import { useNotification } from '../context/NotificationContext';

export default function VehicleHistory() {
  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<VehicleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<VehicleEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'allowed' | 'denied' | 'temporary-allow'>('all');
  const [weatherFilter, setWeatherFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 10;
  const { showNotification } = useNotification();

  // Helper function to get weather icon and colors
  const getWeatherIcon = (condition: string) => {
    const normalized = condition?.toLowerCase() || '';
    
    if (normalized.includes('sunny') || normalized.includes('clear')) {
      return {
        icon: Sun,
        color: 'from-yellow-500/20 to-orange-500/20',
        iconColor: 'text-yellow-600 dark:text-yellow-400'
      };
    } else if (normalized.includes('rain')) {
      return {
        icon: CloudRain,
        color: 'from-blue-500/20 to-indigo-500/20',
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    } else if (normalized.includes('fog') || normalized.includes('mist') || normalized.includes('haze')) {
      return {
        icon: CloudFog,
        color: 'from-gray-500/20 to-slate-500/20',
        iconColor: 'text-gray-600 dark:text-gray-400'
      };
    } else if (normalized.includes('cloudy')) {
      return {
        icon: Cloud,
        color: 'from-gray-400/20 to-gray-500/20',
        iconColor: 'text-gray-600 dark:text-gray-400'
      };
    } else {
      // Default to cloud
      return {
        icon: Cloud,
        color: 'from-cyan-500/20 to-blue-500/20',
        iconColor: 'text-cyan-600 dark:text-cyan-400'
      };
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter, weatherFilter, currentPage]);

  const loadEvents = async () => {
    try {
      const response = await vehicleAPI.getEvents({ page: 1, limit: 1000 });
      setEvents(response.events || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Generate a new vehicle prediction
      const newVehicle = await vehicleAPI.getPrediction();
      
      // Save it to the database
      await vehicleAPI.createEvent(newVehicle);
      
      // Show notification
      if (newVehicle.status === 'denied') {
        showNotification('unauthorized', `Unauthorized vehicle detected: ${newVehicle.plate_number}`);
      } else {
        showNotification('system', `New vehicle added: ${newVehicle.plate_number}`);
      }
      
      // Reload events to show the new vehicle
      await loadEvents();
      setRefreshing(false);
    } catch (error) {
      console.error('Error refreshing and adding vehicle:', error);
      showNotification('system', 'Failed to add new vehicle');
      setRefreshing(false);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    let filtered = [...events];

    // Filter out events from expired temporary vehicles or before entry time
    filtered = filtered.filter(e => {
      if (e.temporaryAccess) {
        // Check entry time - event should only appear after entry time
        if (e.entryTime) {
          const entryDate = new Date(e.entryTime);
          if (entryDate > now) {
            return false; // Entry time not reached yet
          }
        }
        // Check expiry - event should disappear after expiry
        if (e.expiry) {
          const expiryDate = new Date(e.expiry);
          if (expiryDate <= now) {
            return false; // Expired
          }
        }
      }
      return true;
    });

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.plate_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'temporary-allow') {
        // Filter for temporary allow - check if event has temporary access flag
        filtered = filtered.filter(e => {
          return e.temporaryAccess === true && e.status === 'allowed';
        });
      } else {
        filtered = filtered.filter(e => e.status === statusFilter);
      }
    }

    if (weatherFilter !== 'all') {
      filtered = filtered.filter(e => e.weather_condition === weatherFilter);
    }

    setFilteredEvents(filtered);
  };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const weatherOptions = ['all', 'Sunny', 'Cloudy', 'Rain', 'Fog', 'Mist', 'Haze'];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-3xl -z-10" />
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Vehicle History
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Search and filter vehicle access logs</p>
        </div>
        <TableSkeleton rows={10} />
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
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Vehicle History
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              Search and filter vehicle access logs
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <RefreshCw className={`relative w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="relative">{refreshing ? 'Adding...' : 'Refresh & Add Vehicle'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Premium Search & Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/30 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Premium Search Input */}
            <div className="flex-1 relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/search:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by license plate..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
              />
            </div>

            {/* Professional Filter Selects */}
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative group/select"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-2xl blur-xl opacity-0 group-hover/select:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover/select:opacity-100 transition-opacity duration-300" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="relative appearance-none min-w-[180px] px-6 py-3.5 pr-14 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-gray-900 dark:text-gray-100 font-bold text-sm shadow-2xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer z-10"
                >
                  <option value="all" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">All Status</option>
                  <option value="allowed" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Allowed</option>
                  <option value="denied" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Denied</option>
                  <option value="temporary-allow" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Temporary Allow</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <Filter className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-4 border-l-purple-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative group/select"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-teal-500/30 rounded-2xl blur-xl opacity-0 group-hover/select:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover/select:opacity-100 transition-opacity duration-300" />
                <select
                  value={weatherFilter}
                  onChange={e => setWeatherFilter(e.target.value)}
                  className="relative appearance-none min-w-[180px] px-6 py-3.5 pr-14 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-600 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-gray-100 font-bold text-sm shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer z-10"
                >
                  {weatherOptions.map(weather => (
                    <option key={weather} value={weather} className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                      {weather === 'all' ? 'All Weather' : weather}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Cloud className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-4 border-l-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Results Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Showing <span className="text-blue-600 dark:text-blue-400 font-bold">{paginatedEvents.length}</span> of{' '}
                <span className="text-purple-600 dark:text-purple-400 font-bold">{filteredEvents.length}</span> results
              </span>
            </div>
            {filteredEvents.length > 0 && (
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Premium Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Image
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Plate Number
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Confidence
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Weather
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Timestamp
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                <AnimatePresence>
                  {paginatedEvents.map((event, index) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.03,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.01,
                        transition: { duration: 0.2 }
                      }}
                      className="group/row hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-300"
                    >
                      {/* Image */}
                      <td className="px-6 py-5">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 overflow-hidden shadow-lg group-hover/row:shadow-xl transition-shadow"
                        >
                          {event.image_url ? (
                            <img
                              src={event.image_url}
                              alt={event.plate_number}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-600/10">
                              <Eye className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity" />
                        </motion.div>
                      </td>
                      
                      {/* Plate Number */}
                      <td className="px-6 py-5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                              {event.plate_number}
                            </p>
                            {event.isGuest && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                <Users className="w-3 h-3" />
                                Guest
                              </span>
                            )}
                            {event.isPersonalVehicle && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                <Car className="w-3 h-3" />
                                Personal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {event.make} {event.model}
                          </p>
                          {event.isGuest && event.guestInfo && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                              <User className="w-3 h-3" />
                              {event.guestInfo.visitorName || 'Guest Visitor'}
                              {event.guestInfo.purpose && ` • ${event.guestInfo.purpose}`}
                            </p>
                          )}
                          {event.isPersonalVehicle && event.vehicleInfo?.owner && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Owner: {event.vehicleInfo.owner.username}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* Confidence */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {(event.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      
                      {/* Weather */}
                      <td className="px-6 py-5">
                        {(() => {
                          const weather = getWeatherIcon(event.weather_condition);
                          const WeatherIcon = weather.icon;
                          return (
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${weather.color}`}>
                                <WeatherIcon className={`w-4 h-4 ${weather.iconColor}`} />
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {event.weather_condition}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      
                      {/* Timestamp */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-5">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center gap-2"
                        >
                          {event.status === 'allowed' ? (
                            event.temporaryAccess ? (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50">
                                <CheckCircle2 className="w-4 h-4" />
                                Temporary Allow
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50">
                                <CheckCircle2 className="w-4 h-4" />
                                Allowed
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/50">
                              <XCircle className="w-4 h-4" />
                              Denied
                            </span>
                          )}
                        </motion.div>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-5">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedEvent(event)}
                          className="group/btn relative overflow-hidden flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                          <Eye className="relative w-4 h-4" />
                          <span className="relative">View Details</span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="p-16 text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <Filter className="w-16 h-16 text-gray-400 mx-auto" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Premium Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="group relative overflow-hidden p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ChevronLeft className="relative w-5 h-5 text-gray-700 dark:text-gray-300" />
          </motion.button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentPage(page)}
                className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-110'
                    : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                {currentPage === page && (
                  <motion.div
                    layoutId="activePage"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{page}</span>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="group relative overflow-hidden p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ChevronRight className="relative w-5 h-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
        </motion.div>
      )}

      <VehicleDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
