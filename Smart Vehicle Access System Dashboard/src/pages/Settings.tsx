import { motion } from 'framer-motion';
import { Save, Bell, Camera, Shield, Database, Settings as SettingsIcon, Sliders } from 'lucide-react';
import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 5,
    notificationsEnabled: true,
    confidenceThreshold: 0.85,
    cameraQuality: 'high',
    storageRetention: 30,
  });

  const handleSave = () => {
    showNotification('system', 'Settings saved successfully');
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
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            Configure system preferences and parameters
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Notifications Card */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50">
                <Bell className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alert preferences</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Enable Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive alerts for unauthorized vehicles
                  </p>
                </div>
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={e =>
                      setSettings({ ...settings, notificationsEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className={`w-14 h-7 rounded-full transition-all duration-300 ${
                    settings.notificationsEnabled 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <motion.div
                      className="w-6 h-6 bg-white rounded-full shadow-lg mt-0.5 ml-0.5"
                      animate={{ x: settings.notificationsEnabled ? 28 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                </motion.label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Auto-refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={settings.refreshInterval}
                  onChange={e =>
                    setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })
                  }
                  className="w-full px-5 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Current: {settings.refreshInterval} seconds
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Detection Settings Card */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-60" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50">
                <Shield className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Detection Settings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI recognition parameters</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Confidence Threshold
                  </label>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    {(settings.confidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={settings.confidenceThreshold}
                    onChange={e =>
                      setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })
                    }
                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gradient"
                    style={{
                      background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${(settings.confidenceThreshold - 0.5) / 0.5 * 100}%, rgb(229 231 235) ${(settings.confidenceThreshold - 0.5) / 0.5 * 100}%, rgb(229 231 235) 100%)`
                    }}
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Minimum confidence level for plate recognition
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Camera Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-60" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
                <Camera className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Camera Settings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Image capture quality</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Image Quality
                </label>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group/select"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-2xl blur-xl opacity-0 group-hover/select:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover/select:opacity-100 transition-opacity duration-300" />
                  <select
                    value={settings.cameraQuality}
                    onChange={e => setSettings({ ...settings, cameraQuality: e.target.value })}
                    className="relative w-full px-6 py-3.5 pr-14 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-gray-900 dark:text-gray-100 font-bold text-sm shadow-2xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer z-10"
                  >
                    <option value="low" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Low (720p)</option>
                    <option value="medium" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Medium (1080p)</option>
                    <option value="high" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">High (4K)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Sliders className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-0 h-0 border-l-4 border-l-purple-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                  </div>
                </motion.div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Higher quality requires more storage space
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Data Management Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-red-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 opacity-60" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/50">
                <Database className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Data Management
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Storage configuration</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Storage Retention (days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.storageRetention}
                  onChange={e =>
                    setSettings({ ...settings, storageRetention: parseInt(e.target.value) })
                  }
                  className="w-full px-5 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Number of days to keep vehicle logs
                  </p>
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50">
                    {settings.storageRetention} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Premium Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Save className="relative w-6 h-6" />
          <span className="relative">Save Settings</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
