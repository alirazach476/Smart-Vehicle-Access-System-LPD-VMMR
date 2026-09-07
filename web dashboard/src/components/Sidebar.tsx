import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Radio,
  History,
  CloudRain,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Shield,
  Crown,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useGate } from '../context/GateContext';
import { getUserRole, isAdmin } from '../utils/auth';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

// Base menu items - available to all users
const baseMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { id: 'live', label: 'Live Feed', icon: Radio, adminOnly: false },
  { id: 'weather', label: 'Weather', icon: CloudRain, adminOnly: false },
];

// User-only menu items (for regular users)
const userMenuItems = [
  { id: 'add-visitor', label: 'Add Temporary Visitor', icon: UserPlus, adminOnly: false },
];

// Admin-only menu items
const adminMenuItems = [
  { id: 'history', label: 'Vehicle Logs', icon: History, adminOnly: true },
  { id: 'manual', label: 'Manual Override', icon: Shield, adminOnly: true },
  { id: 'admin-access', label: 'Admin Access Privileges', icon: UserCheck, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { gateStatus } = useGate();
  const userRole = getUserRole();
  const admin = isAdmin();

  // Filter menu items based on role
  const menuItems = [
    ...baseMenuItems,
    ...(admin ? adminMenuItems : userMenuItems),
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-screen w-64 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800 z-40 flex flex-col"
      >
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <motion.div 
              key={gateStatus}
              className={`w-20 h-20 rounded-lg flex-shrink-0 p-1 flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
                gateStatus === 'open' 
                  ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30' 
                  : 'bg-gradient-to-br from-gray-500/20 to-gray-600/20'
              }`}
              style={{ isolation: 'isolate', willChange: 'auto' }}
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
                className={`absolute inset-0 rounded-lg border-2 ${
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
                className={`w-full h-full object-contain transition-all duration-500 ${
                  gateStatus === 'open' 
                    ? 'brightness-125 saturate-125' 
                    : 'brightness-75 saturate-75'
                }`}
                style={{ 
                  imageRendering: 'crisp-edges' as const,
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  filter: gateStatus === 'open' 
                    ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.6)) hue-rotate(120deg)' 
                    : 'drop-shadow(0 0 4px rgba(107, 114, 128, 0.3)) grayscale(0.3)',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  isolation: 'isolate'
                }}
                onError={(e) => {
                  console.error('Logo image failed to load');
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const statusColor = gateStatus === 'open' 
                      ? 'from-green-500 to-emerald-600' 
                      : 'from-gray-500 to-gray-600';
                    parent.innerHTML = `<div class="w-full h-full rounded-lg bg-gradient-to-br ${statusColor} flex items-center justify-center"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>`;
                  }
                }}
              />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                  SMART
                </h1>
                {admin && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-1 rounded bg-gradient-to-br from-yellow-400 to-orange-500"
                    title="Admin"
                  >
                    <Crown className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">VEHICLE ACCESS</p>
              {userRole && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize mt-0.5">
                  {userRole}
                </p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onPageChange(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </motion.button>
        </div>
      </motion.aside>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
        />
      )}
    </>
  );
}
