import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Plus, Shield, Zap, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const floatingIcons = [
  { Icon: Shield, x: '10%', y: '20%', delay: 0, size: 'w-8 h-8' },
  { Icon: Heart, x: '80%', y: '15%', delay: 0.5, size: 'w-6 h-6' },
  { Icon: Zap, x: '20%', y: '75%', delay: 1, size: 'w-7 h-7' },
  { Icon: Plus, x: '75%', y: '70%', delay: 1.5, size: 'w-5 h-5' },
  { Icon: Shield, x: '50%', y: '45%', delay: 0.8, size: 'w-6 h-6' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.detail || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

        {/* Floating icons */}
        {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: x, top: y }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          >
            <div className="p-3 rounded-2xl bg-dark-800/30 backdrop-blur-sm border border-dark-700/30">
              <Icon className={`${size} text-primary-400/60`} />
            </div>
          </motion.div>
        ))}

        {/* Center branding */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/20">
              <Plus className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Smart Medication<br />
              <span className="gradient-text">Adherence</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-md leading-relaxed">
              Upload prescriptions, track your medications, and never miss a dose with AI-powered insights.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex gap-8"
          >
            {[
              { value: 'AI', label: 'Powered' },
              { value: '24/7', label: 'Tracking' },
              { value: '100%', label: 'Secure' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-dark-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-dark-950 relative">
        {/* Mobile gradient background */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">MediGuide</h1>
              <p className="text-xs text-dark-500">AI Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-dark-400">Sign in to your MediGuide account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-dark-500 hover:text-dark-300 transition-colors font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-dark-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
