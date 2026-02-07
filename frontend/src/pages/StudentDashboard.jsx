import { useEffect, useState } from 'react';
import { BookOpen, Award, Clock, Zap, FileText, UserCheck, GraduationCap } from 'lucide-react';
import { coursesAPI, gradesAPI, announcementsAPI, attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        enrolledCourses: 0,
        avgGrade: 'A-',
        attendanceRate: '98%',
        credits: 12
    });
    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, announcementsRes] = await Promise.all([
                coursesAPI.getAll(),
                announcementsAPI.getAll()
            ]);

            // Demo logic: Sarah Johnson is in "Cosmetology"
            setStats({
                enrolledCourses: 1,
                avgGrade: '3.8 GPA',
                attendanceRate: '96%',
                credits: 15
            });

            setRecentAnnouncements(announcementsRes.data.slice(0, 3));
        } catch (error) {
            console.error('Error fetching student dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center font-black uppercase tracking-widest text-maroon">Loading Student Portal...</div>;

    const statsDisplay = [
        { title: 'My Courses', value: stats.enrolledCourses, icon: BookOpen },
        { title: 'GPA Score', value: stats.avgGrade, icon: Award },
        { title: 'Attendance', value: stats.attendanceRate, icon: UserCheck },
        { title: 'Credit Hours', value: stats.credits, icon: Clock },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Student Portal</h1>
                    <p className="text-sm text-gray-400 font-medium">Welcome back, {user?.email.split('@')[0]}</p>
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
                                </div>
                                <div className={`w-14 h-14 bg-maroon/5 rounded-2xl flex items-center justify-center`}>
                                    <Icon className="w-7 h-7 text-maroon" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Current Course View */}
                    <div className="bg-maroon p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-gold/20 transition-all duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-6 h-6 bg-gold/20 rounded flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-gold" />
                                </div>
                                <h2 className="text-xs font-black text-white/60 uppercase tracking-widest">Ongoing Curriculum</h2>
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-2">Cosmetology & Hair Styling</h3>
                                    <p className="text-sm text-white/50 font-medium">Instructor: Prof. Sarah Anderson • Room 101</p>
                                </div>
                                <button className="bg-gold text-maroon px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                                    Course Materials
                                </button>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-xs font-bold text-green-400 uppercase">Active</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Semester</p>
                                    <p className="text-xs font-bold text-white uppercase">4th Year</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Progress</p>
                                    <p className="text-xs font-bold text-white uppercase">85%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Student Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                <FileText className="w-6 h-6 text-blue-600 group-hover:text-white" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Grades</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                <Clock className="w-6 h-6 text-green-600 group-hover:text-white" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Absences</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                <Zap className="w-6 h-6 text-purple-600 group-hover:text-white" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Events</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-maroon/5 rounded-2xl flex items-center justify-center group-hover:bg-maroon transition-colors">
                                <GraduationCap className="w-6 h-6 text-maroon group-hover:text-white" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Library</span>
                        </button>
                    </div>
                </div>

                {/* Campus Announcements */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-8">Notice Board</h2>
                    <div className="space-y-6">
                        {recentAnnouncements.map(ann => (
                            <div key={ann.id} className="relative pl-6 border-l-2 border-maroon pb-6 last:pb-0">
                                <p className="text-[9px] font-black text-maroon uppercase tracking-widest mb-1">{ann.date}</p>
                                <h4 className="text-xs font-bold text-gray-800 mb-1">{ann.title}</h4>
                                <p className="text-[10px] text-gray-400 font-medium line-clamp-2">{ann.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
