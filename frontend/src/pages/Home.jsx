import { Link } from 'react-router-dom';
import { Shield, Clock, Brain, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold text-white tracking-tight">MediGuide-AI</span>
        </div>
        <div className="flex gap-6 items-center font-medium">
          <Link to="/" className="text-primary-400">Home</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/architecture" className="hover:text-white transition-colors">Architecture</Link>
          <Link to="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors">Go to Dashboard</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Intelligent Medication <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">Management & Intelligence</span>
          </h1>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your prescriptions, let our Hybrid AI extract the schedule, and stay on track with smart reminders and personalized medical assistance.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/prescriptions/upload" className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-500 transition-transform hover:scale-105 shadow-lg shadow-primary-500/25">
              Upload Prescription <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/about" className="px-6 py-3 bg-dark-800 text-white rounded-xl font-semibold hover:bg-dark-700 transition-colors border border-dark-700">
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 bg-dark-900 border border-dark-800 rounded-2xl hover:border-primary-500/50 transition-colors">
            <Brain className="w-10 h-10 text-teal-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Hybrid AI Extraction</h3>
            <p className="text-dark-400">YOLOv8 layout detection combined with Gemini 2.5 Flash for unparalleled precision in prescription reading.</p>
          </div>
          <div className="p-6 bg-dark-900 border border-dark-800 rounded-2xl hover:border-primary-500/50 transition-colors">
            <Shield className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Human-in-the-Loop</h3>
            <p className="text-dark-400">AI suggests, but humans verify. You maintain complete control over your final medication schedules.</p>
          </div>
          <div className="p-6 bg-dark-900 border border-dark-800 rounded-2xl hover:border-primary-500/50 transition-colors">
            <Clock className="w-10 h-10 text-rose-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Smart Reminders</h3>
            <p className="text-dark-400">Automatic timeline generation and timely alerts so you never miss a dose again.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
