import { motion, AnimatePresence } from 'framer-motion';
import { Eye, RefreshCw, Radio, Clock, Cloud, CloudRain, CloudFog, Sun, CheckCircle2, XCircle, Users, Car, User, Filter, Video, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { vehicleAPI, VehicleEvent } from '../utils/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import VehicleDetailModal from '../components/VehicleDetailModal';
import { useNotification } from '../context/NotificationContext';
import { isAdmin, hasAdminAccess } from '../utils/auth';

export default function LiveFeed() {
  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<VehicleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<VehicleEvent | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'allowed' | 'denied' | 'temporary-allow'>('all');
  const [showCameraFeed, setShowCameraFeed] = useState(true);
  const [cameraFullscreen, setCameraFullscreen] = useState(false);
  const { showNotification } = useNotification();
  const admin = isAdmin();
  const hasAccess = hasAdminAccess(); // Check for admin OR admin access privileges

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
  }, [events, statusFilter]);

  useEffect(() => {
    if (autoRefresh) {
      if (hasAccess) {
        // Admin or users with admin access: Auto-refresh with event creation
        const interval = setInterval(async () => {
          try {
            // Generate and add a new vehicle on auto-refresh
            const newVehicle = await vehicleAPI.getPrediction();
            await vehicleAPI.createEvent(newVehicle);
            
            if (newVehicle.status === 'denied') {
              showNotification('unauthorized', `Unauthorized vehicle detected: ${newVehicle.plate_number}`);
            }
            
            // Reload events
            await loadEvents(true);
          } catch (error: any) {
            console.error('Error in auto-refresh:', error);
            if (error.response?.status === 403) {
              showNotification('system', 'Auto-refresh disabled. Admin privileges required.');
              setAutoRefresh(false);
            }
            // Still try to load events even if adding fails
            await loadEvents(true);
          }
        }, 10000); // 10 seconds
        return () => clearInterval(interval);
      } else {
        // Regular users: Auto-refresh events list to see new events in real-time
        const interval = setInterval(async () => {
          await loadEvents(true);
        }, 5000); // Refresh every 5 seconds for regular users to catch updates quickly
        return () => clearInterval(interval);
      }
    }
  }, [autoRefresh, hasAccess]);

  const loadEvents = async (isAutoRefresh = false) => {
    try {
      const response = await vehicleAPI.getEvents({ page: 1, limit: 20 });
      const newEvents = response.events;

      if (isAutoRefresh && newEvents && newEvents.length > 0) {
        const prevLength = events.length;
        if (newEvents.length > prevLength) {
          const newEvent = newEvents[0];
          if (newEvent.status === 'denied') {
            showNotification('unauthorized', `Unauthorized vehicle detected: ${newEvent.plate_number}`);
          }
        }
      }

      setEvents(newEvents || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading events:', error);
      if (error.response?.status === 401) {
        showNotification('system', 'Please log in to view events.');
      } else {
        showNotification('system', 'Failed to load events. Please try again.');
      }
      setLoading(false);
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

    setFilteredEvents(filtered);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      if (hasAccess) {
        // Admin or users with admin access: Generate and add new vehicles
        const newVehicle = await vehicleAPI.getPrediction();
        await vehicleAPI.createEvent(newVehicle);
        
        if (newVehicle.status === 'denied') {
          showNotification('unauthorized', `Unauthorized vehicle detected: ${newVehicle.plate_number}`);
        } else {
          showNotification('system', `New vehicle detected: ${newVehicle.plate_number}`);
        }
      } else {
        // Regular users can only refresh the events list
        showNotification('system', 'Refreshing events...');
      }
      
      // Reload events to show updates
      await loadEvents();
    } catch (error: any) {
      console.error('Error refreshing:', error);
      if (error.response?.status === 403) {
        // For regular users, this is expected - they can't create events
        if (!hasAccess) {
          showNotification('system', 'Events refreshed.');
        } else {
          showNotification('system', 'Access denied. Admin privileges required to add vehicles.');
        }
      } else {
        showNotification('system', 'Failed to refresh events.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-3xl -z-10" />
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Live Vehicle Feed
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Real-time vehicle detection stream</p>
        </div>
        <TableSkeleton rows={8} />
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
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
                <Radio className="relative w-6 h-6 text-blue-500" />
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Live Vehicle Feed
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Real-time vehicle detection stream</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Professional Status Filter */}
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
            
            {/* Premium Auto-refresh Toggle */}
            <motion.label
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={e => setAutoRefresh(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-14 h-7 rounded-full transition-all duration-300 ${
                  autoRefresh 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <motion.div
                    className="w-6 h-6 bg-white rounded-full shadow-lg mt-0.5 ml-0.5"
                    animate={{ x: autoRefresh ? 28 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Auto-refresh
              </span>
            </motion.label>
            
            {/* Premium Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <RefreshCw className={`relative w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="relative">{loading ? 'Adding...' : 'Refresh & Add Vehicle'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Camera Feed Section */}
      {showCameraFeed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className={`group relative overflow-hidden ${cameraFullscreen ? 'fixed inset-4 z-50' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
            
            <div className="p-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                  <Video className="relative w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Camera Feed</h3>
                <span className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCameraFullscreen(!cameraFullscreen)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {cameraFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCameraFeed(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              {/* Simulated camera feed with latest vehicle image */}
              {filteredEvents.length > 0 ? (
                <motion.img
                  key={filteredEvents[0].id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${filteredEvents[0].image_url}`}
                  alt="Live Camera Feed"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-400">
                  <Video className="w-16 h-16 opacity-50" />
                  <p className="text-lg font-semibold">Waiting for vehicle detection...</p>
                </div>
              )}
              
              {/* Overlay with detection info */}
              {filteredEvents.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-lg">{filteredEvents[0].plate_number}</p>
                      <p className="text-gray-300 text-sm">{filteredEvents[0].make} {filteredEvents[0].model}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {new Date(filteredEvents[0].timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-gray-300 text-xs">
                        {filteredEvents[0].confidence ? `${(filteredEvents[0].confidence * 100).toFixed(1)}%` : 'N/A'} confidence
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Show Camera Feed Button (when hidden) */}
      {!showCameraFeed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCameraFeed(true)}
          className="w-full p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Video className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Show Camera Feed</span>
        </motion.button>
      )}

      {/* Premium Live Feed Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
          
          {/* Premium Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Image
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    License Plate
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Vehicle Details
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Timestamp
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Weather
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
                  {filteredEvents.map((event, index) => (
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
                          className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 overflow-hidden shadow-lg group-hover/row:shadow-xl transition-shadow"
                        >
                          {event.image_url ? (
                            <img
                              src={event.image_url}
                              alt={event.plate_number}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-600/10">
                              <Eye className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity" />
                        </motion.div>
                      </td>
                      
                      {/* License Plate */}
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
                          {event.isGuest && event.guestInfo && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {event.guestInfo.visitorName || 'Guest Visitor'}
                              {event.guestInfo.purpose && ` • ${event.guestInfo.purpose}`}
                            </p>
                          )}
                          {event.isPersonalVehicle && event.vehicleInfo?.owner && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Owner: {event.vehicleInfo.owner.username}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                              {(event.confidence * 100).toFixed(1)}% confidence
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Vehicle Details */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {event.make} {event.model}
                          </p>
                          {event.vehicleInfo?.color && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {event.vehicleInfo.color} {event.vehicleInfo.year && `• ${event.vehicleInfo.year}`}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Vehicle detected
                          </p>
                        </div>
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
          {events.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="p-16 text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No vehicle events detected yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                The live feed will update automatically when vehicles are detected
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      <VehicleDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
