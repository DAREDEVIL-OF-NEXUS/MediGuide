import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-dark-800/50 border border-dark-700/50 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-dark-500" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-xl font-semibold text-dark-200 mb-2">{title}</h3>
      <p className="text-dark-400 max-w-md mb-8 leading-relaxed">{description}</p>
      {action && (
        <button onClick={action} className="btn-primary">
          {actionLabel || 'Get Started'}
        </button>
      )}
    </motion.div>
  );
}
