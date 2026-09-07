import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Brain, CloudRain, Radio, Lock, ArrowRight, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';

const features = [
  {
    icon: Brain,
    title: 'AI Number Plate Recognition',
    description: 'Advanced machine learning algorithms for accurate vehicle identification',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: CloudRain,
    title: 'Weather Awareness',
    description: 'Real-time weather monitoring for optimal gate operation',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Radio,
    title: 'Real-time Gate Monitoring',
    description: 'Live tracking and instant notifications for all gate activities',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Lock,
    title: 'Secure Access Control',
    description: 'Enterprise-grade security with encrypted data transmission',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      <Navbar />
      <HeroSlider />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-400/20 mb-8"
            >
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                AI-Powered Smart Gate System
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Smart Vehicle
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:to-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
                Access Control
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
            >
              Revolutionize your gate management with AI-powered recognition, 
              real-time monitoring, and intelligent access control.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 shadow-lg"
                >
                  Login
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for intelligent gate management
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group relative"
                >
                  {/* Glassmorphism Card */}
                  <div className="relative h-full p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl border-2 border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
                    {/* Gradient Top Border */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-60 rounded-t-3xl`} />
                    
                    {/* Icon */}
                    <div className={`relative mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-2xl rounded-3xl transition-opacity duration-500 -z-10`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl border-2 border-blue-500/20 dark:border-blue-400/20 backdrop-blur-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Ready to Get Started?
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of organizations using Smart Gate for secure access control
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300"
                >
                  Create Account
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

