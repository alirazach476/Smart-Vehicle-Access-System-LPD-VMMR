import { motion, AnimatePresence } from 'framer-motion';
import { X, Gauge, CloudRain, CheckCircle2, XCircle, Clock, Thermometer, Shield, Car, TrendingUp, Users, User } from 'lucide-react';
import { VehicleEvent } from '../utils/api';

interface VehicleDetailModalProps {
  event: VehicleEvent | null;
  onClose: () => void;
}

export default function VehicleDetailModal({ event, onClose }: VehicleDetailModalProps) {
  if (!event) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="group relative bg-white dark:bg-gray-900 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border-2 border-white/30 dark:border-gray-700/50 flex flex-col lg:flex-row"
        >
          {/* Premium gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60 z-10" />
          
          {/* Premium Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 p-3 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-all duration-300 backdrop-blur-md border-2 border-white/20 shadow-lg z-20"
          >
            <X className="w-5 h-5" />
          </motion.button>
          
          {/* Premium Image Section - Left Side */}
          <div className="relative flex-shrink-0 w-full lg:w-2/5 p-6 flex items-center justify-center border-b-2 lg:border-b-0 lg:border-r-2 border-gray-200/50 dark:border-gray-700/50">
            <div className="relative w-full h-full max-h-[85vh] bg-gradient-to-br from-gray-100 dark:from-gray-800 to-gray-200 dark:to-gray-900 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-xl">
              {event.image_url ? (
                <>
                  <img
                    src={event.image_url}
                    alt={event.plate_number}
                    className="w-full h-full object-contain p-4 bg-white dark:bg-gray-800 rounded-xl"
                  />
                </>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full" />
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <Car className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-2">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Content Section - Right Side */}
          <div className="p-6 lg:p-8 space-y-4 lg:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Header Section */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        {event.plate_number}
                      </h2>
                      {event.isGuest && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                          <Users className="w-4 h-4" />
                          Guest Visitor
                        </span>
                      )}
                      {event.isPersonalVehicle && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          <Car className="w-4 h-4" />
                          Personal Vehicle
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {event.make} {event.model}
                    </p>
                    {event.isGuest && event.guestInfo && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{event.guestInfo.visitorName || 'Guest Visitor'}</span>
                        {event.guestInfo.purpose && (
                          <>
                            <span>•</span>
                            <span>{event.guestInfo.purpose}</span>
                          </>
                        )}
                        {event.guestInfo.owner && (
                          <>
                            <span>•</span>
                            <span>Registered by: {event.guestInfo.owner.username}</span>
                          </>
                        )}
                      </div>
                    )}
                    {event.isPersonalVehicle && event.vehicleInfo && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {event.vehicleInfo.owner && (
                          <p>Owner: <span className="font-semibold">{event.vehicleInfo.owner.username}</span></p>
                        )}
                        {event.vehicleInfo.color && (
                          <p>Color: {event.vehicleInfo.color} {event.vehicleInfo.year && `• Year: ${event.vehicleInfo.year}`}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2"
              >
                {event.status === 'allowed' ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50">
                    <CheckCircle2 className="w-4 h-4" />
                    Allowed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/50">
                    <XCircle className="w-4 h-4" />
                    Denied
                  </span>
                )}
              </motion.div>
            </div>

            {/* Premium Info Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Confidence Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group/card relative p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50">
                    <Gauge className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Confidence</span>
                </div>
                <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {(event.confidence * 100).toFixed(1)}%
                </p>
                <div className="mt-2 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${event.confidence * 100}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  />
                </div>
              </motion.div>

              {/* Weather Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group/card relative p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
                    <CloudRain className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Weather</span>
                </div>
                <p className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {event.weather_condition}
                </p>
                {event.temperature && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{event.temperature}°C</span>
                  </div>
                )}
              </motion.div>

              {/* Timestamp Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group/card relative p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg shadow-gray-500/50">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Timestamp</span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                  {new Date(event.timestamp).toLocaleDateString()}
                </p>
              </motion.div>

              {/* Gate Action Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="group/card relative p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Gate Action</span>
                </div>
                <p className="text-lg font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent capitalize">
                  {event.gate_action || 'N/A'}
                </p>
              </motion.div>
            </div>

            {/* Additional Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-4 mt-4 border-t-2 border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Event Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Vehicle Make</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{event.make || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Vehicle Model</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{event.model || 'N/A'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
