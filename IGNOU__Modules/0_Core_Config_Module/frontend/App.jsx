
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login, ForgotPassword, ResetPassword, VerifyEmail } from '../../1_Authentication_Core_Security_Module/frontend/AuthPages';
import DashboardLayout from './DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import HomeRedirect from './HomeRedirect';

// Admin Pages
import AdminHome from './AdminHome';
import Students from '../../3_Student_Management_Module/frontend/Students';
import StudentResult from './StudentResult';
import Faculty from '../../5_Faculty_Management_Module/backend/Faculty';
import ManageCourses from '../../6_Academic_Course_Management_Module/frontend/ManageCourses';
import ManageTimetable from '../../7_Timetable_Schedule_Module/frontend/ManageTimetable';
import ManageNotices from '../../11_Communication_Notice_Board_Module/frontend/ManageNotices';
import ExamSchedule from '../../9_Examination_Marksheet_Module/frontend/ExamSchedule';
import Parents from '../../4_Parent_Tracking_Module/frontend/Parents';

import Fees from '../../10_Finance_Fee_Management_Module/frontend/Fees';
import Settings from '../../2_User_Settings_Management_Module/frontend/Settings';

// Faculty Pages
import FacultyDashboard from './FacultyDashboard';
import MyCourses from './MyCourses';
import Timetable from '../../7_Timetable_Schedule_Module/frontend/Timetable';
import AddMarks from '../../9_Examination_Marksheet_Module/frontend/AddMarks';
import FacultyStudentList from './StudentList';
import FacultyAttendance from '../../8_Attendance_Module/backend/Attendance';

// Student Pages
import StudentDashboard from './StudentDashboard';
import StudentMyCourses from './MyCourses';
import MyFees from './MyFees';
import Attendance from '../../8_Attendance_Module/backend/Attendance';
import Notices from './Notices';
import StudentTimetable from '../../7_Timetable_Schedule_Module/frontend/Timetable';
import MyExams from './MyExams';
import MyResults from './MyResults';
import Notifications from './Notifications';
import ParentDashboard from './ParentDashboard';
import ChildDetails from './ChildDetails';
import ParentFees from './ParentFees';
import ParentNotices from './ParentNotices';
import Maintenance from './Maintenance';

import ErrorBoundary from './ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
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
