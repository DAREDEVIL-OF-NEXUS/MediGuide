import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, Image, X, AlertCircle, CheckCircle, Loader2, StickyNote, ArrowRight, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { prescriptions } from '../services/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export default function PrescriptionUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Verification State
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Invalid file or too large. Max 10MB JPEG/PNG/WebP.');
      return;
    }
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    noClick: !!file,
    noKeyboard: !!file,
  });

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    setVerificationData(null);
    setPrescriptionId(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (notes.trim()) formData.append('notes', notes.trim());

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 300);

      const response = await prescriptions.upload(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Extracted successfully! Please verify.');
      
      const pId = response.data.id;
      setPrescriptionId(pId);
      
      // Load raw_extraction / validated_data to verify
      const rawExt = response.data.validated_data || response.data.raw_extraction || { medicines: [] };
      setVerificationData(rawExt);
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleVerifySubmit = async () => {
    setVerifying(true);
    try {
      await prescriptions.verify(prescriptionId, verificationData);
      toast.success('Prescription verified and saved!');
      navigate(`/prescriptions/${prescriptionId}`);
    } catch (error) {
      toast.error('Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const updateMedicine = (index, field, value) => {
    const updatedMeds = [...verificationData.medicines];
    updatedMeds[index] = { ...updatedMeds[index], [field]: value };
    setVerificationData({ ...verificationData, medicines: updatedMeds });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Upload <span className="gradient-text">Prescription</span>
          </h1>
          <p className="text-dark-400">
            Take a photo. AI suggests, you confirm. We will automatically generate a schedule for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload / Image Area */}
          <div className="glass-card overflow-hidden">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div
                      {...getRootProps()}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                        ${isDragActive ? 'border-primary-500 bg-primary-500/5' : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/30'}
                      `}
                    >
                      <input {...getInputProps()} />
                      <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragActive ? 'text-primary-400' : 'text-dark-500'}`} />
                      <p className="font-medium text-dark-200 mb-2">Drag & drop your prescription</p>
                      <p className="text-sm text-dark-500">Max 10MB JPEG, PNG, WebP</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="relative rounded-xl overflow-hidden bg-dark-900 border border-dark-700/50 mb-4">
                      <img src={preview} alt="Preview" className="w-full max-h-[500px] object-contain" />
                      {!uploading && !verificationData && (
                        <button onClick={removeFile} className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 text-white hover:bg-black/80">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {!verificationData && (
                      <div className="flex gap-3 mt-4">
                        <button onClick={removeFile} className="btn-secondary flex-1" disabled={uploading}>Cancel</button>
                        <button onClick={handleUpload} disabled={uploading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                          {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Extracting AI...</> : <><Activity className="w-5 h-5"/> Analyze Prescription</>}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Verification Area */}
          <div>
            {verificationData ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 h-full flex flex-col">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400" /> Verify Details
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {verificationData.medicines?.map((med, i) => (
                    <div key={i} className="p-4 bg-dark-800/50 rounded-xl border border-dark-700/50">
                      <label className="block text-xs font-medium text-dark-400 mb-1">Medicine Name</label>
                      <input 
                        type="text" className="input-field mb-3" value={med.medicine_name || ''} 
                        onChange={(e) => updateMedicine(i, 'medicine_name', e.target.value)} 
                      />
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-dark-400 mb-1">Dosage</label>
                          <input 
                            type="text" className="input-field" value={med.dosage || ''} 
                            onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-dark-400 mb-1">Frequency</label>
                          <input 
                            type="text" className="input-field" value={med.frequency || ''} 
                            onChange={(e) => updateMedicine(i, 'frequency', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-dark-400 mb-1">Timing</label>
                          <input 
                            type="text" className="input-field" value={med.timing || ''} 
                            onChange={(e) => updateMedicine(i, 'timing', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-dark-400 mb-1">Duration (days)</label>
                          <input 
                            type="number" className="input-field" value={med.duration_days || ''} 
                            onChange={(e) => updateMedicine(i, 'duration_days', parseInt(e.target.value) || 0)} 
                          />
                        </div>
                      </div>
                      
                      <label className="block text-xs font-medium text-dark-400 mb-1">Special Instructions</label>
                      <input 
                        type="text" className="input-field text-sm" value={med.special_instructions || ''} 
                        onChange={(e) => updateMedicine(i, 'special_instructions', e.target.value)} 
                      />
                    </div>
                  ))}
                  {(!verificationData.medicines || verificationData.medicines.length === 0) && (
                    <p className="text-rose-400 text-sm">No medicines found. Please try a clearer image.</p>
                  )}
                </div>
                <div className="pt-6 mt-4 border-t border-dark-700/50">
                  <button onClick={handleVerifySubmit} disabled={verifying} className="btn-primary w-full flex justify-center items-center gap-2">
                    {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5"/> Confirm & Save</>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center">
                <AlertCircle className="w-12 h-12 text-dark-600 mb-4" />
                <h3 className="text-lg font-medium text-dark-400 mb-2">Awaiting AI Extraction</h3>
                <p className="text-sm text-dark-500 max-w-xs">Upload your prescription and wait for the AI to extract details. You will be able to review and correct any errors before saving.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
