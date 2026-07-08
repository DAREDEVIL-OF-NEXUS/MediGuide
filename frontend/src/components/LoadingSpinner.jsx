import { motion } from 'framer-motion';

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export default function LoadingSpinner({ size = 'md', text = '', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={`${sizes[size]} rounded-full border-2 border-dark-700`}
          style={{ borderTopColor: '#10b981', borderRightColor: '#14b8a6' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner glow */}
        <div className={`absolute inset-0 ${sizes[size]} rounded-full bg-primary-500/10 blur-md`} />
      </div>
      {text && (
        <motion.p
          className="text-sm text-dark-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
