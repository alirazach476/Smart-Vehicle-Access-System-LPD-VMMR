import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import LiveFeed from '../pages/LiveFeed';
import VehicleHistory from '../pages/VehicleHistory';
import ManualOverride from '../pages/ManualOverride';
import AddTemporaryVisitor from '../pages/AddTemporaryVisitor';
import Weather from '../pages/Weather';
import Settings from '../pages/Settings';
import AdminAccessPrivileges from '../pages/AdminAccessPrivileges';
import { isAdmin } from '../utils/auth';
import { useNotification } from '../context/NotificationContext';

// Admin-only pages
const ADMIN_ONLY_PAGES = ['history', 'manual', 'admin-access', 'settings'];

export default function DashboardApp() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { showNotification } = useNotification();
  const admin = isAdmin();

  // Read page from URL hash on mount and when hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'live', 'history', 'manual', 'add-visitor', 'weather', 'settings', 'admin-access'].includes(hash)) {
      setCurrentPage(hash);
      // Clear hash after reading
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location.hash, location.pathname]);

  // Redirect non-admin users away from admin-only pages
  useEffect(() => {
    if (!admin && ADMIN_ONLY_PAGES.includes(currentPage)) {
      showNotification('system', 'Access denied. Admin privileges required.');
      setCurrentPage('dashboard');
    }
  }, [currentPage, admin, showNotification]);

  const handlePageChange = (page: string) => {
    // Check if page requires admin access
    if (ADMIN_ONLY_PAGES.includes(page) && !admin) {
      showNotification('system', 'Access denied. Admin privileges required.');
      return;
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    // Double-check admin access before rendering admin-only pages
    if (ADMIN_ONLY_PAGES.includes(currentPage) && !admin) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This page requires admin privileges.
            </p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'live':
        return <LiveFeed />;
      case 'history':
        return admin ? <VehicleHistory /> : null;
      case 'manual':
        return admin ? <ManualOverride /> : null;
      case 'admin-access':
        return admin ? <AdminAccessPrivileges /> : null;
      case 'add-visitor':
        return !admin ? <AddTemporaryVisitor /> : null;
      case 'weather':
        return <Weather />;
      case 'settings':
        return admin ? <Settings /> : null;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="lg:pl-80 p-4 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

