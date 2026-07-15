import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 font-sans">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold text-white tracking-tight">MediGuide-AI</span>
        </div>
        <div className="flex gap-6 items-center font-medium">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/about" className="text-primary-400">About</Link>
          <Link to="/architecture" className="hover:text-white transition-colors">Architecture</Link>
          <Link to="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors">Go to Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-8">About MediGuide-AI</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Vision & Mission</h2>
            <p className="text-lg text-dark-400 leading-relaxed">
              Our mission is to help patients understand their prescriptions, follow medication schedules, and reduce missed doses. 
              We believe AI should assist humans—not replace them. The system always prefers transparency, explainability, and human verification over blind automation.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">The Problem</h2>
            <p className="text-lg text-dark-400 leading-relaxed">
              Medical non-adherence is a massive healthcare challenge. Patients struggle to read handwritten prescriptions, manage complex dosing schedules, and understand potential drug interactions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">The Team</h2>
            <p className="text-lg text-dark-400 leading-relaxed">
              Created by Lakshay Bharti, B.Tech Computer Science at Delhi Technological University (DTU). Built as a production-quality AI healthcare application prioritizing reliability and clean architecture.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
              <p className="text-dark-300">Have questions or feedback? Reach out to us.</p>
              <a href="mailto:contact@mediguide.ai" className="text-primary-400 hover:underline mt-2 inline-block">contact@mediguide.ai</a>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
