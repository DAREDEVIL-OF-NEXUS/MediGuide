import { Link } from 'react-router-dom';
import { 
  Activity, Brain, Shield, Clock, Database, Mail, Box, Cpu, Zap, 
  CheckCircle, Eye, Scan, MessageSquare, BookOpen, Bell, Server,
  Layers, GitBranch, Rocket, Wrench, Users, ExternalLink,
  Sparkles, Target, Heart, ArrowRight, Github, Linkedin, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

const features = [
  {
    icon: Scan,
    title: 'Prescription OCR via Gemini 2.5 Flash',
    description: 'Multimodal AI extracts structured medication data from handwritten and printed prescriptions with remarkable accuracy.',
    color: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    borderColor: 'hover:border-violet-500/30',
  },
  {
    icon: Eye,
    title: 'Custom YOLOv8 Layout Detection',
    description: 'Trained on a custom Roboflow dataset to isolate doctor headers, medicine blocks, and signatures before OCR processing.',
    color: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    borderColor: 'hover:border-cyan-500/30',
  },
  {
    icon: Shield,
    title: 'Human-in-the-Loop Verification',
    description: 'AI suggests, humans verify. Every extraction passes through a mandatory review step before schedule finalization.',
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    icon: Sparkles,
    title: 'Explainable AI with Bounding Boxes',
    description: 'Visual bounding boxes and confidence scores show exactly what the AI detected and how certain it is about each extraction.',
    color: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'hover:border-amber-500/30',
  },
  {
    icon: MessageSquare,
    title: 'RAG Medical Assistant',
    description: 'ChromaDB-powered retrieval augmented generation combined with OpenFDA data for contextual medical Q&A.',
    color: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    borderColor: 'hover:border-rose-500/30',
  },
  {
    icon: Database,
    title: 'Hybrid Medical Knowledge Base',
    description: 'Cascading architecture: OpenFDA verified data first, Gemini AI fallback for comprehensive drug information coverage.',
    color: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    borderColor: 'hover:border-indigo-500/30',
  },
  {
    icon: Clock,
    title: 'Smart Medication Scheduling',
    description: 'APScheduler-powered intelligent scheduling generates personalized medication timelines from extracted prescriptions.',
    color: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
    borderColor: 'hover:border-teal-500/30',
  },
  {
    icon: Mail,
    title: 'Email Reminders via Gmail SMTP',
    description: 'Automated email notifications ensure patients never miss a dose, delivered directly to their inbox on schedule.',
    color: 'from-sky-500 to-cyan-600',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-400',
    borderColor: 'hover:border-sky-500/30',
  },
  {
    icon: Bell,
    title: 'Local Desktop Alarm Notifications',
    description: 'Native desktop alerts provide immediate, unmissable reminders right on your workstation when it\'s time for medication.',
    color: 'from-fuchsia-500 to-purple-600',
    iconBg: 'bg-fuchsia-500/10',
    iconColor: 'text-fuchsia-400',
    borderColor: 'hover:border-fuchsia-500/30',
  },
  {
    icon: BookOpen,
    title: 'Medicine Library',
    description: 'Browse verified drug information with usage guidelines, side effects, and interactions — all from trusted sources.',
    color: 'from-lime-500 to-green-600',
    iconBg: 'bg-lime-500/10',
    iconColor: 'text-lime-400',
    borderColor: 'hover:border-lime-500/30',
  },
  {
    icon: Box,
    title: 'Full Docker Production Deployment',
    description: 'Complete containerized deployment with Docker Compose — frontend, backend, database, and all services production-ready.',
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    borderColor: 'hover:border-blue-500/30',
  },
];

const phases = [
  {
    number: '01',
    title: 'Foundation',
    description: 'FastAPI backend, React frontend, PostgreSQL database, JWT authentication, and core project architecture.',
    tags: ['FastAPI', 'React', 'PostgreSQL', 'Auth'],
    color: 'from-primary-500 to-teal-500',
    dotColor: 'bg-primary-500',
  },
  {
    number: '02',
    title: 'AI Pipeline',
    description: 'Gemini 2.5 Flash OCR integration, YOLOv8 layout detection, and rule-based extraction engine.',
    tags: ['Gemini OCR', 'YOLOv8', 'Rule Engine'],
    color: 'from-violet-500 to-purple-500',
    dotColor: 'bg-violet-500',
  },
  {
    number: '03',
    title: 'Dashboard & Schedule Management',
    description: 'Interactive dashboard, medication timeline visualization, and schedule CRUD operations.',
    tags: ['Dashboard', 'Schedules', 'Timeline'],
    color: 'from-cyan-500 to-blue-500',
    dotColor: 'bg-cyan-500',
  },
  {
    number: '04',
    title: 'Medical Assistant & Medicine Library',
    description: 'RAG-powered AI assistant for medical Q&A and a comprehensive medicine information library.',
    tags: ['RAG', 'ChromaDB', 'Medicine Library'],
    color: 'from-rose-500 to-pink-500',
    dotColor: 'bg-rose-500',
  },
  {
    number: '05',
    title: 'Hybrid Medical Knowledge Base',
    description: 'OpenFDA API integration with Gemini fallback for comprehensive, verified drug information.',
    tags: ['OpenFDA', 'Gemini Fallback', 'RAG'],
    color: 'from-amber-500 to-orange-500',
    dotColor: 'bg-amber-500',
  },
  {
    number: '06',
    title: 'Database Migration & Schema Updates',
    description: 'Schema evolution for new features, data migration strategies, and database optimization.',
    tags: ['Migrations', 'Schema', 'Optimization'],
    color: 'from-indigo-500 to-blue-500',
    dotColor: 'bg-indigo-500',
  },
  {
    number: '07',
    title: 'Docker Deployment & Productionization',
    description: 'Complete Docker Compose setup, environment configuration, and production-ready deployment pipeline.',
    tags: ['Docker', 'Compose', 'Production'],
    color: 'from-teal-500 to-emerald-500',
    dotColor: 'bg-teal-500',
  },
  {
    number: '08',
    title: 'Explainable AI, Emails & Final Polish',
    description: 'Bounding box visualization, SMTP email reminders, custom YOLO training, and comprehensive final polish.',
    tags: ['XAI', 'SMTP', 'YOLO Training', 'Polish'],
    color: 'from-fuchsia-500 to-pink-500',
    dotColor: 'bg-fuchsia-500',
  },
];

const techStack = [
  { name: 'React', subtitle: 'Frontend', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { name: 'FastAPI', subtitle: 'Backend', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { name: 'PostgreSQL', subtitle: 'Database', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { name: 'ChromaDB', subtitle: 'Vector Store', icon: Layers, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { name: 'Gemini 2.5', subtitle: 'AI / Vision', icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { name: 'YOLOv8', subtitle: 'Object Detection', icon: Eye, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { name: 'Docker', subtitle: 'Deployment', icon: Box, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
];

function SectionHeading({ badge, title, subtitle }) {
  return (
    <motion.div 
      className="text-center mb-16"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-5">
        {badge}
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
      {subtitle && (
        <p className="text-lg text-dark-400 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 font-sans">
      {/* Navigation — preserved exactly */}
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

      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
            >
              <Heart className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">AI-Powered Healthcare</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              About{' '}
              <span className="gradient-text">MediGuide-AI</span>
            </h1>
            <p className="text-xl text-dark-400 max-w-3xl mx-auto leading-relaxed">
              A production-grade AI healthcare platform that transforms handwritten prescriptions into actionable medication schedules — powered by Hybrid AI, verified by humans.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───────────── VISION & MISSION ───────────── */}
      <section className="relative py-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading 
            badge="Our Purpose" 
            title="Vision & Mission"
            subtitle="Bridging the gap between AI capability and human trust in healthcare."
          />

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="glass-card p-8 group hover:border-primary-500/30 transition-all duration-500"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-primary-500/10">
                  <Target className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-dark-300 leading-relaxed text-[15px]">
                A world where no patient misreads a prescription, misses a dose, or takes the wrong medication due to illegible handwriting or information overload. We envision AI as a transparent ally — augmenting human judgment, never replacing it.
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-8 group hover:border-teal-500/30 transition-all duration-500"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-teal-500/10">
                  <Rocket className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-dark-300 leading-relaxed text-[15px]">
                To build production-quality AI systems that prioritize explainability, transparency, and human verification over blind automation. Every AI decision is visible, every confidence score is shown, and every extraction waits for human approval before becoming actionable.
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-8 group hover:border-rose-500/30 transition-all duration-500"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-rose-500/10">
                  <Heart className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white">The Problem</h3>
              </div>
              <p className="text-dark-300 leading-relaxed text-[15px]">
                Medical non-adherence is a $300B+ healthcare crisis. Patients struggle with illegible handwriting, complex multi-drug schedules, and unclear dosing instructions. Traditional solutions either lack intelligence or lack trust.
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-8 group hover:border-amber-500/30 transition-all duration-500"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Our Approach</h3>
              </div>
              <p className="text-dark-300 leading-relaxed text-[15px]">
                Hybrid AI architecture combining YOLOv8 precision with Gemini intelligence. Cascading knowledge bases from verified FDA data to AI fallbacks. And always — always — a human in the loop before any action is taken.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── FEATURES ───────────── */}
      <section className="relative py-20">
        {/* Subtle background accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-72 h-72 bg-primary-500/3 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-64 h-64 bg-violet-500/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeading 
            badge="Capabilities"
            title="Implemented Features"
            subtitle="Every feature built with production quality, tested rigorously, and designed for real-world healthcare use."
          />

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className={`glass-card p-6 group transition-all duration-500 ${feature.borderColor} hover:bg-dark-800/70 hover:shadow-lg`}
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.iconBg} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2 leading-snug">{feature.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── DEVELOPMENT PHASES ───────────── */}
      <section className="relative py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <SectionHeading 
            badge="Journey"
            title="Development Phases"
            subtitle="Eight carefully planned phases from foundation to production — each building on the last."
          />

          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-8 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500/50 via-violet-500/50 to-fuchsia-500/50" />

            <div className="space-y-8">
              {phases.map((phase, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    className={`relative flex items-start gap-6 md:gap-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                      <div className={`w-4 h-4 rounded-full ${phase.dotColor} ring-4 ring-dark-950 shadow-lg`} />
                    </div>

                    {/* Content card */}
                    <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-0 md:mr-auto' : 'md:pl-0 md:ml-auto'}`}>
                      <div className="glass-card p-6 hover:border-dark-600 transition-all duration-300 group">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${phase.color} bg-clip-text text-transparent`}>
                            Phase {phase.number}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{phase.title}</h3>
                        <p className="text-sm text-dark-400 leading-relaxed mb-4">{phase.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {phase.tags.map((tag, j) => (
                            <span
                              key={j}
                              className="px-2.5 py-1 text-xs font-medium rounded-md bg-dark-700/60 text-dark-300 border border-dark-600/40"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── TECH STACK ───────────── */}
      <section className="relative py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <SectionHeading 
            badge="Technology"
            title="Tech Stack"
            subtitle="Modern, battle-tested technologies chosen for reliability, performance, and developer experience."
          />

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`glass-card p-5 flex flex-col items-center text-center gap-3 group cursor-default transition-all duration-300 hover:shadow-lg hover:bg-dark-800/70`}
              >
                <div className={`p-3 rounded-xl ${tech.bg} border ${tech.border} transition-transform duration-300 group-hover:scale-110`}>
                  <tech.icon className={`w-6 h-6 ${tech.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{tech.name}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{tech.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── TEAM & CONTACT ───────────── */}
      <section className="relative py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <SectionHeading 
            badge="People"
            title="Team & Contact"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Team Card */}
            <motion.div
              className="glass-card p-8 hover:border-primary-500/30 transition-all duration-500"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">
                  LB
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Lakshay Bharti</h3>
                  <p className="text-sm text-dark-400">Creator & Developer</p>
                </div>
              </div>
              <p className="text-dark-300 leading-relaxed text-[15px] mb-6">
                B.Tech Computer Science at Delhi Technological University (DTU). Built MediGuide-AI as a production-quality AI healthcare application, prioritizing clean architecture, reliability, and responsible AI practices.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-info">AI/ML</span>
                <span className="badge-success">Full Stack</span>
                <span className="badge-warning">Healthcare</span>
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              className="glass-card p-8 hover:border-teal-500/30 transition-all duration-500"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-teal-500/10">
                  <Mail className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Get In Touch</h3>
              </div>
              <p className="text-dark-300 leading-relaxed text-[15px] mb-6">
                Have questions, feedback, or want to collaborate? We'd love to hear from you. Reach out via email or connect on social platforms.
              </p>

              <div className="space-y-3">
                <a 
                  href="mailto:contact@mediguide.ai" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/30 border border-dark-600/30 hover:border-primary-500/30 hover:bg-dark-700/50 transition-all duration-300 group"
                >
                  <Mail className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-dark-200">contact@mediguide.ai</span>
                  <ArrowRight className="w-4 h-4 text-dark-500 ml-auto group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/30 border border-dark-600/30 hover:border-dark-500 hover:bg-dark-700/50 transition-all duration-300 group"
                >
                  <Github className="w-4 h-4 text-dark-300 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-dark-200">GitHub Repository</span>
                  <ExternalLink className="w-4 h-4 text-dark-500 ml-auto group-hover:text-dark-300 transition-colors" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="border-t border-dark-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-dark-500 text-sm">
            <Activity className="w-4 h-4 text-primary-600" />
            <span>MediGuide-AI · Built with purpose</span>
          </div>
          <p className="text-dark-600 text-xs">
            AI-assisted healthcare · Responsible AI practices
          </p>
        </div>
      </footer>
    </div>
  );
}
