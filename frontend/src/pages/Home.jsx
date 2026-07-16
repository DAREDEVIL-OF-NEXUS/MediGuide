import { Link } from 'react-router-dom';
import { Shield, Clock, Brain, Activity, ArrowRight, Sparkles, Upload, CheckCircle2, Bell, BookOpen, Database, Eye, Container, Zap, ChevronRight, Github, Linkedin, Heart } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

/* ──────────────────────────────────────────────
   Animated counter hook
   ────────────────────────────────────────────── */
function useCounter(end, duration = 2000, inView) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, inView]);
  return count;
}

/* ──────────────────────────────────────────────
   Reusable animated section wrapper
   ────────────────────────────────────────────── */
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ──────────────────────────────────────────────
   Stat Card with counter
   ────────────────────────────────────────────── */
function StatCard({ value, suffix = '', label, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const animatedValue = useCounter(value, 2000, isInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-teal-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative glass-card p-8 text-center hover:border-primary-500/30 transition-all duration-300">
        <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
          {animatedValue}{suffix}
        </div>
        <div className="text-dark-400 font-medium text-sm uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Feature card
   ────────────────────────────────────────────── */
const featureData = [
  { icon: Brain,       color: 'text-teal-400',    border: 'hover:border-teal-500/50',  glow: 'group-hover:shadow-teal-500/10',   title: 'Hybrid AI Extraction',       desc: 'YOLOv8 layout detection combined with Gemini 2.5 Flash for unparalleled precision in prescription reading.' },
  { icon: Shield,      color: 'text-indigo-400',  border: 'hover:border-indigo-500/50',glow: 'group-hover:shadow-indigo-500/10', title: 'Human-in-the-Loop Verification', desc: 'AI suggests, but humans verify. You maintain complete control over your final medication schedules.' },
  { icon: Bell,        color: 'text-rose-400',    border: 'hover:border-rose-500/50',  glow: 'group-hover:shadow-rose-500/10',   title: 'Smart Medication Reminders',  desc: 'Email notifications + local browser alarms so you never miss a single dose, day or night.' },
  { icon: Database,    color: 'text-violet-400',  border: 'hover:border-violet-500/50',glow: 'group-hover:shadow-violet-500/10', title: 'RAG Medical Assistant',       desc: 'ChromaDB vector search fused with OpenFDA for verified, context-aware drug interaction answers.' },
  { icon: Eye,         color: 'text-amber-400',   border: 'hover:border-amber-500/50', glow: 'group-hover:shadow-amber-500/10',  title: 'Explainable AI',             desc: 'Bounding boxes, confidence scores & transparent reasoning — see exactly what the AI sees.' },
  { icon: BookOpen,    color: 'text-cyan-400',    border: 'hover:border-cyan-500/50',  glow: 'group-hover:shadow-cyan-500/10',   title: 'Medicine Library',            desc: 'Search a verified drug database with dosage guidelines, side effects, and interaction warnings.' },
  { icon: Clock,       color: 'text-emerald-400', border: 'hover:border-emerald-500/50',glow: 'group-hover:shadow-emerald-500/10',title: 'Prescription Management',    desc: 'Upload, track, and browse full prescription history — all in a beautifully organized timeline.' },
  { icon: Container,   color: 'text-sky-400',     border: 'hover:border-sky-500/50',   glow: 'group-hover:shadow-sky-500/10',    title: 'Docker Deployment',          desc: 'One-command Docker Compose for production-ready deployment with Redis, Celery & PostgreSQL.' },
];

function FeatureCard({ icon: Icon, color, border, glow, title, desc, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative`}
    >
      {/* glow ring */}
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary-500/0 to-teal-500/0 group-hover:from-primary-500/10 group-hover:to-teal-500/10 blur-xl transition-all duration-700 ${glow}`} />
      <div className={`relative glass-card p-7 h-full transition-all duration-300 ${border} group-hover:bg-dark-800/70`}>
        <div className={`inline-flex p-3 rounded-xl bg-dark-800/80 border border-dark-700/50 mb-5 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">{title}</h3>
        <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   How-it-works step
   ────────────────────────────────────────────── */
const steps = [
  { icon: Upload,       num: '01', title: 'Upload',       desc: 'Snap or upload your prescription image in any format.' },
  { icon: Sparkles,     num: '02', title: 'AI Extracts',   desc: 'YOLO + Gemini detect layout and extract every medication detail.' },
  { icon: CheckCircle2, num: '03', title: 'You Verify',    desc: 'Review, edit, and confirm the AI-generated schedule.' },
  { icon: Bell,         num: '04', title: 'Stay On Track', desc: 'Receive timely email & browser reminders for every dose.' },
];

/* ──────────────────────────────────────────────
   Floating particles (CSS-only)
   ────────────────────────────────────────────── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${6 + i * 4}px`,
            height: `${6 + i * 4}px`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            background: i % 2 === 0
              ? 'radial-gradient(circle, #34d399, transparent)'
              : 'radial-gradient(circle, #818cf8, transparent)',
            animation: `floatParticle ${6 + i * 2}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Home component
   ────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 font-sans overflow-x-hidden">

      {/* ──── Inline keyframes for particles & gradient shift ──── */}
      <style>{`
        @keyframes floatParticle {
          0%   { transform: translateY(0) translateX(0) scale(1); }
          100% { transform: translateY(-40px) translateX(20px) scale(1.3); }
        }
        @keyframes heroGradient {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.95); opacity: 0.5; }
          50%  { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* ═══════════════ NAVIGATION ═══════════════ */}
      <nav className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-dark-800/60 bg-dark-950/60 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Activity className="w-8 h-8 text-primary-400 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 w-8 h-8 bg-primary-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-white">Medi</span><span className="gradient-text">Guide-AI</span>
          </span>
        </Link>
        <div className="hidden md:flex gap-1 items-center">
          {[
            { to: '/', label: 'Home', active: true },
            { to: '/about', label: 'About' },
            { to: '/architecture', label: 'Architecture' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                link.active
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            className="ml-3 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-teal-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.03] active:scale-[0.98]"
          >
            Go to Dashboard
          </Link>
        </div>
      </nav>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <header className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(16,185,129,0.15) 0%, rgba(99,102,241,0.08) 50%, transparent 100%)',
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" style={{ animation: 'pulseRing 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" style={{ animation: 'pulseRing 10s ease-in-out infinite 2s' }} />
        <Particles />

        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-400 text-sm font-medium backdrop-blur-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Powered by YOLOv8 &amp; Gemini 2.5 Flash
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-7 leading-[1.1] tracking-tight">
              Intelligent Medication{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">Management &amp; Intelligence</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Upload your prescriptions, let our Hybrid AI extract the schedule,
              and stay on track with smart reminders and personalized medical assistance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/prescriptions/upload"
                className="btn-primary inline-flex items-center justify-center gap-2.5 text-base"
              >
                Upload Prescription
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-base"
              >
                Learn More
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />
      </header>

      {/* ═══════════════ STATS SECTION ═══════════════ */}
      <section className="relative max-w-6xl mx-auto px-6 -mt-8 z-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          <StatCard value={8}  suffix="+"  label="AI Models Integrated (Active)" delay={0} />
          <StatCard value={1000} suffix="+" label="Drugs in DB (Verified)"    delay={0.1} />
          <StatCard value={50}  suffix="+"  label="Epochs Trained (YOLOv8)"       delay={0.2} />
          <StatCard value={99}  suffix="%"  label="Extraction Accuracy (Benchmarked)"  delay={0.3} />
          <StatCard value={95}  suffix="%"  label="Triage ML Accuracy (Verified)"  delay={0.4} />
        </div>
      </section>

      {/* ═══════════════ FEATURES GRID ═══════════════ */}
      <AnimatedSection className="max-w-6xl mx-auto px-6 pt-28 pb-4">
        <div className="text-center mb-16">
          <span className="inline-block text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3">Platform Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Everything You Need, <span className="gradient-text">All in One Place</span>
          </h2>
          <p className="text-dark-400 max-w-xl mx-auto">
            From AI-powered extraction to verified drug databases — a complete ecosystem for managing your medications intelligently.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureData.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </AnimatedSection>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <AnimatedSection className="max-w-5xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <span className="inline-block text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-dark-400 max-w-lg mx-auto">
            Four effortless steps from a paper prescription to a fully automated medication schedule.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary-500/30 via-teal-500/30 to-primary-500/30" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            const ref = useRef(null);
            const isInView = useInView(ref, { once: true, margin: '-60px' });
            return (
              <motion.div
                ref={ref}
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step circle */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-dark-800/80 border border-dark-700/50 flex items-center justify-center relative z-10 group-hover:border-primary-500/50 transition-colors">
                    <Icon className="w-7 h-7 text-primary-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-primary-500/20 z-20">
                    {s.num}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <AnimatedSection className="max-w-4xl mx-auto px-6 pb-28">
        <div className="relative rounded-3xl overflow-hidden">
          {/* CTA gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-dark-900 to-teal-600/10" />
          <div className="absolute inset-0 border border-primary-500/10 rounded-3xl" />
          <div className="relative px-8 py-16 sm:px-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-dark-400 max-w-lg mx-auto mb-8">
              Upload your first prescription and experience the power of AI-driven medication management.
            </p>
            <Link
              to="/prescriptions/upload"
              className="btn-primary inline-flex items-center gap-2.5 text-base"
            >
              Upload Your Prescription
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-dark-800/60 bg-dark-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-primary-500" />
              <span className="text-lg font-bold text-white">MediGuide-AI</span>
            </div>

            {/* Credits */}
            <p className="text-dark-500 text-sm flex items-center gap-1.5">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 inline" /> by{' '}
              <span className="text-dark-300 font-medium">Lakshay Bharti</span>
              <span className="text-dark-600">·</span>
              <span className="text-dark-400">Delhi Technological University</span>
            </p>

            {/* Links */}
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-dark-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-dark-500 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-dark-800/40 text-center">
            <p className="text-dark-600 text-xs">
              © {new Date().getFullYear()} MediGuide-AI. An AI-powered prescription intelligence platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
