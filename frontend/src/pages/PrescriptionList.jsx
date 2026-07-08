import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  ChevronRight,
  Search,
  Grid3X3,
  List,
  Upload,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { prescriptions as prescriptionsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function StatusBadge({ status }) {
  const config = {
    completed: { class: 'badge-success', label: 'Completed' },
    processing: { class: 'badge-info', label: 'Processing' },
    failed: { class: 'badge-error', label: 'Failed' },
    pending: { class: 'badge-pending', label: 'Pending' },
  };

  const item = config[status] || config.pending;

  return (
    <span className={`${item.class} ${status === 'processing' ? 'animate-pulse' : ''}`}>
      {status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
      {item.label}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function PrescriptionList() {
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionsApi.list();
      setPrescriptionsList(response.data.items || response.data || []);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredPrescriptions = prescriptionsList.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const doctorName = p.extracted_data?.doctor_info?.name?.toLowerCase() || '';
    const diagnosis = p.extracted_data?.diagnosis?.toLowerCase() || '';
    const notes = p.notes?.toLowerCase() || '';
    return doctorName.includes(query) || diagnosis.includes(query) || notes.includes(query);
  });

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading prescriptions..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              My <span className="gradient-text">Prescriptions</span>
            </h1>
            <p className="text-dark-400 mt-1">
              {prescriptionsList.length} prescription{prescriptionsList.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link to="/prescriptions/upload" className="btn-primary flex items-center gap-2 self-start">
            <Upload className="w-4 h-4" />
            Upload New
          </Link>
        </div>

        {/* Search and View Toggle */}
        {prescriptionsList.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-11"
                placeholder="Search by doctor, diagnosis..."
              />
            </div>
            <div className="flex bg-dark-800/50 rounded-xl border border-dark-700/50 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={fetchPrescriptions}
              className="p-2.5 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        {filteredPrescriptions.length === 0 ? (
          prescriptionsList.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No prescriptions yet"
              description="Upload your first prescription and let our AI extract all the important details for you."
              action={() => window.location.href = '/prescriptions/upload'}
              actionLabel="Upload Prescription"
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`No prescriptions matching "${searchQuery}"`}
              action={() => setSearchQuery('')}
              actionLabel="Clear Search"
            />
          )
        ) : viewMode === 'list' ? (
          // List View
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="glass-card overflow-hidden divide-y divide-dark-700/30"
          >
            {filteredPrescriptions.map((prescription) => (
              <motion.div key={prescription.id} variants={itemVariants}>
                <Link
                  to={`/prescriptions/${prescription.id}`}
                  className="flex items-center gap-4 p-4 md:p-5 hover:bg-dark-800/30 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-xl bg-dark-800 border border-dark-700/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {prescription.image_url ? (
                      <img
                        src={prescription.image_url}
                        alt="Prescription"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-dark-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium text-dark-200 group-hover:text-white transition-colors truncate">
                      {prescription.extracted_data?.doctor_info?.name
                        ? `Dr. ${prescription.extracted_data.doctor_info.name}`
                        : `Prescription #${prescription.id?.slice(-6)}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-dark-600" />
                        <span className="text-xs text-dark-500">{formatDate(prescription.created_at)}</span>
                      </div>
                      {prescription.extracted_data?.diagnosis && (
                        <span className="text-xs text-dark-500 truncate max-w-[200px]">
                          {prescription.extracted_data.diagnosis}
                        </span>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={prescription.status} />
                  <ChevronRight className="w-5 h-5 text-dark-600 group-hover:text-dark-400 transition-colors flex-shrink-0 hidden sm:block" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Grid View
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredPrescriptions.map((prescription) => (
              <motion.div key={prescription.id} variants={itemVariants}>
                <Link
                  to={`/prescriptions/${prescription.id}`}
                  className="glass-card-hover block overflow-hidden group"
                >
                  <div className="h-40 bg-dark-800 flex items-center justify-center overflow-hidden">
                    {prescription.image_url ? (
                      <img
                        src={prescription.image_url}
                        alt="Prescription"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <FileText className="w-10 h-10 text-dark-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors truncate">
                        {prescription.extracted_data?.doctor_info?.name
                          ? `Dr. ${prescription.extracted_data.doctor_info.name}`
                          : `Prescription #${prescription.id?.slice(-6)}`}
                      </p>
                      <StatusBadge status={prescription.status} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-dark-600" />
                      <span className="text-xs text-dark-500">{formatDate(prescription.created_at)}</span>
                    </div>
                    {prescription.extracted_data?.diagnosis && (
                      <p className="text-xs text-dark-500 mt-2 truncate">
                        {prescription.extracted_data.diagnosis}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
