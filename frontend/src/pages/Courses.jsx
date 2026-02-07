import { useEffect, useState } from 'react';
import { coursesAPI } from '../services/api';
import { Plus, Book, Edit, Monitor, GraduationCap, Utensils, Scissors, ShieldAlert, BookOpen, Trash2, X } from 'lucide-react';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        name: '', department: '', instructor: '', duration: '', capacity: 30, room: '', schedule: '', status: 'Active'
    });

    const departments = ['Cosmetology', 'Beauty Therapy', 'Catering', 'IT & Computer Science', 'Business'];

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await coursesAPI.getAll();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await coursesAPI.update(editingCourse.id, formData);
            } else {
                await coursesAPI.create(formData);
            }
            setShowModal(false);
            fetchCourses();
            resetForm();
        } catch (error) {
            console.error('Error saving course:', error);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData(course);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await coursesAPI.delete(id);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', department: '', instructor: '', duration: '', capacity: 30, room: '', schedule: '', status: 'Active'
        });
        setEditingCourse(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-maroon tracking-tight uppercase">Courses</h1>
                    <p className="text-xs text-maroon/40 font-bold tracking-widest mt-1">Academic Programs & Curriculum</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-maroon text-gold px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-elite-maroon shadow-lg transition-all border border-gold/20 font-black text-xs uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5" /> Add New Course
                </button>
            </div>

            {/* Courses Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-light p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-maroon/40 uppercase tracking-widest">Active Programs</p>
                        <p className="text-2xl font-black text-maroon">{courses.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-maroon/5 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-maroon" />
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                    <div key={course.id} className="card-light p-8 hover:shadow-2xl hover:scale-[1.02] transition-all group border-b-4 border-b-maroon/10 hover:border-b-gold">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-maroon/5 group-hover:bg-maroon transition-colors`}>
                                <BookOpen className="w-6 h-6 text-maroon group-hover:text-gold transition-colors" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(course)} className="p-2 hover:bg-parchment-100 rounded-lg text-maroon/20 hover:text-maroon transition-all">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(course.id)} className="p-2 hover:bg-red-50 rounded-lg text-maroon/10 hover:text-red-600 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-maroon tracking-tight mb-2 uppercase">{course.name}</h3>
                        <p className="text-xs font-black text-maroon/40 uppercase tracking-widest mb-6">{course.department}</p>

                        <div className="mt-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[10px] text-maroon/40 font-bold uppercase tracking-widest">
                                <Monitor className="w-3 h-3" />
                                <span>Room: {course.room || 'Hall A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-maroon/40 font-bold uppercase tracking-widest">
                                <ShieldAlert className="w-3 h-3" />
                                <span>{course.schedule || 'Mon - Fri, 8:00 AM'}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mt-6">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-maroon/40">Enrollment</span>
                                <span className="text-maroon">
                                    {course.enrolled || 0} / {course.capacity} Students
                                </span>
                            </div>
                            <div className="w-full bg-parchment-200 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-maroon h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${((course.enrolled || 0) / course.capacity) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-maroon/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-maroon/10 scale-in-center">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-maroon uppercase tracking-tight">
                                    {editingCourse ? 'Update Curriculum' : 'Add New Program'}
                                </h2>
                                <p className="text-xs text-maroon/40 font-bold mt-1 uppercase tracking-widest">Academic Program Registry</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-parchment-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-maroon/20" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-maroon/40 uppercase tracking-widest ml-1">Course Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-parchment-100 border-none rounded-2xl text-maroon font-bold placeholder-maroon/20 outline-none focus:ring-2 focus:ring-maroon/10"
                                    placeholder="e.g. Cyber Security"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-maroon/40 uppercase tracking-widest ml-1">Duration</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-5 py-4 bg-parchment-100 border-none rounded-2xl text-maroon font-bold placeholder-maroon/20 outline-none focus:ring-2 focus:ring-maroon/10"
                                        placeholder="6 Months"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-maroon/40 uppercase tracking-widest ml-1">Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        className="w-full px-5 py-4 bg-parchment-100 border-none rounded-2xl text-maroon font-bold placeholder-maroon/20 outline-none focus:ring-2 focus:ring-maroon/10"
                                        placeholder="30"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-maroon/40 uppercase tracking-widest ml-1">Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-5 py-4 bg-parchment-100 border-none rounded-2xl text-maroon font-bold outline-none focus:ring-2 focus:ring-maroon/10"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-maroon text-gold py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-elite-maroon shadow-xl transition-all mt-4 border border-gold/20">
                                {editingCourse ? 'Save curriculum' : 'Announce Program'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
