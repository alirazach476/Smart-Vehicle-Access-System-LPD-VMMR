import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Shield, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50"
            >
              <Shield className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Smart Gate
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {isActive('/') && (
                <motion.div
                  layoutId="navbar-indicator-home"
                  className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">Home</span>
            </Link>
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className={`relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/login')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {isActive('/login') && (
                    <motion.div
                      layoutId="navbar-indicator-login"
                      className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="relative px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative">Sign Up</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {isActive('/dashboard') && (
                    <motion.div
                      layoutId="navbar-indicator-dashboard"
                      className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">Dashboard</span>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="relative px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300 group flex items-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <LogOut className="relative w-4 h-4" />
                  <span className="relative">Logout</span>
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

