
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import DashboardLayout from './layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import HomeRedirect from './routes/HomeRedirect';

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import Students from './pages/admin/Students';
import StudentResult from './pages/admin/StudentResult';
import Faculty from './pages/admin/Faculty';
import ManageCourses from './pages/admin/ManageCourses';
import ManageTimetable from './pages/admin/ManageTimetable';
import ManageNotices from './pages/admin/ManageNotices';
import ExamSchedule from './pages/admin/ExamSchedule';
import Parents from './pages/admin/Parents';

import Fees from './pages/admin/Fees';
import Settings from './pages/admin/Settings';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MyCourses from './pages/faculty/MyCourses';
import Timetable from './pages/faculty/Timetable';
import AddMarks from './pages/faculty/AddMarks';
import FacultyStudentList from './pages/faculty/StudentList';
import FacultyAttendance from './pages/faculty/Attendance';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMyCourses from './pages/student/MyCourses';
import MyFees from './pages/student/MyFees';
import Attendance from './pages/student/Attendance';
import Notices from './pages/student/Notices';
import StudentTimetable from './pages/student/Timetable';
import MyExams from './pages/student/MyExams';
import MyResults from './pages/student/MyResults';
import Notifications from './pages/common/Notifications';
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildDetails from './pages/parent/ChildDetails';
import ParentFees from './pages/parent/ParentFees';
import ParentNotices from './pages/parent/ParentNotices';
import Maintenance from './pages/Maintenance';

import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/maintenance" element={<Maintenance />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Redirect root to appropriate dashboard handled by HomeRedirect */}
          <Route index element={<HomeRedirect />} />

          {/* Common Routes */}
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="admin">
            <Route index element={<ProtectedRoute allowedRoles={['admin']}><AdminHome /></ProtectedRoute>} />
            <Route path="students" element={<ProtectedRoute allowedRoles={['admin']}><Students /></ProtectedRoute>} />
            <Route path="results" element={<ProtectedRoute allowedRoles={['admin']}><StudentResult /></ProtectedRoute>} />
            <Route path="courses" element={<ProtectedRoute allowedRoles={['admin']}><ManageCourses /></ProtectedRoute>} />
            <Route path="timetable" element={<ProtectedRoute allowedRoles={['admin']}><ManageTimetable /></ProtectedRoute>} />
            <Route path="notices" element={<ProtectedRoute allowedRoles={['admin']}><ManageNotices /></ProtectedRoute>} />
            <Route path="exams" element={<ProtectedRoute allowedRoles={['admin']}><ExamSchedule /></ProtectedRoute>} />
            <Route path="parents" element={<ProtectedRoute allowedRoles={['admin']}><Parents /></ProtectedRoute>} />
            <Route path="faculty" element={<ProtectedRoute allowedRoles={['admin']}><Faculty /></ProtectedRoute>} />
            <Route path="fees" element={<ProtectedRoute allowedRoles={['admin']}><Fees /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
          </Route>

          {/* Faculty Routes */}
          <Route path="faculty">
            <Route index element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="courses" element={<ProtectedRoute allowedRoles={['faculty']}><MyCourses /></ProtectedRoute>} />
            <Route path="timetable" element={<ProtectedRoute allowedRoles={['faculty']}><Timetable /></ProtectedRoute>} />
            <Route path="directory" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyStudentList /></ProtectedRoute>} />
            <Route path="marks" element={<ProtectedRoute allowedRoles={['faculty']}><AddMarks /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyAttendance /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['faculty']}><Settings /></ProtectedRoute>} />
          </Route>

          {/* Student Routes */}
          <Route path="student">
            <Route index element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="courses" element={<ProtectedRoute allowedRoles={['student']}><StudentMyCourses /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute allowedRoles={['student']}><Attendance /></ProtectedRoute>} />
            <Route path="timetable" element={<ProtectedRoute allowedRoles={['student']}><StudentTimetable /></ProtectedRoute>} />
            <Route path="fees" element={<ProtectedRoute allowedRoles={['student']}><MyFees /></ProtectedRoute>} />
            <Route path="exams" element={<ProtectedRoute allowedRoles={['student']}><MyExams /></ProtectedRoute>} />
            <Route path="results" element={<ProtectedRoute allowedRoles={['student']}><MyResults /></ProtectedRoute>} />
            <Route path="notices" element={<ProtectedRoute allowedRoles={['student']}><Notices /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['student']}><Settings /></ProtectedRoute>} />
          </Route>

          {/* Parent Routes */}
          <Route path="parent">
            <Route index element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
            <Route path="child/:id" element={<ProtectedRoute allowedRoles={['parent']}><ChildDetails /></ProtectedRoute>} />
            <Route path="fees" element={<ProtectedRoute allowedRoles={['parent']}><ParentFees /></ProtectedRoute>} />
            <Route path="notices" element={<ProtectedRoute allowedRoles={['parent']}><ParentNotices /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['parent']}><Settings /></ProtectedRoute>} />
          </Route>
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
