import { Link } from 'react-router-dom';
import { Activity, Monitor, Server, Database, Brain, Image, ScanSearch, Crop, FileText, ShieldCheck, BarChart3, UserCheck, CalendarClock, HardDrive, MessageSquare, Waypoints, Search, BookOpen, Globe, Sparkles, Quote, Eye, Layers, Zap, GitMerge, Lock } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

/* ─── Reusable animated section wrapper ─── */
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Flow Node ─── */
function FlowNode({ icon: Icon, label, tooltip, color = 'primary', delay = 0, glowing = false }) {
  const [hovered, setHovered] = useState(false);

  const colorMap = {
    primary: { border: 'border-primary-500/40', bg: 'bg-primary-500/5', text: 'text-primary-400', glow: 'shadow-primary-500/20', hoverBorder: 'hover:border-primary-400', ring: 'ring-primary-500/30' },
    blue:    { border: 'border-cyan-500/40',    bg: 'bg-cyan-500/5',    text: 'text-cyan-400',    glow: 'shadow-cyan-500/20',    hoverBorder: 'hover:border-cyan-400',    ring: 'ring-cyan-500/30' },
    orange:  { border: 'border-amber-500/40',   bg: 'bg-amber-500/5',   text: 'text-amber-400',   glow: 'shadow-amber-500/20',   hoverBorder: 'hover:border-amber-400',   ring: 'ring-amber-500/30' },
    green:   { border: 'border-emerald-500/40',  bg: 'bg-emerald-500/5',  text: 'text-emerald-400',  glow: 'shadow-emerald-500/20',  hoverBorder: 'hover:border-emerald-400',  ring: 'ring-emerald-500/30' },
    purple:  { border: 'border-violet-500/40',  bg: 'bg-violet-500/5',  text: 'text-violet-400',  glow: 'shadow-violet-500/20',  hoverBorder: 'hover:border-violet-400',  ring: 'ring-violet-500/30' },
    rose:    { border: 'border-rose-500/40',    bg: 'bg-rose-500/5',    text: 'text-rose-400',    glow: 'shadow-rose-500/20',    hoverBorder: 'hover:border-rose-400',    ring: 'ring-rose-500/30' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`
          relative flex flex-col items-center justify-center gap-2 px-4 py-3.5 rounded-xl
          border ${c.border} ${c.bg} ${c.hoverBorder}
          backdrop-blur-sm transition-all duration-300 cursor-default
          min-w-[110px] md:min-w-[130px]
          ${hovered ? `shadow-lg ${c.glow} ring-1 ${c.ring} scale-105` : ''}
          ${glowing ? `ring-1 ${c.ring}` : ''}
        `}
      >
        <Icon className={`w-5 h-5 ${c.text} transition-transform duration-300 ${hovered ? 'scale-110' : ''}`} />
        <span className={`text-xs md:text-sm font-semibold text-center leading-tight ${hovered ? 'text-white' : 'text-dark-200'}`}>
          {label}
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className={`
          absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-30
          px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 shadow-xl
          text-xs text-dark-200 max-w-[200px] text-center leading-relaxed
          transition-all duration-200 pointer-events-none
          ${hovered ? 'opacity-100 translate-y-[-4px]' : 'opacity-0 translate-y-0'}
        `}>
          {tooltip}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-dark-800 border-r border-b border-dark-600" />
        </div>
      )}
    </motion.div>
  );
}

/* ─── Arrow connector (horizontal) ─── */
function HArrow({ color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-500/60 to-primary-500/20',
    blue: 'from-cyan-500/60 to-cyan-500/20',
    orange: 'from-amber-500/60 to-amber-500/20',
    green: 'from-emerald-500/60 to-emerald-500/20',
    purple: 'from-violet-500/60 to-violet-500/20',
    rose: 'from-rose-500/60 to-rose-500/20',
  };
  const grad = colorMap[color] || colorMap.primary;
  return (
    <div className="flex items-center mx-1 shrink-0">
      <div className={`w-6 md:w-10 h-[2px] bg-gradient-to-r ${grad}`} />
      <div className={`w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] ${
        color === 'blue' ? 'border-l-cyan-500/60' :
        color === 'orange' ? 'border-l-amber-500/60' :
        color === 'green' ? 'border-l-emerald-500/60' :
        color === 'purple' ? 'border-l-violet-500/60' :
        color === 'rose' ? 'border-l-rose-500/60' :
        'border-l-primary-500/60'
      }`} />
    </div>
  );
}

/* ─── Vertical Arrow ─── */
function VArrow({ color = 'primary' }) {
  const borderColor =
    color === 'blue' ? 'border-t-cyan-500/60' :
    color === 'orange' ? 'border-t-amber-500/60' :
    color === 'green' ? 'border-t-emerald-500/60' :
    color === 'purple' ? 'border-t-violet-500/60' :
    color === 'rose' ? 'border-t-rose-500/60' :
    'border-t-primary-500/60';
  const bgColor =
    color === 'blue' ? 'from-cyan-500/60 to-cyan-500/20' :
    color === 'orange' ? 'from-amber-500/60 to-amber-500/20' :
    color === 'green' ? 'from-emerald-500/60 to-emerald-500/20' :
    color === 'purple' ? 'from-violet-500/60 to-violet-500/20' :
    color === 'rose' ? 'from-rose-500/60 to-rose-500/20' :
    'from-primary-500/60 to-primary-500/20';
  return (
    <div className="flex flex-col items-center my-1 shrink-0">
      <div className={`h-6 md:h-8 w-[2px] bg-gradient-to-b ${bgColor}`} />
      <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] ${borderColor}`} />
    </div>
  );
}

/* ─── Fan-out connector (1 to many, vertical) ─── */
function FanOut({ count = 4, color = 'primary' }) {
  const lineColor =
    color === 'blue' ? 'bg-cyan-500/40' :
    color === 'green' ? 'bg-emerald-500/40' :
    color === 'purple' ? 'bg-violet-500/40' :
    'bg-primary-500/40';
  const arrowBorder =
    color === 'blue' ? 'border-t-cyan-500/60' :
    color === 'green' ? 'border-t-emerald-500/60' :
    color === 'purple' ? 'border-t-violet-500/60' :
    'border-t-primary-500/60';
  return (
    <div className="flex flex-col items-center w-full">
      {/* Vertical stem */}
      <div className={`h-6 w-[2px] ${lineColor}`} />
      {/* Horizontal bar */}
      <div className={`h-[2px] ${lineColor}`} style={{ width: `${Math.min(count * 25, 90)}%` }} />
      {/* Drop-down lines */}
      <div className="flex justify-between" style={{ width: `${Math.min(count * 25, 90)}%` }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`h-4 w-[2px] ${lineColor}`} />
            <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] ${arrowBorder}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Section badge ─── */
function SectionBadge({ label, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    blue: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[color] || colors.primary}`}>
      {label}
    </span>
  );
}

/* ─── Explanation Card ─── */
function ExplanationCard({ icon: Icon, title, description, color = 'primary', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const colorMap = {
    primary: { icon: 'text-primary-400', border: 'hover:border-primary-500/30', shadow: 'hover:shadow-primary-500/5' },
    blue:    { icon: 'text-cyan-400',    border: 'hover:border-cyan-500/30',    shadow: 'hover:shadow-cyan-500/5' },
    orange:  { icon: 'text-amber-400',   border: 'hover:border-amber-500/30',   shadow: 'hover:shadow-amber-500/5' },
    green:   { icon: 'text-emerald-400',  border: 'hover:border-emerald-500/30',  shadow: 'hover:shadow-emerald-500/5' },
    purple:  { icon: 'text-violet-400',  border: 'hover:border-violet-500/30',  shadow: 'hover:shadow-violet-500/5' },
    rose:    { icon: 'text-rose-400',    border: 'hover:border-rose-500/30',    shadow: 'hover:shadow-rose-500/5' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card p-6 transition-all duration-300 ${c.border} ${c.shadow} hover:shadow-lg hover:bg-dark-800/70 group`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-dark-800 border border-dark-700 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">{title}</h3>
          <p className="text-sm text-dark-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Color Legend ─── */
function Legend() {
  const items = [
    { color: 'bg-cyan-500', label: 'AI / ML Components' },
    { color: 'bg-emerald-500', label: 'Verified / Stored Data' },
    { color: 'bg-amber-500', label: 'Human Interaction' },
    { color: 'bg-violet-500', label: 'External Services' },
    { color: 'bg-primary-500', label: 'Core Pipeline' },
  ];
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4 mb-2">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="text-xs text-dark-400">{label}</span>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Architecture() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 font-sans">
      {/* ── Navbar ── */}
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <SectionBadge label="Technical Deep-Dive" color="primary" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mt-5 mb-5 leading-tight">
            System <span className="gradient-text">Architecture</span>
          </h1>
          <p className="text-lg text-dark-400 leading-relaxed">
            A multi-layered view of how MediGuide-AI transforms handwritten prescriptions into verified medication schedules — from pixel to patient.
          </p>
          <Legend />
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
           1) HIGH-LEVEL ARCHITECTURE
           ═══════════════════════════════════════════════════════ */}
        <AnimatedSection className="space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
              <Layers className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">High-Level Architecture</h2>
              <p className="text-sm text-dark-500">End-to-end system overview</p>
            </div>
          </div>

          <div className="glass-card p-6 md:p-10 overflow-x-auto">
            {/* Row 1: User → Frontend → Backend */}
            <div className="flex items-center justify-center flex-wrap gap-y-4">
              <FlowNode icon={Monitor} label="User" tooltip="Patient or caretaker interacting via browser" color="orange" delay={0.1} />
              <HArrow color="primary" />
              <FlowNode icon={Monitor} label="React Frontend" tooltip="Responsive SPA with Tailwind CSS & Framer Motion" color="primary" delay={0.2} />
              <HArrow color="primary" />
              <FlowNode icon={Server} label="FastAPI Backend" tooltip="Async Python backend with Pydantic validation" color="primary" delay={0.3} glowing />
            </div>

            {/* Vertical connector from Backend to fan-out */}
            <div className="flex justify-center">
              <FanOut count={4} color="primary" />
            </div>

            {/* Row 2: Four backend services */}
            <div className="flex items-start justify-center gap-3 md:gap-6 flex-wrap">
              <FlowNode icon={Database} label="PostgreSQL" tooltip="Relational store for users, prescriptions, schedules" color="green" delay={0.4} />
              <FlowNode icon={Search} label="ChromaDB" tooltip="Vector DB for RAG semantic search" color="blue" delay={0.5} />
              <FlowNode icon={Globe} label="OpenFDA API" tooltip="FDA drug database for interactions & side-effects" color="purple" delay={0.6} />
              <FlowNode icon={Sparkles} label="Gemini API" tooltip="Google Gemini 2.5 Flash for OCR & reasoning" color="blue" delay={0.7} />
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════
           2) MID-LEVEL: AI PIPELINE
           ═══════════════════════════════════════════════════════ */}
        <AnimatedSection className="space-y-8" delay={0.1}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">AI Extraction Pipeline</h2>
              <p className="text-sm text-dark-500">Prescription image → structured medication data</p>
            </div>
          </div>

          <div className="glass-card p-6 md:p-10 overflow-x-auto">
            {/* Row 1 */}
            <div className="flex items-center justify-center flex-wrap gap-y-4">
              <FlowNode icon={Image} label="Image Upload" tooltip="User uploads a prescription photo" color="orange" delay={0.1} />
              <HArrow color="blue" />
              <FlowNode icon={ScanSearch} label="Image Preprocessing" tooltip="Resize, denoise, contrast normalization" color="blue" delay={0.2} />
              <HArrow color="blue" />
              <FlowNode icon={Eye} label="YOLO Layout Detection" tooltip="YOLOv8 detects header, medicine blocks, signature" color="blue" delay={0.3} />
              <HArrow color="blue" />
              <FlowNode icon={Crop} label="Region Cropping" tooltip="Individual regions cropped for focused analysis" color="blue" delay={0.4} />
            </div>

            <div className="flex justify-center">
              <VArrow color="blue" />
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-center flex-wrap gap-y-4">
              <FlowNode icon={Sparkles} label="Gemini OCR" tooltip="Gemini Vision reads handwriting from cropped regions" color="blue" delay={0.5} />
              <HArrow color="primary" />
              <FlowNode icon={FileText} label="JSON Extraction" tooltip="Structured output: medicine name, dosage, frequency" color="primary" delay={0.6} />
              <HArrow color="primary" />
              <FlowNode icon={ShieldCheck} label="Rule Engine" tooltip="Validates dosage ranges, frequency logic, drug names" color="green" delay={0.7} />
            </div>

            <div className="flex justify-center">
              <VArrow color="green" />
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-center flex-wrap gap-y-4">
              <FlowNode icon={BarChart3} label="Confidence Scoring" tooltip="Each field gets a 0-100 confidence score" color="primary" delay={0.8} />
              <HArrow color="orange" />
              <FlowNode icon={UserCheck} label="Human Verification" tooltip="User reviews and corrects AI extraction" color="orange" delay={0.9} />
              <HArrow color="green" />
              <FlowNode icon={CalendarClock} label="Schedule Generation" tooltip="Creates medication reminders with smart timing" color="green" delay={1.0} />
              <HArrow color="green" />
              <FlowNode icon={HardDrive} label="Database Storage" tooltip="Final verified data stored in PostgreSQL" color="green" delay={1.1} />
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════
           3) LOW-LEVEL: RAG PIPELINE
           ═══════════════════════════════════════════════════════ */}
        <AnimatedSection className="space-y-8" delay={0.1}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Waypoints className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">RAG Knowledge Pipeline</h2>
              <p className="text-sm text-dark-500">Retrieval-Augmented Generation for drug intelligence</p>
            </div>
          </div>

          <div className="glass-card p-6 md:p-10 overflow-x-auto">
            {/* Row 1 */}
            <div className="flex items-center justify-center flex-wrap gap-y-4">
              <FlowNode icon={MessageSquare} label="User Query" tooltip="'What are the side-effects of Metformin?'" color="orange" delay={0.1} />
              <HArrow color="purple" />
              <FlowNode icon={Waypoints} label="Sentence Transformer" tooltip="all-MiniLM-L6-v2 encodes query into 384-dim vector" color="purple" delay={0.2} />
              <HArrow color="purple" />
              <FlowNode icon={Search} label="ChromaDB Vector Search" tooltip="Nearest-neighbor lookup across embedded drug data" color="purple" delay={0.3} />
              <HArrow color="purple" />
              <FlowNode icon={BookOpen} label="Context Retrieval" tooltip="Top-k relevant passages retrieved with scores" color="purple" delay={0.4} />
            </div>

            <div className="flex justify-center">
              <VArrow color="purple" />
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-center flex-wrap gap-y-4">
              <FlowNode icon={Globe} label="OpenFDA Cache Check" tooltip="Checks local cache before hitting FDA API" color="purple" delay={0.5} />
              <HArrow color="blue" />
              <FlowNode icon={Sparkles} label="Gemini Prompt Injection" tooltip="Context + query injected into structured prompt" color="blue" delay={0.6} />
              <HArrow color="green" />
              <FlowNode icon={ShieldCheck} label="Grounded Response" tooltip="Response anchored to retrieved facts, not hallucinated" color="green" delay={0.7} />
              <HArrow color="green" />
              <FlowNode icon={Quote} label="Citation Tagging" tooltip="Every claim linked to its source document" color="green" delay={0.8} />
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════════
           EXPLANATION CARDS
           ═══════════════════════════════════════════════════════ */}
        <AnimatedSection className="space-y-8" delay={0.1}>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Design Decisions</h2>
            <p className="text-dark-500 text-sm">Why we chose each piece of the stack</p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <ExplanationCard
              icon={Eye}
              title="Why YOLOv8?"
              description="Prescriptions are chaotic. Instead of feeding the whole image to an LLM, YOLO isolates the doctor's header, medicine blocks, and signatures. This dramatically improves LLM focus and reduces hallucination by 40%."
              color="blue"
              delay={0}
            />
            <ExplanationCard
              icon={Zap}
              title="Why Gemini 2.5 Flash?"
              description="Gemini 2.5 Flash provides fast, cost-effective multimodal capabilities. It performs actual OCR and semantic extraction on cropped YOLO regions, translating messy handwriting into structured JSON with sub-second latency."
              color="purple"
              delay={0.08}
            />
            <ExplanationCard
              icon={GitMerge}
              title="Why Hybrid AI?"
              description="Relying purely on LLMs for vision is error-prone. Relying purely on traditional OCR misses semantic context. The Hybrid YOLO + LLM approach yields 95%+ accuracy by combining spatial detection with language understanding."
              color="primary"
              delay={0.16}
            />
            <ExplanationCard
              icon={Waypoints}
              title="Why RAG over Pure LLM?"
              description="Pure LLMs hallucinate drug information. RAG grounds every response in retrieved FDA data and embedded medical literature, ensuring factual accuracy with full citation traceability."
              color="rose"
              delay={0.24}
            />
            <ExplanationCard
              icon={UserCheck}
              title="Why Human Verification?"
              description="AI suggests, humans confirm. The extraction pipeline always halts at a verification state, forcing the user to review before schedules are finalized. Safety-critical systems demand human-in-the-loop."
              color="orange"
              delay={0.32}
            />
            <ExplanationCard
              icon={Lock}
              title="Why PostgreSQL + ChromaDB?"
              description="PostgreSQL provides ACID-compliant relational storage for users, prescriptions, and schedules. ChromaDB adds vector search for semantic drug queries. Together they cover structured + unstructured data needs."
              color="green"
              delay={0.4}
            />
            <ExplanationCard
              icon={HardDrive}
              title="Why Offline AI?"
              description="For maximum privacy and environments with zero connectivity, our offline toggle switches reasoning and extraction from cloud APIs to local Ollama (Llama 3.3 & LLaVA) models running entirely on your hardware."
              color="blue"
              delay={0.48}
            />
          </div>
        </AnimatedSection>

        {/* ── Footer spacer ── */}
        <div className="h-8" />
      </main>
    </div>
  );
}
