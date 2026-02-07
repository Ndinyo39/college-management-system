import { useEffect, useState } from 'react';
import { Users, BookOpen, Clock, Zap, FileText, ClipboardCheck, GraduationCap } from 'lucide-react';
import { coursesAPI, studentsAPI, announcementsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [myCourses, setMyCourses] = useState([]);
    const [studentsCount, setStudentsCount] = useState(0);
    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, studentsRes, announcementsRes] = await Promise.all([
                coursesAPI.getAll(),
                studentsAPI.getAll(),
                announcementsAPI.getAll()
            ]);

            // In a real app, the backend would filter this. 
            // Here we match by the teacher's name (demo assumption)
            // Or we just show all for the demo if name matching is tricky
            const teacherName = 'Dr. James Wilson'; // Demo default for this account
            const filteredCourses = coursesRes.data.filter(c => c.instructor.includes(teacherName) || c.instructor === 'Dr. James Wilson');

            setMyCourses(filteredCourses);
            setStudentsCount(studentsRes.data.length); // Total students in their courses (simplified)
            setRecentAnnouncements(announcementsRes.data.slice(0, 3));
        } catch (error) {
            console.error('Error fetching teacher dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center font-black uppercase tracking-widest text-maroon">Loading Faculty Portal...</div>;

    const statsDisplay = [
        { title: 'My Courses', value: myCourses.length, icon: BookOpen, color: 'maroon' },
        { title: 'Active Students', value: studentsCount, icon: Users, color: 'gold' },
        { title: 'Upcoming Classes', value: '4', icon: Clock, color: 'blue' },
        { title: 'Pending Grades', value: '12', icon: FileText, color: 'green' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Faculty Portal</h1>
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
                                <div className={`w-14 h-14 bg-maroon/5 rounded-2xl flex items-center justify-center transition-colors`}>
                                    <Icon className="w-7 h-7 text-maroon" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* My Courses */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-6 h-6 bg-gold/20 rounded flex items-center justify-center">
                                <Zap className="w-4 h-4 text-gold" />
                            </div>
                            <h2 className="text-xs font-black text-gray-800 uppercase tracking-widest">Active Curriculum</h2>
                        </div>
                        <div className="space-y-4">
                            {myCourses.map(course => (
                                <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-maroon/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-maroon text-gold rounded-xl flex items-center justify-center font-black text-xs">
                                            {course.id}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{course.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{course.schedule}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-800">{course.enrolled}/{course.capacity}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Enrolled</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Teacher Actions */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg relative overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="flex items-center justify-center gap-3 bg-maroon text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-maroon-dark transition-all shadow-xl hover:-translate-y-1">
                                <ClipboardCheck className="w-4 h-4 text-gold" /> Mark Attendance
                            </button>
                            <button className="flex items-center justify-center gap-3 bg-gold text-maroon px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold-dark transition-all shadow-xl hover:-translate-y-1">
                                <FileText className="w-4 h-4" /> Post Grades
                            </button>
                            <button className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl hover:-translate-y-1">
                                <GraduationCap className="w-4 h-4 text-blue-200" /> My Students
                            </button>
                        </div>
                    </div>
                </div>

                {/* Announcements Sidebar */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-8">Faculty Notices</h2>
                    <div className="space-y-6">
                        {recentAnnouncements.map(ann => (
                            <div key={ann.id} className="relative pl-6 border-l-2 border-gold pb-6 last:pb-0">
                                <p className="text-[9px] font-black text-gold uppercase tracking-widest mb-1">{ann.date}</p>
                                <h4 className="text-xs font-bold text-gray-800 mb-1">{ann.title}</h4>
                                <p className="text-[10px] text-gray-400 font-medium line-clamp-2">{ann.content}</p>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-4 border-2 border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-xl hover:border-maroon/20 hover:text-maroon transition-all">View All Bulletins</button>
                </div>
            </div>
        </div>
    );
}
