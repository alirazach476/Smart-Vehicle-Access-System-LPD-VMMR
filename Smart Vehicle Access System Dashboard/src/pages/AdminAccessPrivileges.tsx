import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserX, Shield, Loader2 } from 'lucide-react';
import { userManagementAPI, User } from '../utils/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminAccessPrivileges() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userManagementAPI.getUsers();
      // Filter out admin users (they already have full access)
      const nonAdminUsers = response.users.filter(user => user.role !== 'admin');
      setUsers(nonAdminUsers);
    } catch (error: any) {
      console.error('Error loading users:', error);
      showNotification('system', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (userId: number, currentAccess: boolean) => {
    try {
      setUpdating(userId);
      await userManagementAPI.updateAdminAccess(userId, !currentAccess);
      showNotification('system', `Admin access ${!currentAccess ? 'granted' : 'revoked'} successfully`);
      await loadUsers(); // Reload to get updated data
    } catch (error: any) {
      console.error('Error updating admin access:', error);
      showNotification('system', error.response?.data?.error || 'Failed to update admin access');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border-2 border-white/20 dark:border-gray-700/30 shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60 rounded-t-3xl" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Admin Access Privileges
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Grant or revoke admin access privileges to users
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Granting admin access privileges allows users to see real-time updates in Live Feed and Dashboard, but does not grant full admin permissions. Users with admin access can view updated content but cannot access admin-only pages like Vehicle Logs, Manual Override, or Settings.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No regular users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      user.hasAdminAccess 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {user.hasAdminAccess ? (
                        <UserCheck className="w-6 h-6 text-white" />
                      ) : (
                        <UserX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.username}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.hasAdminAccess
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {user.hasAdminAccess ? 'Has Admin Access' : 'No Admin Access'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAccess(user.id, user.hasAdminAccess)}
                    disabled={updating === user.id}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      user.hasAdminAccess
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
                  >
                    {updating === user.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : user.hasAdminAccess ? (
                      'Revoke Access'
                    ) : (
                      'Grant Access'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

