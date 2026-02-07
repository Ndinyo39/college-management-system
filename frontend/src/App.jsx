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
                        <Route path="/students" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Students /></Layout></ProtectedRoute>} />
                        <Route path="/faculty" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Faculty /></Layout></ProtectedRoute>} />

                        {/* Shared Routes */}
                        <Route path="/courses" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><Layout><Courses /></Layout></ProtectedRoute>} />
                        <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><Layout><Attendance /></Layout></ProtectedRoute>} />
                        <Route path="/grades" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><Layout><Grades /></Layout></ProtectedRoute>} />
                        <Route path="/schedule" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><Layout><Schedule /></Layout></ProtectedRoute>} />
                        <Route path="/announcements" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><Layout><Announcements /></Layout></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Settings /></Layout></ProtectedRoute>} />

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
