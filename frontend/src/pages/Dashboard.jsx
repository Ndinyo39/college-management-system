import { useEffect, useState } from 'react';
import { Users, BookOpen, UserCheck, TrendingUp, Zap, UserPlus, FileText, DollarSign, GraduationCap } from 'lucide-react';
import { studentsAPI, coursesAPI, facultyAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        faculty: 0,
        attendance: 92.4
    });
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, coursesRes, facultyRes] = await Promise.all([
                studentsAPI.getAll(),
                coursesAPI.getAll(),
                facultyAPI.getAll()
            ]);
            setStudents(studentsRes.data);
            setCourses(coursesRes.data);
            setStats({
                students: studentsRes.data.length,
                courses: coursesRes.data.length,
                faculty: facultyRes.data.length,
                attendance: 92.4
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const statsDisplay = [
        { title: 'Total Students', value: stats.students.toLocaleString(), icon: Users, change: '+12%', trend: 'up' },
        { title: 'Active Courses', value: stats.courses.toLocaleString(), icon: BookOpen, change: '+2', trend: 'up' },
        { title: 'Faculty Members', value: stats.faculty.toLocaleString(), icon: UserCheck, change: '0%', trend: 'up' },
        { title: 'Avg Attendance', value: `${stats.attendance}%`, icon: TrendingUp, change: '-0.4%', trend: 'down' },
    ];

    const chartData = courses.map(course => ({
        name: course.name.split(' ')[0],
        enrolled: course.enrolled,
        capacity: course.capacity
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Campus Overview</h1>
                    <p className="text-sm text-gray-400 font-medium">Strategic Operations & Management Centre</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsDisplay.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
                                    <p className="text-3xl font-black text-gray-800">{stat.value}</p>
                                    <p className={`text-[10px] font-bold mt-2 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                        {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-maroon/5 rounded-2xl flex items-center justify-center group-hover:bg-[#800000] transition-colors">
                                    <Icon className="w-7 h-7 text-[#800000] group-hover:text-[#FFD700] transition-colors" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-6 h-6 bg-[#FFD700]/20 rounded flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#FFD700]" />
                    </div>
                    <h2 className="text-xs font-black text-gray-800 uppercase tracking-widest">Global Directives</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => navigate('/students')} className="flex items-center justify-center gap-3 bg-[#800000] text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#600000] transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                        <UserPlus className="w-4 h-4 text-[#FFD700]" /> Register Student
                    </button>
                    <button onClick={() => navigate('/faculty')} className="flex items-center justify-center gap-3 bg-[#FFD700] text-[#800000] px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#E5C100] transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                        <UserPlus className="w-4 h-4" /> Recruit Faculty
                    </button>
                    <button onClick={() => window.print()} className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                        <FileText className="w-4 h-4 text-blue-200" /> Export Analytics
                    </button>
                    <button onClick={() => alert('Treasury Hub: Financial records coming soon!')} className="flex items-center justify-center gap-3 bg-green-600 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-700 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                        <DollarSign className="w-4 h-4 text-green-200" /> Treasury Hub
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Enrollment Performance</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} font-weight="900" tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} font-weight="900" tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="enrolled" fill="#800000" radius={[10, 10, 0, 0]} barSize={45} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center group">
                        <div className="w-16 h-16 bg-maroon/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-maroon transition-colors duration-500">
                            <GraduationCap className="w-8 h-8 text-maroon group-hover:text-gold transition-colors" />
                        </div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-2">Student Management</h3>
                        <p className="text-xs text-gray-400 mb-6 font-medium">Browse, search, and manage student records</p>
                        <button onClick={() => navigate('/students')} className="text-[10px] font-black uppercase tracking-widest text-maroon border-b-2 border-gold pb-1 hover:text-gold transition-colors">View Students →</button>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center group">
                        <div className="w-16 h-16 bg-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-gold transition-colors duration-500">
                            <Users className="w-8 h-8 text-gold group-hover:text-maroon transition-colors" />
                        </div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-2">Staff Management</h3>
                        <p className="text-xs text-gray-400 mb-6 font-medium">Manage faculty and administrative staff</p>
                        <button onClick={() => navigate('/faculty')} className="text-[10px] font-black uppercase tracking-widest text-maroon border-b-2 border-gold pb-1 hover:text-gold transition-colors">View Staff →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();

    if (user?.role === 'teacher') return <TeacherDashboard />;
    if (user?.role === 'student') return <StudentDashboard />;
    return <AdminDashboard />;
}
