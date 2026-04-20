import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const AppLayout = React.lazy(() => import('./components/layout/AppLayout'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Admin Pages
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const ExamManagement = React.lazy(() => import('./pages/admin/ExamManagement'));
const QuestionBank = React.lazy(() => import('./pages/shared/QuestionBank'));
const ResultRecap = React.lazy(() => import('./pages/shared/ResultRecap'));
const AttendanceRecap = React.lazy(() => import('./pages/shared/AttendanceRecap'));

// Siswa Pages
const ExamList = React.lazy(() => import('./pages/siswa/ExamList'));
const ExamTake = React.lazy(() => import('./pages/siswa/ExamTake'));
const ExamResult = React.lazy(() => import('./pages/siswa/ExamResult'));
const ExamDetailResult = React.lazy(() => import('./pages/siswa/ExamDetailResult'));
const Attendance = React.lazy(() => import('./pages/siswa/Attendance'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Private App Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* Admin & Guru shared */}
              <Route path="question-bank" element={
                <ProtectedRoute allowedRoles={['admin', 'guru']}>
                  <QuestionBank />
                </ProtectedRoute>
              } />
              
              <Route path="exam-management" element={
                <ProtectedRoute allowedRoles={['admin', 'guru']}>
                  <ExamManagement />
                </ProtectedRoute>
              } />

              <Route path="results" element={
                <ProtectedRoute allowedRoles={['admin', 'guru']}>
                  <ResultRecap />
                </ProtectedRoute>
              } />
              
              <Route path="attendance-recap" element={
                <ProtectedRoute allowedRoles={['admin', 'guru']}>
                  <AttendanceRecap />
                </ProtectedRoute>
              } />

              {/* Admin specific */}
              <Route path="users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />

              {/* Siswa specific */}
              <Route path="attendance" element={
                <ProtectedRoute allowedRoles={['siswa']}>
                  <Attendance />
                </ProtectedRoute>
              } />
              <Route path="exams" element={
                <ProtectedRoute allowedRoles={['siswa']}>
                  <ExamList />
                </ProtectedRoute>
              } />
              <Route path="exam-results" element={
                <ProtectedRoute allowedRoles={['siswa']}>
                  <ExamResult />
                </ProtectedRoute>
              } />
              <Route path="exam-results/:attemptId" element={
                <ProtectedRoute allowedRoles={['siswa']}>
                  <ExamDetailResult />
                </ProtectedRoute>
              } />
            </Route>

            {/* Special Route: Taking Exam (No Sidebar) */}
            <Route path="/take-exam/:examId" element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <ExamTake />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </AuthProvider>
    </Router>
  );
}
