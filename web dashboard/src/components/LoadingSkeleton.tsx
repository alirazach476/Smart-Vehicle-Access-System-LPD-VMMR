import { motion } from 'framer-motion';

export function CardSkeleton() {
  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="space-y-3"
      >
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </motion.div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className="h-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50"
        />
      ))}
    </div>
  );
}
