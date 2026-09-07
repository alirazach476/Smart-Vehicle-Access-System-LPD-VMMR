import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: { username?: string; email: string; password: string }) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export default function AuthForm({ mode, onSubmit, error, loading }: AuthFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Reset form data when mode changes
  useEffect(() => {
    setFormData({
      username: '',
      email: '',
      password: '',
    });
    setLocalError('');
    setShowPassword(false);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (mode === 'signup' && !formData.username) {
      setLocalError('Username is required');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred');
    }
  };

  const displayError = localError || error;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {mode === 'signup' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
            placeholder="Enter your username"
            required
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: mode === 'signup' ? 0.2 : 0.1 }}
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
          placeholder="Enter your email"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: mode === 'signup' ? 0.3 : 0.2 }}
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 pr-12 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl"
        >
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{displayError}</p>
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === 'login' ? 'Logging in...' : 'Creating account...'}
            </>
          ) : (
            mode === 'login' ? 'Login' : 'Sign Up'
          )}
        </span>
      </motion.button>
    </motion.form>
  );
}

