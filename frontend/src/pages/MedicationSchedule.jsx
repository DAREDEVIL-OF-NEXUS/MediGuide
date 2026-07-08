import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Pill,
  Info,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { medications } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MedicationSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingId, setLoggingId] = useState(null);
  const [weekDays, setWeekDays] = useState([]);

  // Generate 7 days centered around selected date
  const generateWeekDays = (centerDate) => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      days.push(d);
    }
    setWeekDays(days);
  };

  useEffect(() => {
    generateWeekDays(selectedDate);
  }, [selectedDate]);

  const formatDateISO = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchSchedule = async (dateObj) => {
    try {
      setLoading(true);
      const isoStr = formatDateISO(dateObj);
      const response = await medications.getSchedule(isoStr);
      setScheduleItems(response.data || []);
    } catch (error) {
      console.error('Failed to load schedule:', error);
      toast.error('Failed to retrieve schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate]);

  const handleLogDose = async (scheduleId, status) => {
    setLoggingId(scheduleId);
    try {
      const isoStr = formatDateISO(selectedDate);
      const payload = {
        schedule_id: scheduleId,
        log_date: isoStr,
        status,
        actual_time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      };
      
      const response = await medications.logDose(payload);
      
      // Update local state
      setScheduleItems(prev =>
        prev.map(item =>
          item.id === scheduleId
            ? {
                ...item,
                log_id: response.data.id,
                log_status: response.data.status,
                actual_time: response.data.actual_time,
              }
            : item
        )
      );

      if (status === 'taken') {
        toast.success('Dose logged as taken! Keep it up. 👍');
      } else {
        toast.error('Dose logged as skipped.');
      }
    } catch (error) {
      console.error('Failed to log dose:', error);
      toast.error('Failed to log compliance.');
    } finally {
      setLoggingId(null);
    }
  };

  const changeSelectedDate = (offset) => {
    const newD = new Date(selectedDate);
    newD.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newD);
  };

  const isToday = (d) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  // Group items by time period for neat layout
  const getPeriod = (timeStr) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 20) return 'Evening';
    return 'Night';
  };

  const groupedItems = scheduleItems.reduce((acc, item) => {
    const period = getPeriod(item.scheduled_time);
    if (!acc[period]) acc[period] = [];
    acc[period].push(item);
    return acc;
  }, {});

  const order = ['Morning', 'Afternoon', 'Evening', 'Night'];

  // Stats calculation
  const totalDoses = scheduleItems.length;
  const takenDoses = scheduleItems.filter(i => i.log_status === 'taken').length;
  const skippedDoses = scheduleItems.filter(i => i.log_status === 'skipped').length;
  const complianceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  return (
    <div className="page-container max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Medication <span className="gradient-text">Schedule</span>
          </h1>
          <p className="text-dark-400 mt-1">
            Track daily dosing tasks and build your adherence streak.
          </p>
        </div>

        {/* Date navigation header */}
        <div className="flex items-center gap-2 bg-dark-900/60 border border-dark-700/50 rounded-xl p-1.5 backdrop-blur-sm self-stretch md:self-auto">
          <button
            onClick={() => changeSelectedDate(-1)}
            className="p-2 hover:bg-dark-800 text-dark-400 hover:text-white rounded-lg transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white px-3 font-mono">
            {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            onClick={() => changeSelectedDate(1)}
            className="p-2 hover:bg-dark-800 text-dark-400 hover:text-white rounded-lg transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Calendar ribbon */}
      <div className="glass-card p-4 mb-6">
        <div className="flex justify-between gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {weekDays.map((day, idx) => {
            const isSelected =
              day.getDate() === selectedDate.getDate() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear();
            const active = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`
                  flex-1 min-w-[50px] py-3 rounded-xl flex flex-col items-center gap-1.5 transition-all
                  ${isSelected
                    ? 'bg-gradient-to-br from-primary-500 to-teal-500 text-white shadow-lg shadow-primary-500/25 scale-[1.03]'
                    : active
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/30'
                  }
                `}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <span className="text-base font-bold font-mono">
                  {day.getDate()}
                </span>
                {active && !isSelected && (
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Stats and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Adherence ring progress (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-dark-300 mb-6 w-full text-left">
              Today's Progress
            </h3>

            {/* Circular Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-dark-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress bar */}
                <motion.circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-primary-500"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 58}
                  initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 58 - (2 * Math.PI * 58 * complianceRate) / 100
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white font-mono">{complianceRate}%</span>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Adherence</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-dark-700/50">
              <div className="text-center">
                <span className="block text-sm font-bold text-white font-mono">{totalDoses}</span>
                <span className="text-[10px] text-dark-500">Scheduled</span>
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-emerald-400 font-mono">{takenDoses}</span>
                <span className="text-[10px] text-dark-500">Taken</span>
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-rose-400 font-mono">{skippedDoses}</span>
                <span className="text-[10px] text-dark-500">Skipped</span>
              </div>
            </div>

            {complianceRate === 100 && totalDoses > 0 && (
              <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-xs font-semibold">
                <ThumbsUp className="w-4 h-4" /> Perfect day! Keep it up!
              </div>
            )}
          </div>
        </div>

        {/* Right column: Dosing Timeline (8 cols) */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="glass-card py-12 flex justify-center">
              <LoadingSpinner text="Fetching schedule..." />
            </div>
          ) : totalDoses === 0 ? (
            <div className="glass-card p-12 text-center border border-dashed border-dark-700">
              <Calendar className="w-12 h-12 text-dark-700 mx-auto mb-4" />
              <h3 className="text-base font-bold text-white mb-1">No medication scheduled</h3>
              <p className="text-sm text-dark-500 max-w-sm mx-auto">
                There are no active medication schedules for this date. Upload a prescription to automatically generate schedules.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {order.map((period) => {
                const items = groupedItems[period];
                if (!items || items.length === 0) return null;

                return (
                  <div key={period} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {period} Doses
                    </h3>

                    <div className="space-y-3">
                      {items.map((item, idx) => {
                        const isTaken = item.log_status === 'taken';
                        const isSkipped = item.log_status === 'skipped';
                        
                        return (
                          <div
                            key={item.id}
                            className={`
                              glass-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all
                              ${isTaken ? 'border-emerald-500/20 bg-emerald-500/2' : ''}
                              ${isSkipped ? 'border-rose-500/20 bg-rose-500/2' : ''}
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border
                                ${isTaken
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : isSkipped
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                  : 'bg-dark-800 border-dark-700/50 text-primary-400'
                                }
                              `}>
                                <Pill className="w-5 h-5" />
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-white text-sm md:text-base">
                                    {item.medicine_name}
                                  </h4>
                                  <span className="text-xs font-semibold text-dark-500 font-mono">
                                    {item.scheduled_time.slice(0, 5)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-1 text-xs text-dark-400">
                                  {item.dosage && (
                                    <span>Dosage: <strong className="text-dark-300 font-medium">{item.dosage}</strong></span>
                                  )}
                                  {item.timing && (
                                    <span>Timing: <strong className="text-dark-300 font-medium">{item.timing}</strong></span>
                                  )}
                                </div>

                                {item.instructions && (
                                  <div className="mt-2 text-[11px] text-primary-300/80 flex items-start gap-1">
                                    <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                    <span>{item.instructions}</span>
                                  </div>
                                )}

                                {isTaken && item.actual_time && (
                                  <p className="text-[10px] text-emerald-400 font-medium mt-1">
                                    Taken at {item.actual_time.slice(0, 5)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Compliance Actions */}
                            <div className="flex gap-2 w-full sm:w-auto self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-dark-700/50">
                              {loggingId === item.id ? (
                                <div className="text-xs text-dark-500 flex items-center gap-2 px-3 py-2">
                                  <span className="w-3.5 h-3.5 border-2 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
                                  <span>Saving...</span>
                                </div>
                              ) : isTaken || isSkipped ? (
                                <button
                                  onClick={() => handleLogDose(item.id, isTaken ? 'skipped' : 'taken')}
                                  className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-dark-700/50 hover:text-white"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>{isTaken ? 'Change to Skip' : 'Change to Take'}</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleLogDose(item.id, 'skipped')}
                                    className="flex-1 sm:flex-initial btn-secondary text-xs py-2 px-3.5 rounded-lg border border-dark-700/50 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-dark-300"
                                  >
                                    Skip
                                  </button>
                                  <button
                                    onClick={() => handleLogDose(item.id, 'taken')}
                                    className="flex-1 sm:flex-initial bg-gradient-to-r from-primary-500 to-teal-500 text-white text-xs font-semibold py-2 px-4 rounded-lg hover:shadow-md hover:shadow-primary-500/15"
                                  >
                                    Take
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
