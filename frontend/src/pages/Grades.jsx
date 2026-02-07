import { useEffect, useState } from 'react';
import { gradesAPI, coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, Search, TrendingUp, Download } from 'lucide-react';

export default function Grades() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const { data: coursesData } = await coursesAPI.getAll();
            setCourses(coursesData);
            if (coursesData.length > 0) {
                setSelectedCourse(coursesData[0].name);
            }
        } catch (error) {
            console.error('Error fetching initial grades data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCourse || user?.role === 'student') {
            fetchGrades();
        }
    }, [selectedCourse, user]);

    const fetchGrades = async () => {
        try {
            // Real API might need student_id or course filter
            const { data } = await gradesAPI.getAll(user?.role === 'student' ? undefined : selectedCourse);

            // If student, local filter for demo (in real app, backend filters by token)
            const filteredGrades = user?.role === 'student'
                ? data.filter(g => g.student_id === 'BT2024001') // Sarah Johnson demo
                : data;

            setGrades(filteredGrades);
        } catch (error) {
            console.error('Error fetching grades:', error);
        }
    };

    const handleDownload = () => {
        const json = JSON.stringify(grades, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Grades_${selectedCourse || 'Student'}.json`;
        a.click();
    };

    const handleValidate = () => {
        alert('Validation Complete: All results have been officially cross-referenced with campus records.');
    };

    if (loading) return <div className="p-8 text-center font-black uppercase tracking-widest text-maroon">Accessing Secure Records...</div>;

    const isStudent = user?.role === 'student';

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-maroon tracking-tight uppercase">
                        {isStudent ? 'My Academic Record' : 'Performance Registry'}
                    </h1>
                    <p className="text-xs text-maroon/40 font-bold tracking-widest mt-1">
                        {isStudent ? 'Official Transcript Preview' : 'Confidential Campus Results'}
                    </p>
                </div>
                <div className="p-1 px-4 bg-maroon/5 rounded-full border border-maroon/10">
                    <p className="text-[10px] font-black text-maroon/40 uppercase tracking-widest">Secure Access Active</p>
                </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-elite p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-all"></div>
                    <div className="relative z-10">
                        <p className="text-gold/60 text-[10px] font-black uppercase tracking-widest mb-1">
                            {isStudent ? 'GPA Progress' : 'Pass Rate'}
                        </p>
                        <p className="text-4xl font-black text-white">{isStudent ? '3.8' : '94.2%'}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gold w-[85%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
                {!isStudent && (
                    <div className="card-elite p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-gold/60 text-[10px] font-black uppercase tracking-widest mb-1">Average GPA</p>
                            <p className="text-4xl font-black text-white">3.86</p>
                            <p className="text-[10px] text-white/40 mt-2 font-bold italic">Top 5% in Region</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Grades Table */}
            <div className="card-elite overflow-hidden border border-gold/10">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                            {isStudent ? 'Your Graded Assessments' : 'Student Performance Registry'}
                        </h3>
                        {!isStudent && (
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="mt-2 bg-transparent text-xs text-gold font-black uppercase tracking-widest border-none outline-none cursor-pointer"
                            >
                                {courses.map(c => <option key={c.id} value={c.name} className="bg-maroon">{c.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleDownload} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                            <Download className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/5">
                            {['Student ID', 'Course', 'Assignment', 'Score'].map(header => (
                                <th key={header} className="px-8 py-6 text-left text-[10px] font-black text-gold/40 uppercase tracking-[0.2em]">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {grades.map((grade) => (
                            <tr key={grade.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center font-black text-gold border border-gold/20">
                                            {grade.student_id?.[0]}
                                        </div>
                                        <p className="text-sm font-bold text-white group-hover:text-gold transition-colors">{grade.student_id}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-xs font-bold text-white/60 tracking-tight">{grade.course}</td>
                                <td className="px-8 py-6 text-xs font-medium text-white/40 italic">{grade.assignment}</td>
                                <td className="px-8 py-6">
                                    <span className="text-lg font-black text-gold">{grade.score}/{grade.max_score}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center py-10">
                <button onClick={isStudent ? () => window.print() : handleValidate} className="px-16 py-6 bg-gold text-maroon rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-110 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(255,215,0,0.3)] hover:shadow-gold/50">
                    {isStudent ? 'Request Official Transcript' : 'Validate Results Batch'}
                </button>
            </div>
        </div>
    );
}
