// Main App component with routing configuration for authentication and dashboard pages

import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignupForm from './pages/SignupFormMentor'
import LoginPage from './pages/LoginPage'
import MentorDashboard from './pages/MentorDashboard'
import MenteeDashboard from './pages/MenteeDashboard'
import RoleRoute from './components/RoleRoute'
import GoogleOnboarding from './components/GoogleOnboarding'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import Classroom from './pages/Classroom'
import ClassroomDetail from './pages/ClassroomDetail'
import SharedDrive from './pages/SharedDrive'
import PublicProfile from './pages/PublicProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/google-onboarding" element={<GoogleOnboarding />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard/mentor"
          element={
            <RoleRoute requiredRole="Mentor">
              <MentorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/mentee"
          element={
            <RoleRoute requiredRole="Mentee">
              <MenteeDashboard />
            </RoleRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route
          path="/classroom/mentor"
          element={
            <RoleRoute requiredRole="Mentor">
              <Classroom />
            </RoleRoute>
          }
        />
        <Route
          path="/classroom/mentee"
          element={
            <RoleRoute requiredRole="Mentee">
              <Classroom />
            </RoleRoute>
          }
        />
        <Route path="/classroom" element={<Navigate to="/login" replace />} />
        <Route
          path="/classroom/mentor/detail"
          element={
            <RoleRoute requiredRole="Mentor">
              <ClassroomDetail />
            </RoleRoute>
          }
        />
        <Route
          path="/classroom/mentee/detail"
          element={
            <RoleRoute requiredRole="Mentee">
              <ClassroomDetail />
            </RoleRoute>
          }
        />
        <Route
          path="/shared-drive"
          element={
            <RoleRoute requiredRole={['Mentor', 'Mentee']}>
              <SharedDrive />
            </RoleRoute>
          }
        />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
