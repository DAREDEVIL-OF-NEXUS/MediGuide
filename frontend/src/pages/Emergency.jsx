import { Activity, PhoneCall, Globe, MapPin, AlertCircle, HeartPulse, Stethoscope, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Emergency() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 p-6 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit text-rose-400">
            <HeartPulse className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">Emergency & Healthcare Access</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Quick <span className="text-rose-400">Assistance</span>
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl">
            Access government portals, online consultations, and emergency contacts. Note: This platform does not support direct ambulance dispatch. Please call local emergency services for life-threatening situations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* External Portals */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-400" />
              Government & Consultation Portals
            </h2>

            <a href="https://ors.gov.in" target="_blank" rel="noreferrer" className="block p-6 glass-card border border-dark-700/50 hover:border-primary-500/40 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">ORS Portal (Gov. of India)</h3>
              <p className="text-sm text-dark-400 leading-relaxed">
                Online Registration System for government hospital OPD appointments, lab reports, and blood availability.
              </p>
            </a>

            <a href="https://esanjeevani.mohfw.gov.in" target="_blank" rel="noreferrer" className="block p-6 glass-card border border-dark-700/50 hover:border-teal-500/40 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
                  <Activity className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-teal-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">eSanjeevani OPD</h3>
              <p className="text-sm text-dark-400 leading-relaxed">
                National Telemedicine Service of India. Consult with doctors online from the comfort of your home.
              </p>
            </a>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Emergency Contacts
            </h2>

            <div className="p-6 glass-card border border-rose-500/20 bg-rose-500/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">National Emergency</h3>
                  <p className="text-sm text-rose-400/80">Available 24/7 in India</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-dark-900 border border-dark-700 text-center">
                  <div className="text-2xl font-bold text-white mb-1">112</div>
                  <div className="text-xs text-dark-400 uppercase tracking-wider">All Emergencies</div>
                </div>
                <div className="p-4 rounded-xl bg-dark-900 border border-dark-700 text-center">
                  <div className="text-2xl font-bold text-white mb-1">108</div>
                  <div className="text-xs text-dark-400 uppercase tracking-wider">Ambulance</div>
                </div>
              </div>
            </div>

            <div className="p-6 glass-card border border-dark-700/50">
              <div className="flex items-start gap-4 mb-4">
                <MapPin className="w-6 h-6 text-indigo-400 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Nearby Hospitals</h3>
                  <p className="text-sm text-dark-400 mb-4">
                    Quickly find emergency rooms and clinics near your current location via Google Maps.
                  </p>
                  <a 
                    href="https://www.google.com/maps/search/Hospitals+near+me" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors font-medium text-sm"
                  >
                    Open Map Search
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
