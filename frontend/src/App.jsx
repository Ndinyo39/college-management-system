import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Courses from './pages/Courses';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Schedule from './pages/Schedule';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import Users from './pages/Users';
import AcademicReports from './pages/AcademicReports';
import ActivityReports from './pages/ActivityReports';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-maroon flex items-center justify-center text-white font-black tracking-widest uppercase">Initializing...</div>;

    if (!user) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

                        {/* Admin Only Routes */}
                        <Route path="/students" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><Layout><Students /></Layout></ProtectedRoute>} />
                        <Route path="/faculty" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><Layout><Faculty /></Layout></ProtectedRoute>} />

                        {/* Shared Routes */}
                        <Route path="/courses" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'superadmin']}><Layout><Courses /></Layout></ProtectedRoute>} />
                        <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'superadmin']}><Layout><Attendance /></Layout></ProtectedRoute>} />
                        <Route path="/grades" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'superadmin']}><Layout><Grades /></Layout></ProtectedRoute>} />
                        <Route path="/schedule" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'superadmin']}><Layout><Schedule /></Layout></ProtectedRoute>} />
                        <Route path="/announcements" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'superadmin']}><Layout><Announcements /></Layout></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><Layout><Settings /></Layout></ProtectedRoute>} />
                        <Route path="/users" element={<ProtectedRoute allowedRoles={['superadmin']}><Layout><Users /></Layout></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute allowedRoles={['teacher', 'admin', 'superadmin']}><Layout><AcademicReports /></Layout></ProtectedRoute>} />
                        <Route path="/activity-reports" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><Layout><ActivityReports /></Layout></ProtectedRoute>} />

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
