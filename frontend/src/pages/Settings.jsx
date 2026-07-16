import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Server, WifiOff, HardDrive, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [offlineAi, setOfflineAi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setOfflineAi(response.data.use_offline_ai);
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (val) => {
    setOfflineAi(val);
    setSaving(true);
    try {
      await api.put('/settings', { use_offline_ai: val });
      toast.success(val ? 'Offline AI Enabled' : 'Cloud AI Enabled');
    } catch (err) {
      toast.error('Failed to update settings');
      setOfflineAi(!val);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
          <SettingsIcon className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-dark-400 text-sm">Configure AI pipelines and local integrations.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            AI Processing Mode
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-dark-600 bg-dark-800/50">
            <div className="flex-1">
              <h3 className="font-semibold text-white flex items-center gap-2">
                Offline AI Mode 
                {offlineAi && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>}
              </h3>
              <p className="text-dark-400 text-sm mt-1">
                When enabled, the system uses local Ollama models (Llama 3.3 for reasoning, LLaVA for vision). 
                Requires Ollama to be running on <code className="bg-dark-900 px-1 py-0.5 rounded text-xs text-primary-400">localhost:11434</code>. 
                Use this for maximum privacy or when offline.
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={offlineAi}
                onChange={(e) => handleToggle(e.target.checked)}
                disabled={saving}
              />
              <div className="w-14 h-7 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
             <div className={`p-4 rounded-xl border transition-colors ${!offlineAi ? 'bg-primary-500/5 border-primary-500/30' : 'bg-dark-800/30 border-dark-700'}`}>
                <WifiOff className={`w-5 h-5 mb-2 ${!offlineAi ? 'text-primary-400' : 'text-dark-500'}`} />
                <h4 className={`font-semibold ${!offlineAi ? 'text-white' : 'text-dark-300'}`}>Cloud Mode (Gemini)</h4>
                <p className="text-xs text-dark-500 mt-1">Uses Google Gemini 2.5 Flash API for blazing fast OCR and reasoning.</p>
             </div>
             <div className={`p-4 rounded-xl border transition-colors ${offlineAi ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-dark-800/30 border-dark-700'}`}>
                <HardDrive className={`w-5 h-5 mb-2 ${offlineAi ? 'text-emerald-400' : 'text-dark-500'}`} />
                <h4 className={`font-semibold ${offlineAi ? 'text-white' : 'text-dark-300'}`}>Local Mode (Ollama)</h4>
                <p className="text-xs text-dark-500 mt-1">Runs Llama 3.3 and LLaVA entirely on your own hardware.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
