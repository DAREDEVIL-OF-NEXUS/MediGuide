import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  User,
  Stethoscope,
  FileText,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  X,
  Calendar,
  Activity,
  ClipboardList,
  Building2,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { prescriptions } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function StatusBadge({ status }) {
  const config = {
    completed: { class: 'badge-success', label: 'Completed', icon: CheckCircle },
    processing: { class: 'badge-info', label: 'Processing', icon: Loader2 },
    failed: { class: 'badge-error', label: 'Failed', icon: XCircle },
    pending: { class: 'badge-pending', label: 'Pending', icon: Clock },
  };
  const item = config[status] || config.pending;
  const Icon = item.icon;

  return (
    <span className={`${item.class} flex items-center gap-1.5 ${status === 'processing' ? 'animate-pulse' : ''}`}>
      <Icon className={`w-3.5 h-3.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {item.label}
    </span>
  );
}

function InfoSection({ icon: Icon, title, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2.5 p-4 border-b border-dark-700/50">
        <Icon className="w-4.5 h-4.5 text-primary-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-dark-700/20 last:border-0">
      <span className="text-xs font-medium text-dark-500 sm:w-32 flex-shrink-0 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-dark-200">{value}</span>
    </div>
  );
}

function MedicineCard({ medicine, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:border-dark-600/50 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Pill className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{medicine.name || 'Unknown Medicine'}</p>
            {medicine.type && (
              <p className="text-xs text-dark-500">{medicine.type}</p>
            )}
          </div>
        </div>
        <span className="badge-info text-[10px]">#{index + 1}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {medicine.dosage && (
          <div>
            <p className="text-[10px] text-dark-600 uppercase tracking-wider mb-0.5">Dosage</p>
            <p className="text-xs text-dark-300 font-medium">{medicine.dosage}</p>
          </div>
        )}
        {medicine.frequency && (
          <div>
            <p className="text-[10px] text-dark-600 uppercase tracking-wider mb-0.5">Frequency</p>
            <p className="text-xs text-dark-300 font-medium">{medicine.frequency}</p>
          </div>
        )}
        {medicine.timing && (
          <div>
            <p className="text-[10px] text-dark-600 uppercase tracking-wider mb-0.5">Timing</p>
            <p className="text-xs text-dark-300 font-medium">{medicine.timing}</p>
          </div>
        )}
        {medicine.duration && (
          <div>
            <p className="text-[10px] text-dark-600 uppercase tracking-wider mb-0.5">Duration</p>
            <p className="text-xs text-dark-300 font-medium">{medicine.duration}</p>
          </div>
        )}
      </div>

      {medicine.instructions && (
        <div className="mt-3 pt-3 border-t border-dark-700/30">
          <p className="text-[10px] text-dark-600 uppercase tracking-wider mb-0.5">Instructions</p>
          <p className="text-xs text-dark-400">{medicine.instructions}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function PrescriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await prescriptions.getById(id);
        setPrescription(response.data);
      } catch (error) {
        console.error('Failed to fetch prescription:', error);
        toast.error('Failed to load prescription');
        navigate('/prescriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id, navigate]);

  // Poll for processing status
  useEffect(() => {
    if (!prescription || prescription.status !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const response = await prescriptions.getById(id);
        setPrescription(response.data);
        if (response.data.status !== 'processing') {
          clearInterval(interval);
          if (response.data.status === 'completed') {
            toast.success('Prescription processed successfully!');
          }
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [prescription?.status, id]);

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const response = await prescriptions.reprocess(id);
      setPrescription(response.data);
      toast.success('Reprocessing started!');
    } catch (error) {
      toast.error('Failed to reprocess. Please try again.');
    } finally {
      setReprocessing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await prescriptions.delete(id);
      toast.success('Prescription deleted');
      navigate('/prescriptions');
    } catch (error) {
      toast.error('Failed to delete prescription');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading prescription details..." />
      </div>
    );
  }

  if (!prescription) return null;

  const data = prescription.extracted_data || {};
  const doctorInfo = data.doctor_info || {};
  const patientInfo = data.patient_info || {};
  const medicines = data.medicines || [];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/prescriptions')}
              className="p-2 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-400 hover:text-white hover:bg-dark-700/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Prescription Details
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-dark-500 font-mono">
                  ID: {prescription.id?.slice(-8)}
                </span>
                <StatusBadge status={prescription.status} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReprocess}
              disabled={reprocessing || prescription.status === 'processing'}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
              {reprocessing ? 'Reprocessing...' : 'Reprocess'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Image viewer */}
          <div className="lg:col-span-2">
            <div className="glass-card overflow-hidden sticky top-4">
              <div className="flex items-center justify-between p-3 border-b border-dark-700/50">
                <p className="text-xs font-medium text-dark-400">Prescription Image</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
                    className="p-1.5 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-700/50 transition-all"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-dark-500 font-mono w-10 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))}
                    className="p-1.5 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-700/50 transition-all"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div
                className="overflow-auto bg-dark-900 cursor-move"
                style={{ maxHeight: '500px' }}
                onClick={() => setImageZoomed(!imageZoomed)}
              >
                {prescription.image_url ? (
                  <img
                    src={prescription.image_url}
                    alt="Prescription"
                    className="w-full transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-dark-700" />
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-dark-700/50">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-dark-600" />
                  <p className="text-xs text-dark-500">
                    Uploaded {formatDate(prescription.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Extracted data */}
          <div className="lg:col-span-3 space-y-4">
            {prescription.status === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5 border-cyan-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Processing with AI</p>
                    <p className="text-xs text-dark-400 mt-0.5">
                      Extracting medication details... This usually takes 10–30 seconds.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {prescription.status === 'failed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5 border-rose-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Processing Failed</p>
                    <p className="text-xs text-dark-400 mt-0.5">
                      {prescription.error_message || 'Unable to extract data. Try reprocessing or upload a clearer image.'}
                    </p>
                  </div>
                  <button onClick={handleReprocess} className="btn-secondary text-sm py-2 px-4">
                    Retry
                  </button>
                </div>
              </motion.div>
            )}

            {/* Doctor Information */}
            {Object.values(doctorInfo).some(Boolean) && (
              <InfoSection icon={Stethoscope} title="Doctor Information">
                <InfoRow label="Name" value={doctorInfo.name} />
                <InfoRow label="Specialization" value={doctorInfo.specialization} />
                <InfoRow label="Registration" value={doctorInfo.registration_number} />
                <InfoRow label="Clinic" value={doctorInfo.clinic_name} />
                <InfoRow label="Address" value={doctorInfo.address} />
                <InfoRow label="Phone" value={doctorInfo.phone} />
              </InfoSection>
            )}

            {/* Patient Information */}
            {Object.values(patientInfo).some(Boolean) && (
              <InfoSection icon={User} title="Patient Information">
                <InfoRow label="Name" value={patientInfo.name} />
                <InfoRow label="Age" value={patientInfo.age} />
                <InfoRow label="Gender" value={patientInfo.gender} />
                <InfoRow label="Weight" value={patientInfo.weight} />
              </InfoSection>
            )}

            {/* Diagnosis */}
            {data.diagnosis && (
              <InfoSection icon={Activity} title="Diagnosis">
                <p className="text-sm text-dark-200 leading-relaxed">{data.diagnosis}</p>
              </InfoSection>
            )}

            {/* Medicines */}
            {medicines.length > 0 && (
              <InfoSection icon={Pill} title={`Medicines (${medicines.length})`}>
                <div className="space-y-3">
                  {medicines.map((med, i) => (
                    <MedicineCard key={i} medicine={med} index={i} />
                  ))}
                </div>
              </InfoSection>
            )}

            {/* General Instructions */}
            {data.instructions && (
              <InfoSection icon={ClipboardList} title="General Instructions">
                <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap">{data.instructions}</p>
              </InfoSection>
            )}

            {/* Notes */}
            {prescription.notes && (
              <InfoSection icon={FileText} title="Your Notes">
                <p className="text-sm text-dark-300 leading-relaxed">{prescription.notes}</p>
              </InfoSection>
            )}

            {/* Empty state for completed but no data */}
            {prescription.status === 'completed' && !Object.values(doctorInfo).some(Boolean) && medicines.length === 0 && !data.diagnosis && (
              <div className="glass-card p-8 text-center">
                <AlertCircle className="w-10 h-10 text-amber-400/50 mx-auto mb-3" />
                <p className="text-sm text-dark-400">
                  No structured data could be extracted from this prescription.
                </p>
                <button onClick={handleReprocess} className="btn-secondary text-sm mt-4">
                  Try Reprocessing
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white text-center mb-2">
                Delete Prescription?
              </h3>
              <p className="text-sm text-dark-400 text-center mb-6">
                This action cannot be undone. The prescription image and all extracted data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
