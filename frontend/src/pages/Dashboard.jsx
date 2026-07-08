import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Pill,
  CalendarCheck,
  TrendingUp,
  Upload,
  ArrowRight,
  Clock,
  Bot,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { prescriptions as prescriptionsApi, medications as medicationsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function StatCard({ icon: Icon, label, value, color, delay }) {
  const colorMap = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400',
  };

  return (
    <motion.div variants={itemVariants} className="glass-card p-5 md:p-6">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} border flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-dark-400 mt-1">{label}</p>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const config = {
    completed: { class: 'badge-success', label: 'Completed' },
    processing: { class: 'badge-info', label: 'Processing' },
    failed: { class: 'badge-error', label: 'Failed' },
    pending: { class: 'badge-pending', label: 'Pending' },
  };

  const { class: className, label } = config[status] || config.pending;
  return <span className={className}>{label}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    activeMeds: 0,
    todayDoses: 0,
    adherence: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayISO = `${year}-${month}-${day}`;

        // Concurrent fetching of prescriptions, today's schedule and adherence stats
        const [prescRes, scheduleRes, adherenceRes] = await Promise.all([
          prescriptionsApi.list({ limit: 5 }),
          medicationsApi.getSchedule(todayISO).catch((err) => {
            console.error('Failed to fetch schedule:', err);
            return { data: [] };
          }),
          medicationsApi.getAdherence().catch((err) => {
            console.error('Failed to fetch adherence:', err);
            return { data: { adherence_rate: 0 } };
          }),
        ]);

        const prescriptions = prescRes.data.items || prescRes.data || [];
        setRecentPrescriptions(prescriptions);

        const total = prescRes.data.total || prescriptions.length;

        // Count active medicines from completed prescriptions
        let activeMeds = 0;
        prescriptions.forEach((p) => {
          if (p.status === 'completed' && p.extracted_data?.medicines) {
            activeMeds += p.extracted_data.medicines.length;
          }
        });

        // Set schedules list
        const scheduleData = scheduleRes.data || [];
        setTodaySchedule(scheduleData);

        const realAdherence = adherenceRes.data?.adherence_rate ?? 0;

        setStats({
          total,
          activeMeds,
          todayDoses: scheduleData.length,
          adherence: realAdherence,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  // Get the next 3 upcoming unlogged doses for today
  const upcomingDoses = todaySchedule
    .filter((d) => !d.log_status || d.log_status === 'pending')
    .slice(0, 3);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {greeting()}, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-dark-400 mt-1">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={FileText} label="Total Prescriptions" value={stats.total} color="emerald" />
          <StatCard icon={Pill} label="Active Medications" value={stats.activeMeds} color="cyan" />
          <StatCard icon={CalendarCheck} label="Today's Doses" value={stats.todayDoses} color="amber" />
          <StatCard icon={TrendingUp} label="Adherence Rate" value={`${stats.adherence}%`} color="violet" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Prescriptions */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-dark-700/50">
                <h2 className="text-lg font-semibold text-white">Recent Prescriptions</h2>
                <Link
                  to="/prescriptions"
                  className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recentPrescriptions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-dark-800/50 border border-dark-700/50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-dark-600" />
                  </div>
                  <p className="text-dark-400 mb-4">No prescriptions yet</p>
                  <Link to="/prescriptions/upload" className="btn-primary inline-flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4" />
                    Upload your first
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-dark-700/30">
                  {recentPrescriptions.map((prescription, i) => (
                    <Link
                      key={prescription.id}
                      to={`/prescriptions/${prescription.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-dark-800/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-700/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {prescription.image_url ? (
                          <img
                            src={prescription.image_url}
                            alt="Prescription"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-dark-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-200 truncate group-hover:text-white transition-colors">
                          {prescription.extracted_data?.doctor_info?.name
                            ? `Dr. ${prescription.extracted_data.doctor_info.name}`
                            : `Prescription #${prescription.id?.slice(-6) || i + 1}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-dark-600" />
                          <p className="text-xs text-dark-500">
                            {formatDate(prescription.created_at)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={prescription.status} />
                      <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-dark-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Today's Schedule Preview */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CalendarCheck className="w-4.5 h-4.5 text-primary-400" />
                  Upcoming Doses
                </h3>
                <Link
                  to="/schedule"
                  className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  View Full
                </Link>
              </div>

              {upcomingDoses.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-dark-700/30 rounded-xl bg-dark-900/10">
                  <p className="text-sm text-dark-500">No upcoming doses today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDoses.map((dose) => (
                    <div
                      key={dose.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-dark-800/20 border border-dark-700/40 hover:bg-dark-800/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                          <Clock className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-dark-200 truncate">{dose.medicine_name}</p>
                          <p className="text-xs text-dark-500 truncate">{dose.dosage || '1 dose'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-dark-300 bg-dark-700/50 px-2 py-0.5 rounded-lg flex-shrink-0">
                        {formatTime(dose.scheduled_time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-5">
              <h3 className="text-base font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/prescriptions/upload"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-teal-500/10 border border-primary-500/20 hover:border-primary-500/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors">
                      Upload Prescription
                    </p>
                    <p className="text-xs text-dark-500">Scan & extract data</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-dark-600 group-hover:text-primary-400 transition-colors" />
                </Link>

                <Link
                  to="/prescriptions"
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30 border border-dark-700/50 hover:border-dark-600 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-dark-700/50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-dark-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors">
                      View All Prescriptions
                    </p>
                    <p className="text-xs text-dark-500">Manage & review</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-dark-600 group-hover:text-dark-400 transition-colors" />
                </Link>
              </div>
            </div>

            {/* AI Assistant Card */}
            <Link
              to="/assistant"
              className="glass-card p-5 relative overflow-hidden block transition-all hover:border-cyan-500/40 group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">AI Assistant</h3>
                      <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">Live & Active</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <p className="text-sm text-dark-400 leading-relaxed">
                  Ask about side effects, safety warnings, and get personalized advice regarding your active prescriptions.
                </p>
                <div className="flex items-center gap-1.5 mt-4">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <p className="text-xs text-dark-500 font-medium">Powered by Gemini AI</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
