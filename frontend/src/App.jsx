import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrescriptionUpload from './pages/PrescriptionUpload';
import PrescriptionList from './pages/PrescriptionList';
import PrescriptionDetail from './pages/PrescriptionDetail';
import MedicationSchedule from './pages/MedicationSchedule';
import MedicalHistory from './pages/MedicalHistory';
import AIAssistant from './pages/AIAssistant';
import MedicineLibrary from './pages/MedicineLibrary';
import Home from './pages/Home';
import About from './pages/About';
import Architecture from './pages/Architecture';
import Emergency from './pages/Emergency';
import MediTriage from './pages/MediTriage';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside App Shell Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="prescriptions" element={<PrescriptionList />} />
            <Route path="prescriptions/upload" element={<PrescriptionUpload />} />
            <Route path="prescriptions/:id" element={<PrescriptionDetail />} />
            <Route path="schedule" element={<MedicationSchedule />} />
            <Route path="history" element={<MedicalHistory />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="medicines" element={<MedicineLibrary />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="meditriage" element={<MediTriage />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
