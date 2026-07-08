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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="prescriptions" element={<PrescriptionList />} />
            <Route path="prescriptions/upload" element={<PrescriptionUpload />} />
            <Route path="prescriptions/:id" element={<PrescriptionDetail />} />
            <Route path="schedule" element={<MedicationSchedule />} />
            <Route path="history" element={<MedicalHistory />} />
            <Route path="assistant" element={<AIAssistant />} />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
