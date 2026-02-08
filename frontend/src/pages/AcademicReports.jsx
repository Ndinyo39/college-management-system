import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reportsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    User,
    Calendar,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    Printer,
    Download,
    TrendingUp,
    ShieldCheck,
    ClipboardCheck,
    Search,
    X
} from 'lucide-react';

export default function AcademicReports() {
    const { user } = useAuth();
    const location = useLocation();
    const [reports, setReports] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [printingReport, setPrintingReport] = useState(null);
    const [filterStudentId, setFilterStudentId] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        student_id: '',
        reporting_period: 'Week 1',
        total_lessons: 10,
        attended_lessons: 10,
        theory_topics: '',
        theory_score: 0,
        theory_remarks: '',
        practical_tasks: '',
        equipment_used: '',
        skill_level: 'Good',
        safety_compliance: 'Yes',
        discipline_issues: '',
        trainer_observations: '',
        progress_summary: '',
        recommendation: 'Proceed'
    });

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (user?.role === 'teacher') params.trainer_email = user.email;

            const [reportsRes, studentsRes] = await Promise.all([
                reportsAPI.getAll(params),
                studentsAPI.getAll()
            ]);
            setReports(reportsRes.data);
            setStudents(studentsRes.data);

            // Handle URL filter
            const queryParams = new URLSearchParams(location.search);
            const studentId = queryParams.get('studentId');
            if (studentId) setFilterStudentId(studentId);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [location.search]);

    const handlePrint = (report) => {
        setPrintingReport(report);
        setTimeout(() => {
            window.print();
            setPrintingReport(null);
        }, 500);
    };

    const filteredReports = filterStudentId
        ? reports.filter(r => r.student_id === filterStudentId)
        : reports;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedStudent = students.find(s => s.id === formData.student_id);

        const reportPayload = {
            ...formData,
            student_name: selectedStudent?.name || 'Unknown',
            registration_number: formData.student_id,
            course_unit: selectedStudent?.course || 'General',
            attendance_percentage: ((formData.attended_lessons / formData.total_lessons) * 100).toFixed(1)
        };

        try {
            await reportsAPI.create(reportPayload);
            setShowModal(false);
            fetchInitialData();
            alert('Academic Evaluation successfully captured.');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit report');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await reportsAPI.delete(id);
            fetchInitialData();
        } catch (error) {
            alert('Deletion failed');
        }
    };

    if (loading) return <div className="p-10 text-maroon font-black animate-pulse uppercase tracking-widest">Compiling Academic Data...</div>;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-maroon uppercase tracking-tight">Trainer Academic Reports</h1>
                    <p className="text-sm text-gray-400 font-medium">Daily work report alignment & student tracking</p>
                </div>
                <div className="flex gap-4">
                    {filterStudentId && (
                        <button
                            onClick={() => setFilterStudentId('')}
                            className="bg-gray-100 text-gray-500 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Clear Filter
                        </button>
                    )}
                    {user?.role !== 'student' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-maroon text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-maroon/90 transition-all shadow-xl flex items-center gap-3 active:scale-95"
                        >
                            <Plus className="w-4 h-4 text-gold" /> Capture New Report
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <select
                        value={filterStudentId}
                        onChange={(e) => setFilterStudentId(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border-none rounded-xl text-sm font-black text-maroon outline-none appearance-none"
                    >
                        <option value="">Filter by Student Registry...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                    </select>
                </div>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReports.map((report) => (
                    <div key={report.id} className="card-elite border border-maroon/5 p-8 space-y-6 relative group overflow-hidden bg-white print:shadow-none print:border print:m-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-bl-[5rem] -mr-16 -mt-16 transition-all group-hover:bg-maroon/10 print:hidden"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 bg-maroon rounded-2xl flex items-center justify-center font-black text-gold shadow-lg">
                                    {report.student_name[0]}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-maroon leading-tight">{report.student_name}</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{report.course_unit} • {report.reporting_period}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 print:hidden">
                                <span className={`px-4 py-1.5 rounded-full font-black text-[8px] uppercase tracking-widest border ${report.recommendation === 'Proceed' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                    report.recommendation === 'Improve' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                        'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}>
                                    {report.recommendation}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePrint(report)}
                                        className="text-gray-300 hover:text-maroon transition-colors p-1"
                                        title="Print Report"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    {(user?.role === 'admin' || user?.role === 'superadmin' || user?.email === report.trainer_email) && (
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            title="Delete Record"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <ClipboardCheck className="w-3 h-3 text-maroon" /> Attendance
                                </p>
                                <p className="text-sm font-black text-maroon">{report.attendance_percentage}%</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-gold" /> Theory
                                </p>
                                <p className="text-sm font-black text-maroon">{report.theory_score}/100</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-green-500" /> Safety
                                </p>
                                <p className="text-sm font-black text-maroon">{report.safety_compliance}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50/50 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Theory Focus</p>
                                <p className="text-[11px] text-gray-600 font-bold">{report.theory_topics || "Standard Curriculum"}</p>
                            </div>

                            <div className="bg-gray-50/50 p-4 rounded-2xl">
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-maroon/40 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Trainer Observations</p>
                                        <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic">
                                            "{report.trainer_observations || "No specific observations documented for this period."}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between items-center text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                            <span>Captured by Trainer: {report.trainer_name}</span>
                            <span>Date: {new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Print Overlay */}
            {printingReport && (
                <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12">
                    <div className="border-4 border-maroon p-12 space-y-8">
                        <div className="flex justify-between items-start border-b-4 border-maroon pb-8">
                            <div>
                                <h1 className="text-4xl font-black text-maroon uppercase">Official Academic Record</h1>
                                <p className="text-sm font-black tracking-widest uppercase mt-2">Beautex Training Centre • Internal Audit Repository</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Registry Number</p>
                                <p className="text-lg font-black text-maroon">BTC-{printingReport.registration_number}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 pt-8">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</p>
                                    <p className="text-xl font-black text-maroon">{printingReport.student_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Specialization</p>
                                    <p className="text-lg font-bold text-gray-800">{printingReport.course_unit}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporting Period</p>
                                    <p className="text-xl font-black text-maroon">{printingReport.reporting_period}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trainer</p>
                                    <p className="text-lg font-bold text-gray-800">{printingReport.trainer_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-8 py-10 bg-gray-50 px-8 rounded-3xl">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Attendance</p>
                                <p className="text-2xl font-black text-maroon">{printingReport.attendance_percentage}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Theory Score</p>
                                <p className="text-2xl font-black text-maroon">{printingReport.theory_score}/100</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Skill Level</p>
                                <p className="text-2xl font-black text-maroon">{printingReport.skill_level}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Recommendation</p>
                                <p className="text-2xl font-black text-green-600">{printingReport.recommendation}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-black text-maroon uppercase tracking-widest border-l-4 border-gold pl-3 mb-3">Practical Assessment Details</h3>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">{printingReport.practical_tasks || "No practical tasks documented for this session."}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-maroon uppercase tracking-widest border-l-4 border-gold pl-3 mb-3">Academic Progress Summary</h3>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium italic">"{printingReport.progress_summary || "Student is maintaining satisfactory progress in line with curriculum requirements."}"</p>
                            </div>
                        </div>

                        <div className="pt-20 flex justify-between items-end border-t border-gray-100">
                            <div className="text-center">
                                <div className="w-48 border-b-2 border-gray-300 mb-2"></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trainer Signature</p>
                            </div>
                            <div className="text-center">
                                <div className="w-48 border-b-2 border-gray-300 mb-2"></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Dean Approval</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archival Date</p>
                                <p className="text-xs font-bold">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-maroon/20">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/50">
                        <div className="bg-maroon p-8 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                            <div>
                                <h2 className="text-white text-2xl font-black uppercase tracking-tight">Academic Report Capture</h2>
                                <p className="text-gold/60 text-[10px] font-black uppercase tracking-widest">BT-REG-09 | Trainer Portal</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Section 1: Basic Info */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center gap-2 border-b-2 border-maroon/5 pb-2 mb-4">
                                    <User className="w-4 h-4 text-maroon" />
                                    <h3 className="text-xs font-black text-maroon uppercase tracking-widest">Identification & Period</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Student</label>
                                        <select
                                            required
                                            value={formData.student_id}
                                            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-maroon/10 outline-none"
                                        >
                                            <option value="">Choose Registry...</option>
                                            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Reporting Period</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Week 4 or February"
                                            value={formData.reporting_period}
                                            onChange={(e) => setFormData({ ...formData, reporting_period: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Attendance */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b-2 border-maroon/5 pb-2 mb-4">
                                    <CheckCircle2 className="w-4 h-4 text-gold" />
                                    <h3 className="text-xs font-black text-maroon uppercase tracking-widest">Attendance Metric</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Total Lessons</label>
                                        <input
                                            type="number"
                                            value={formData.total_lessons}
                                            onChange={(e) => setFormData({ ...formData, total_lessons: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-black text-maroon"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Attended</label>
                                        <input
                                            type="number"
                                            value={formData.attended_lessons}
                                            onChange={(e) => setFormData({ ...formData, attended_lessons: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-black text-maroon"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Theory */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b-2 border-maroon/5 pb-2 mb-4">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    <h3 className="text-xs font-black text-maroon uppercase tracking-widest">Theory Assessment</h3>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="number"
                                        placeholder="CAS Score (0-100)"
                                        value={formData.theory_score}
                                        onChange={(e) => setFormData({ ...formData, theory_score: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Topics Covered..."
                                        value={formData.theory_topics}
                                        onChange={(e) => setFormData({ ...formData, theory_topics: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold"
                                    />
                                    <textarea
                                        placeholder="Trainer Remarks on Theory..."
                                        value={formData.theory_remarks}
                                        onChange={(e) => setFormData({ ...formData, theory_remarks: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold min-h-[60px]"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Section 4: Practical */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center gap-2 border-b-2 border-maroon/5 pb-2 mb-4">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    <h3 className="text-xs font-black text-maroon uppercase tracking-widest">Practical Performance</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <textarea
                                        placeholder="Tasks Performed / Equipment Used..."
                                        value={formData.practical_tasks}
                                        onChange={(e) => setFormData({ ...formData, practical_tasks: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold min-h-[100px]"
                                    ></textarea>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Skill Level</label>
                                                <select
                                                    value={formData.skill_level}
                                                    onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-[10px] font-black uppercase tracking-widest text-maroon"
                                                >
                                                    <option>Excellent</option>
                                                    <option>Good</option>
                                                    <option>Fair</option>
                                                    <option>Poor</option>
                                                </select>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Safety Compliance</label>
                                                <select
                                                    value={formData.safety_compliance}
                                                    onChange={(e) => setFormData({ ...formData, safety_compliance: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-[10px] font-black uppercase tracking-widest text-maroon"
                                                >
                                                    <option>Yes</option>
                                                    <option>No</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Conduct & Final */}
                            <div className="md:col-span-2 space-y-6 pt-4">
                                <div className="flex items-center gap-2 border-b-2 border-maroon/5 pb-2 mb-4">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    <h3 className="text-xs font-black text-maroon uppercase tracking-widest">Conduct & Recommendations</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <textarea
                                        placeholder="Discipline Issues / Observations..."
                                        value={formData.trainer_observations}
                                        onChange={(e) => setFormData({ ...formData, trainer_observations: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold"
                                    ></textarea>
                                    <div className="space-y-4">
                                        <select
                                            value={formData.recommendation}
                                            onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                                            className="w-full bg-gold/10 border-2 border-gold/10 rounded-xl p-3 text-[10px] font-black uppercase tracking-widest text-maroon"
                                        >
                                            <option>Proceed</option>
                                            <option>Improve</option>
                                            <option>Review</option>
                                        </select>
                                        <textarea
                                            placeholder="Overall Progress Summary..."
                                            value={formData.progress_summary}
                                            onChange={(e) => setFormData({ ...formData, progress_summary: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-6">
                                <button type="submit" className="w-full bg-maroon text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-maroon/90 hover:-translate-y-1 transition-all active:scale-95">
                                    Seal Academic Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
