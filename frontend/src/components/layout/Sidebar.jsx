import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    UserCheck,
    GraduationCap,
    ClipboardList,
    Calendar,
    Megaphone,
    Settings as SettingsIcon,
    Shield,
    FileText,
    BarChart3,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'superadmin'] },
    { name: 'User Management', path: '/users', icon: Shield, roles: ['superadmin'] },
    { name: 'Students', path: '/students', icon: Users, roles: ['admin', 'superadmin'] },
    { name: 'Courses', path: '/courses', icon: BookOpen, roles: ['admin', 'teacher', 'student', 'superadmin'] },
    { name: 'Faculty', path: '/faculty', icon: UserCheck, roles: ['admin', 'superadmin'] },
    { name: 'Attendance', path: '/attendance', icon: ClipboardList, roles: ['admin', 'teacher', 'student', 'superadmin'] },
    { name: 'Grades', path: '/grades', icon: GraduationCap, roles: ['admin', 'teacher', 'student', 'superadmin'] },
    { name: 'Schedule', path: '/schedule', icon: Calendar, roles: ['admin', 'teacher', 'student', 'superadmin'] },
    { name: 'Academic Reports', path: '/reports', icon: FileText, roles: ['admin', 'teacher', 'superadmin', 'student'] },
    { name: 'Activity Reports', path: '/activity-reports', icon: BarChart3, roles: ['admin', 'superadmin'] },
    { name: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['admin', 'teacher', 'student', 'superadmin'] },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['admin', 'superadmin'] },
];

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const { user } = useAuth();
    const userRole = user?.role || 'student';

    const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-maroon/20 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-[60] transition-transform duration-300 ease-in-out transform 
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                <div className="px-6 py-6 border-b border-gray-50 mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                            <img src="/logo.jpg" alt="Beautex Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-black text-maroon uppercase tracking-widest">Beautex TTC</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-maroon transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 overflow-y-auto">
                    <ul className="space-y-1">
                        {filteredNavigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                            ? 'bg-[#FFD700] text-[#800000] font-black shadow-lg translate-x-1'
                                            : 'text-gray-400 hover:text-[#800000] hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#800000]' : ''}`} />
                                        <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Profile Mini */}
                <div className="p-4 bg-gray-50/50">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-9 h-9 bg-maroon/10 text-maroon font-black rounded-full flex items-center justify-center text-xs">
                            {(user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-800 truncate">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                            <p className="text-[10px] text-gray-400 truncate uppercase tracking-widest font-black">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
