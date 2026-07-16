import { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  AlertTriangle,
  PlusCircle,
  Trash2,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { medicalHistory, prescriptions } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [condition, setCondition] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [historyRes, rxRes] = await Promise.all([
        medicalHistory.list(),
        prescriptions.list()
      ]);
      
      const conditions = (historyRes.data || []).map(r => ({ ...r, type: 'condition' }));
      const rxs = (rxRes.data?.items || []).map(r => ({ ...r, type: 'prescription' }));
      
      // Sort combined timeline by date
      const combined = [...conditions, ...rxs].sort((a, b) => {
        const dateA = new Date(a.diagnosed_date || a.prescription_date || a.created_at);
        const dateB = new Date(b.diagnosed_date || b.prescription_date || b.created_at);
        return dateB - dateA;
      });
      
      setRecords(combined);
    } catch (error) {
      console.error('Failed to load timeline:', error);
      toast.error('Failed to load medical records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!condition.trim()) {
      toast.error('Please enter a condition name.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        condition: condition.trim(),
        diagnosed_date: diagnosedDate || null,
        severity,
        treatment_notes: treatmentNotes.trim() || null,
        is_active: isActive,
      };

      const response = await medicalHistory.create(payload);
      setRecords(prev => {
        const newRecord = { ...response.data, type: 'condition' };
        return [newRecord, ...prev].sort((a, b) => {
          const dateA = new Date(a.diagnosed_date || a.prescription_date || a.created_at);
          const dateB = new Date(b.diagnosed_date || b.prescription_date || b.created_at);
          return dateB - dateA;
        });
      });
      toast.success('Medical history record added!');
      
      // Reset Form
      setCondition('');
      setDiagnosedDate('');
      setSeverity('Moderate');
      setTreatmentNotes('');
      setIsActive(true);
    } catch (error) {
      console.error('Failed to create medical record:', error);
      toast.error('Failed to log medical record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await medicalHistory.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Record removed.');
    } catch (error) {
      console.error('Failed to delete medical record:', error);
      toast.error('Failed to remove medical record.');
    }
  };

  const getSeverityBadge = (level) => {
    switch (level) {
      case 'Severe':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-3 h-3" /> Severe
          </span>
        );
      case 'Mild':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-3 h-3" /> Mild
          </span>
        );
      default: // Moderate
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Heart className="w-3 h-3" /> Moderate
          </span>
        );
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Medical <span className="gradient-text">History</span>
        </h1>
        <p className="text-dark-400 mt-1">
          Maintain your personal health record, chronic conditions, and allergy warnings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Log Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 sticky top-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary-400" />
              Add Medical Record
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Condition Name */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                  Condition / Allergy Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Penicillin Allergy"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="input-field"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Diagnosis Date */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                  Diagnosis Date (Optional)
                </label>
                <input
                  type="date"
                  value={diagnosedDate}
                  onChange={(e) => setDiagnosedDate(e.target.value)}
                  className="input-field"
                  disabled={submitting}
                />
              </div>

              {/* Severity Selection */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Mild', 'Moderate', 'Severe'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      className={`
                        py-2 px-3 text-xs font-semibold rounded-lg border transition-all
                        ${severity === level
                          ? level === 'Severe'
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                            : level === 'Mild'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-dark-800 border-dark-700/50 text-dark-400 hover:text-white'
                        }
                      `}
                      disabled={submitting}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Treatment Notes */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                  Treatment / Doctor Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Avoid dairy products, prescribed Lisinopril 10mg daily."
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  className="input-field resize-none"
                  disabled={submitting}
                />
              </div>

              {/* Active Status Checkbox */}
              <div className="flex items-center gap-2 py-2">
                <input
                  id="active-checkbox"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-dark-700 text-primary-500 focus:ring-primary-500 bg-dark-800"
                  disabled={submitting}
                />
                <label htmlFor="active-checkbox" className="text-xs text-dark-300 font-medium cursor-pointer selection:bg-transparent">
                  This condition is currently active
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-primary-500 to-teal-500 text-white font-bold text-sm py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary-500/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging...</span>
                  </>
                ) : (
                  <span>Log Record</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Records list (7 cols) */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="glass-card py-12 flex justify-center">
              <LoadingSpinner text="Loading patient record..." />
            </div>
          ) : records.length === 0 ? (
            <div className="glass-card p-12 text-center border border-dashed border-dark-700">
              <Activity className="w-12 h-12 text-dark-700 mx-auto mb-4" />
              <h3 className="text-base font-bold text-white mb-1">No medical records</h3>
              <p className="text-sm text-dark-500 max-w-sm mx-auto">
                Your medical history is clean! Log past illnesses, drug allergies, or chronic conditions to help flag drug interactions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                if (record.type === 'prescription') {
                  return (
                    <div
                      key={`rx-${record.id}`}
                      className="glass-card p-5 relative border border-indigo-500/10 transition-all hover:bg-dark-800/10"
                    >
                      <div className="space-y-3 pr-8">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-bold text-white text-base md:text-lg">
                            Prescription Visit
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Activity className="w-3 h-3" /> Rx
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-dark-400 flex-wrap">
                          {record.prescription_date && (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5" /> Date: {new Date(record.prescription_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {record.doctor && (
                            <span className="flex items-center gap-1 font-mono">
                              <Heart className="w-3.5 h-3.5" /> Dr. {record.doctor.name} {record.doctor.clinic_name ? `(${record.doctor.clinic_name})` : ''}
                            </span>
                          )}
                        </div>

                        {record.raw_extraction?.diagnosis && (
                          <div className="p-3.5 rounded-xl bg-dark-900/60 border border-dark-700/30 text-xs text-dark-300 leading-relaxed flex items-start gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-dark-200 block mb-0.5 font-medium">Diagnosis:</strong>
                              {record.raw_extraction.diagnosis}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                <div
                  key={`cond-${record.id}`}
                  className={`
                    glass-card p-5 relative border transition-all hover:bg-dark-800/10
                    ${record.is_active ? 'border-primary-500/10' : 'border-dark-800 opacity-70'}
                  `}
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="absolute top-4 right-4 p-2 text-dark-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Body */}
                  <div className="space-y-3 pr-8">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-white text-base md:text-lg">
                        {record.condition}
                      </h4>
                      {getSeverityBadge(record.severity)}
                      {record.is_active ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-700 text-dark-400">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-dark-400 flex-wrap">
                      {record.diagnosed_date && (
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5" /> Diagnosed: {new Date(record.diagnosed_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" /> Logged: {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {record.treatment_notes && (
                      <div className="p-3.5 rounded-xl bg-dark-900/60 border border-dark-700/30 text-xs text-dark-300 leading-relaxed flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-dark-200 block mb-0.5 font-medium">Notes & Treatment:</strong>
                          {record.treatment_notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
