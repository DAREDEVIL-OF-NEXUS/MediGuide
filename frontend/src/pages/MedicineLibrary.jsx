import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Pill, ShieldAlert, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { medicines } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function MedicineCard({ med }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      layout
      className="glass-card overflow-hidden border border-dark-700/50 hover:border-dark-600 transition-colors"
    >
      <div 
        className="p-5 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Pill className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white transition-colors">
                {med.name}
              </h3>
              {med.source === 'OpenFDA' ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> AI
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-dark-400">
              {med.generic_name && (
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {med.generic_name}
                </span>
              )}
              {med.brand_names && med.brand_names.length > 0 && (
                <span className="flex items-center gap-1 text-primary-400">
                  <Tag className="w-3 h-3" /> Brands: {med.brand_names.slice(0, 2).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {expanded ? <ChevronUp className="w-5 h-5 text-dark-500" /> : <ChevronDown className="w-5 h-5 text-dark-500" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-dark-700/50 bg-dark-900/50"
          >
            <div className="p-5 space-y-6">
              {med.photo_url && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Medicine Image</h4>
                  <img 
                    src={med.photo_url} 
                    alt={med.name} 
                    className="w-full max-w-sm rounded-xl border border-dark-700/50 object-cover"
                  />
                </div>
              )}

              {med.description && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-400" /> About
                  </h4>
                  <p className="text-sm text-dark-300 leading-relaxed">{med.description}</p>
                </div>
              )}

              {med.side_effects && med.side_effects.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" /> Common Side Effects
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-dark-300 space-y-1">
                    {med.side_effects.map((se, i) => <li key={i}>{se}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {med.interactions && med.interactions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" /> Interactions
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-dark-300 space-y-1">
                      {med.interactions.map((int, i) => <li key={i}>{int}</li>)}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  {med.contraindications && med.contraindications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" /> Contraindications
                      </h4>
                      <ul className="list-disc pl-5 text-sm text-dark-300 space-y-1">
                        {med.contraindications.map((ci, i) => <li key={i}>{ci}</li>)}
                      </ul>
                    </div>
                  )}
                  {med.warnings && med.warnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Warnings
                      </h4>
                      <ul className="list-disc pl-5 text-sm text-dark-300 space-y-1">
                        {med.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Instructions */}
              {med.usage_instructions && (
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-1">Usage Instructions</h4>
                  <p className="text-sm text-dark-300">{med.usage_instructions}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MedicineLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await medicines.list();
        setItems(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load Medicine Library");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const filtered = items.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.generic_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-8 md:flex md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-primary-400" />
              Medicine <span className="gradient-text">Library</span>
            </h1>
            <p className="text-dark-400">
              Browse clinical safety data automatically extracted and cached from your prescriptions.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="Search medicines..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700/50 rounded-xl py-2 pl-10 pr-4 text-white focus:border-primary-500/50"
            />
            <Search className="w-4 h-4 text-dark-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading Medicine Library..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800/50 border border-dark-700 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-dark-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Medicines Found</h3>
            <p className="text-dark-400 text-sm max-w-sm">
              Your medicine library is currently empty or no results match your search. Medicines are added automatically when you verify a prescription.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(med => (
              <MedicineCard key={med.id} med={med} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
