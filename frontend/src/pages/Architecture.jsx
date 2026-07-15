import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Architecture() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 font-sans">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold text-white tracking-tight">MediGuide-AI</span>
        </div>
        <div className="flex gap-6 items-center font-medium">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/architecture" className="text-primary-400">Architecture</Link>
          <Link to="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors">Go to Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-8">System Architecture</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6">High-Level Flow</h2>
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-8 overflow-x-auto text-sm font-mono text-primary-300">
              <pre>{`                React Frontend
                       │
                       ▼
                 FastAPI Backend
                       │
               AI Orchestrator
                       │
      ┌──────────┬───────────┬───────────┐
      ▼          ▼           ▼           ▼
 Image      YOLO Detection  Gemini   Rule Engine
Processing                  Vision
      │          │           │
      └──────────┴───────────┘
               │
       Confidence Engine
               │
               ▼
 Human Verification Layer
               │
               ▼
     Schedule Generator
               │
               ▼
        PostgreSQL Database`}</pre>
            </div>
          </section>

          <section className="mb-12 grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Why YOLOv8?</h2>
              <p className="text-dark-400 leading-relaxed">
                YOLOv8 acts as our Layout Detector. Prescriptions are chaotic. Instead of feeding the whole image to an LLM, YOLO isolates the doctor's header, medicine blocks, and signatures. This dramatically improves LLM focus and reduces hallucination.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Why Gemini 2.5 Flash?</h2>
              <p className="text-dark-400 leading-relaxed">
                Gemini 2.5 Flash provides fast, cost-effective multimodal capabilities. It performs the actual OCR and semantic extraction on the cropped YOLO regions, translating messy handwriting into structured JSON.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Why Hybrid AI?</h2>
              <p className="text-dark-400 leading-relaxed">
                Relying purely on LLMs for vision is error-prone. Relying purely on traditional OCR misses semantic context. The Hybrid YOLO + LLM approach provides the best of both worlds.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Human Verification</h2>
              <p className="text-dark-400 leading-relaxed">
                AI suggests, Human confirms. The extraction pipeline always halts at a verification state, forcing the user to review before schedules are finalized into the Database.
              </p>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
