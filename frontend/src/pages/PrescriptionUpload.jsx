import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Camera,
  Image,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  StickyNote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { prescriptions } from '../services/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 10MB.');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload JPEG, PNG, or WebP.');
      } else {
        toast.error('Invalid file. Please try another.');
      }
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
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
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a prescription image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      const response = await prescriptions.upload(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Prescription uploaded successfully!');

      setTimeout(() => {
        const prescriptionId = response.data.id;
        if (prescriptionId) {
          navigate(`/prescriptions/${prescriptionId}`);
        } else {
          navigate('/prescriptions');
        }
      }, 500);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Upload failed. Please try again.';
      toast.error(msg);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Upload <span className="gradient-text">Prescription</span>
          </h1>
          <p className="text-dark-400">
            Take a photo or upload an image of your prescription. Our AI will extract all the details.
          </p>
        </div>

        {/* Upload Area */}
        <div className="glass-card overflow-hidden">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    {...getRootProps()}
                    className={`
                      relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer
                      transition-all duration-300
                      ${isDragActive
                        ? 'border-primary-500 bg-primary-500/5'
                        : 'border-dark-600/50 hover:border-dark-500 hover:bg-dark-800/30'
                      }
                    `}
                  >
                    <input {...getInputProps()} />

                    <div className={`
                      w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-300
                      ${isDragActive
                        ? 'bg-primary-500/20 border border-primary-500/30'
                        : 'bg-dark-800/50 border border-dark-700/50'
                      }
                    `}>
                      <Upload className={`w-7 h-7 ${isDragActive ? 'text-primary-400' : 'text-dark-500'}`} />
                    </div>

                    <p className="text-base font-medium text-dark-200 mb-2">
                      {isDragActive ? 'Drop your prescription here' : 'Drag & drop your prescription'}
                    </p>
                    <p className="text-sm text-dark-500 mb-6">or click to browse files</p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <span className="text-xs text-dark-600 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700/50">
                        JPEG
                      </span>
                      <span className="text-xs text-dark-600 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700/50">
                        PNG
                      </span>
                      <span className="text-xs text-dark-600 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700/50">
                        WebP
                      </span>
                      <span className="text-xs text-dark-600">
                        Max 10MB
                      </span>
                    </div>
                  </div>

                  {/* Mobile camera button */}
                  <div className="mt-4 sm:hidden">
                    <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
                      <Camera className="w-5 h-5" />
                      Take Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onDrop([f], []);
                        }}
                      />
                    </label>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {/* Image Preview */}
                  <div className="relative rounded-xl overflow-hidden bg-dark-900 border border-dark-700/50 mb-4">
                    <img
                      src={preview}
                      alt="Prescription preview"
                      className="w-full max-h-96 object-contain"
                    />
                    {!uploading && (
                      <button
                        onClick={removeFile}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-dark-900/80 backdrop-blur-sm text-dark-300 hover:text-white hover:bg-dark-900 transition-all border border-dark-700/50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30 border border-dark-700/30 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Image className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-200 truncate">{file.name}</p>
                      <p className="text-xs text-dark-500">{formatFileSize(file.size)}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  </div>

                  {/* Notes field */}
                  <div className="mb-6">
                    <label className="label flex items-center gap-2">
                      <StickyNote className="w-3.5 h-3.5" />
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field resize-none h-24"
                      placeholder="Add any notes about this prescription..."
                      disabled={uploading}
                    />
                  </div>

                  {/* Upload progress */}
                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                          <span className="text-sm text-dark-300 font-medium">
                            {uploadProgress < 90
                              ? 'Uploading prescription...'
                              : uploadProgress < 100
                              ? 'Processing with AI...'
                              : 'Complete!'}
                          </span>
                        </div>
                        <span className="text-sm text-dark-400 font-mono">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary-500 to-teal-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {!uploading && (
                      <button onClick={removeFile} className="btn-secondary flex-1">
                        Change Image
                      </button>
                    )}
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload & Extract
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-5 rounded-2xl bg-dark-800/20 border border-dark-700/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-dark-300 mb-2">Tips for best results</p>
              <ul className="space-y-1">
                <li className="text-xs text-dark-500 flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  Ensure the prescription is well-lit and clearly readable
                </li>
                <li className="text-xs text-dark-500 flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  Include the entire prescription in the frame
                </li>
                <li className="text-xs text-dark-500 flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  Avoid shadows and reflections on the paper
                </li>
                <li className="text-xs text-dark-500 flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  Use landscape orientation for wider prescriptions
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
