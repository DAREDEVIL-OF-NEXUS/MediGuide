import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  AlertTriangle,
  Activity,
  ChevronRight,
  ShieldAlert,
  Home,
  CheckCircle2,
  BrainCircuit,
  Loader2,
  CalendarPlus,
  Video,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function MediTriage() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch available symptoms on mount
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await api.get('/meditriage/symptoms');
        setSymptoms(response.data);
      } catch (err) {
        console.error('Failed to fetch symptoms:', err);
        setError('Failed to load symptom list. Please try again later.');
      }
    };
    fetchSymptoms();
  }, []);

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/meditriage/predict', {
        symptoms: selectedSymptoms,
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'Visit Hospital') return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (severity === 'Consult Doctor') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'Visit Hospital') return <ShieldAlert className="w-6 h-6" />;
    if (severity === 'Consult Doctor') return <Activity className="w-6 h-6" />;
    return <Home className="w-6 h-6" />;
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 w-fit">
          <Stethoscope className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide uppercase">AI Triage</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">MediTriage</h1>
        <p className="text-dark-400 max-w-2xl">
          Select your symptoms below, and our AI model will predict possible conditions,
          assess severity, and provide an actionable medical explanation.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-dark-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Select Symptoms</h2>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="mb-4 text-sm text-dark-400">
              Selected: <span className="text-primary-400 font-bold">{selectedSymptoms.length}</span>
            </div>

            <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar flex flex-wrap gap-2">
              {symptoms.length === 0 ? (
                <div className="text-dark-400 text-sm py-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading symptoms...
                </div>
              ) : (
                symptoms.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                      ${selectedSymptoms.includes(sym)
                        ? 'bg-primary-500 text-white border-primary-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                        : 'bg-dark-800 text-dark-300 border-dark-700 hover:border-dark-500 hover:bg-dark-700'
                      }`}
                  >
                    {sym.charAt(0).toUpperCase() + sym.slice(1)}
                  </button>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading || selectedSymptoms.length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-teal-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <BrainCircuit className="w-6 h-6" />
            )}
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </div>

        {/* Results Section */}
        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Severity Badge */}
                <div className={`p-6 rounded-2xl border ${getSeverityColor(result.severity)}`}>
                  <div className="flex items-center gap-4 mb-2">
                    {getSeverityIcon(result.severity)}
                    <h3 className="text-2xl font-bold uppercase tracking-wide">
                      {result.severity}
                    </h3>
                  </div>
                  <p className="text-sm opacity-90">
                    Based on your symptoms and our model's confidence, this is the recommended level of care.
                  </p>
                </div>

                {/* Prediction Details */}
                <div className="glass-card p-6 border border-dark-700/50 space-y-6">
                  <div>
                    <div className="text-dark-400 text-sm mb-1 uppercase tracking-wider font-semibold">Predicted Condition</div>
                    <div className="text-2xl font-bold text-white capitalize">
                      {result.prediction.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-dark-400 text-sm uppercase tracking-wider font-semibold">Model Confidence</div>
                      <div className="flex items-center gap-2">
                        {result.is_fallback && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                            Gemini Fallback
                          </span>
                        )}
                        <div className="text-primary-400 font-bold">{result.confidence}%</div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary-500 to-teal-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="glass-card p-6 border border-dark-700/50 bg-gradient-to-br from-dark-900 to-dark-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit className="w-24 h-24 text-primary-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-primary-400 font-bold">
                      <BrainCircuit className="w-5 h-5" />
                      AI Explanation
                    </div>
                    <p className="text-dark-200 leading-relaxed text-sm">
                      {result.explanation}
                    </p>
                  </div>
                </div>

                {/* Appointment Booking */}
                {(result.severity === 'Consult Doctor' || result.severity === 'Visit Hospital') && (
                  <div className="glass-card p-6 border border-dark-700/50 space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-dark-700/50 pb-3">
                      <CalendarPlus className="w-5 h-5 text-indigo-400" />
                      Book an Appointment
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <a href="https://ors.gov.in" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-indigo-500/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white group-hover:text-indigo-400 transition-colors">ORS Portal</div>
                            <div className="text-xs text-dark-400">Gov. Hospitals</div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-indigo-400" />
                      </a>
                      
                      <a href="https://esanjeevani.mohfw.gov.in" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-teal-500/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                            <Video className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white group-hover:text-teal-400 transition-colors">eSanjeevani</div>
                            <div className="text-xs text-dark-400">Teleconsultation</div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-teal-400" />
                      </a>

                      <a href="https://www.practo.com/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-blue-500/50 transition-colors group sm:col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">Practo</div>
                            <div className="text-xs text-dark-400">Private Clinics & Specialists</div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-blue-400" />
                      </a>
                    </div>
                  </div>
                )}

              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 glass-card border border-dark-700/50 border-dashed rounded-2xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center text-dark-500 mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Awaiting Symptoms</h3>
                <p className="text-dark-400 text-sm">
                  Select your symptoms from the list and click "Analyze Symptoms" to see AI-driven triage results.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
