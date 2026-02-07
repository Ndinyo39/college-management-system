import { useEffect, useState } from 'react';
import { facultyAPI } from '../services/api';
import { Plus, Search, Edit, Trash2, X, User, Printer, Mail } from 'lucide-react';
import IDCard from '../components/shared/IDCard';

export default function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showProfile, setShowProfile] = useState(null);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', department: '', position: '', specialization: '', contact: ''
    });
    const [printingFaculty, setPrintingFaculty] = useState(null);

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const { data } = await facultyAPI.getAll();
            setFaculty(data);
            setFilteredFaculty(data);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    };

    const [filteredFaculty, setFilteredFaculty] = useState([]);

    useEffect(() => {
        const filtered = faculty.filter(member =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFaculty(filtered);
    }, [searchQuery, faculty]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this faculty member?')) return;
        try {
            await facultyAPI.delete(id);
            fetchFaculty();
        } catch (error) {
            console.error('Error deleting faculty:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFaculty) {
                await facultyAPI.update(editingFaculty.id, formData);
            } else {
                await facultyAPI.create(formData);
            }
            setShowModal(false);
            setEditingFaculty(null);
            fetchFaculty();
            resetForm();
        } catch (error) {
            console.error('Error saving faculty:', error);
        }
    };

    const handleEdit = (member) => {
        setEditingFaculty(member);
        setFormData({
            name: member.name,
            email: member.email,
            department: member.department,
            position: member.position,
            specialization: member.specialization || '',
            contact: member.contact || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '', email: '', department: '', position: '', specialization: '', contact: ''
        });
    };

    const handlePrintID = (member) => {
        setPrintingFaculty(member);
        setTimeout(() => {
            window.print();
            setPrintingFaculty(null);
        }, 500);
    };

    const departments = ['Cosmetology', 'Beauty Therapy', 'Catering', 'IT & Computer Science', 'Business'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-maroon tracking-tight uppercase">Faculty</h1>
                    <p className="text-xs text-maroon/40 font-bold tracking-widest mt-1">Academic Instructors & Staff</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-maroon text-gold px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-elite-maroon shadow-lg transition-all border border-gold/20 font-black text-xs uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5" /> Add Faculty
                </button>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 card-light p-3 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maroon/20" />
                        <input
                            type="text"
                            placeholder="Find an instructor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-parchment-100 rounded-xl text-sm font-medium text-maroon placeholder-maroon/20 outline-none focus:ring-2 focus:ring-maroon/5"
                        />
                    </div>
                </div>
                <div className="card-light p-3">
                    <select className="w-full h-full bg-parchment-100 border-none rounded-xl text-xs font-black uppercase tracking-widest text-maroon/60 px-4 focus:ring-2 focus:ring-maroon/5 outline-none">
                        <option>All Departments</option>
                        {departments.map(dept => <option key={dept}>{dept}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredFaculty.map((member) => (
                    <div key={member.id} className="card-light p-8 hover:shadow-2xl hover:scale-[1.02] transition-all group overflow-hidden relative">
                        {/* Subtle Background Pattern */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-maroon/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start mb-8">
                            <div className="flex gap-6">
                                <div className="w-20 h-20 bg-maroon rounded-[1.5rem] flex items-center justify-center text-gold text-2xl font-black shadow-xl group-hover:rotate-6 transition-transform">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-maroon tracking-tight">{member.name}</h3>
                                    <p className="text-xs font-black text-maroon/40 uppercase tracking-widest mt-1">{member.role}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-parchment-100 text-[9px] font-black text-maroon uppercase tracking-widest rounded-lg border border-maroon/5">
                                            {member.department}
                                        </span>
                                        <span className="px-3 py-1 bg-green-50 text-[9px] font-black text-green-700 uppercase tracking-widest rounded-lg">
                                            {member.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-parchment-100 rounded-xl border border-maroon/5">
                                <Mail className="w-4 h-4 text-maroon/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-maroon/5 pt-8">
                            <div className="bg-parchment-100 p-4 rounded-2xl border border-maroon/5">
                                <p className="text-[9px] font-black text-maroon/30 uppercase tracking-[0.2em] mb-1">Courses</p>
                                <p className="text-lg font-black text-maroon">{member.courses}</p>
                            </div>
                            <div className="bg-parchment-100 p-4 rounded-2xl border border-maroon/5">
                                <p className="text-[9px] font-black text-maroon/30 uppercase tracking-[0.2em] mb-1">Students</p>
                                <p className="text-lg font-black text-maroon">{member.totalStudents}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setShowProfile(member)}
                                className="flex-1 bg-maroon text-gold py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-elite-maroon transition-all shadow-lg"
                            >
                                View Full Profile
                            </button>
                            <button
                                onClick={() => handlePrintID(member)}
                                className="px-4 border border-maroon/10 rounded-xl hover:bg-parchment-100 transition-colors"
                                title="Print ID Card"
                            >
                                <Printer className="w-4 h-4 text-maroon/40" />
                            </button>
                            <button
                                onClick={() => handleEdit(member)}
                                className="px-4 border border-maroon/10 rounded-xl hover:bg-parchment-100 transition-colors"
                            >
                                <Edit className="w-4 h-4 text-maroon/40" />
                            </button>
                            <button
                                onClick={() => handleDelete(member.id)}
                                className="px-4 border border-red-500/10 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-maroon-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-maroon-800 border border-maroon-700/50 rounded-xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gold-500">
                                {editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-maroon-700 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gold-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-maroon-700/50 rounded-lg bg-maroon-900/50 text-white placeholder-gold-500/30 focus:ring-2 focus:ring-gold-500 outline-none"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-maroon-700/50 rounded-lg bg-maroon-900/50 text-white placeholder-gold-500/30 focus:ring-2 focus:ring-gold-500 outline-none"
                                required
                            />
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-3 border border-maroon-700/50 rounded-lg bg-maroon-900/50 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                                required
                            >
                                <option value="" className="bg-maroon-800">Select Department</option>
                                {departments.map(dept => <option key={dept} value={dept} className="bg-maroon-800">{dept}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Position"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-4 py-3 border border-maroon-700/50 rounded-lg bg-maroon-900/50 text-white placeholder-gold-500/30 focus:ring-2 focus:ring-gold-500 outline-none"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Specialization"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                className="w-full px-4 py-3 border border-maroon-700/50 rounded-lg bg-maroon-900/50 text-white placeholder-gold-500/30 focus:ring-2 focus:ring-gold-500 outline-none"
                            />
                            <button type="submit" className="w-full bg-gold-500 text-maroon-900 py-3 rounded-lg font-bold hover:bg-gold-400 transition-all shadow-lg mt-4">
                                {editingFaculty ? 'Update' : 'Add'} Faculty
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 bg-maroon-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-12 max-w-2xl w-full border border-maroon/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/5 rounded-full -mr-32 -mt-32"></div>
                        <button onClick={() => setShowProfile(null)} className="absolute top-8 right-8 p-2 hover:bg-maroon/10 rounded-full transition-colors z-10">
                            <X className="w-8 h-8 text-maroon" />
                        </button>

                        <div className="flex gap-10 items-start mb-12 relative z-10">
                            <div className="w-32 h-32 bg-maroon rounded-[2.5rem] flex items-center justify-center text-gold text-4xl font-black shadow-2xl">
                                {showProfile.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-maroon tracking-tight">{showProfile.name}</h2>
                                <p className="text-sm font-black text-gold bg-maroon px-4 py-2 rounded-xl inline-block uppercase tracking-widest">{showProfile.position}</p>
                                <div className="flex gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-xs font-black text-maroon/40 uppercase tracking-widest">
                                        <Mail className="w-4 h-4" /> {showProfile.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-maroon/30 uppercase tracking-widest">Department</p>
                                <p className="text-lg font-black text-maroon uppercase">{showProfile.department}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-maroon/30 uppercase tracking-widest">Specialization</p>
                                <p className="text-lg font-black text-maroon uppercase">{showProfile.specialization || 'General'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-maroon/30 uppercase tracking-widest">Contact Information</p>
                                <p className="text-lg font-black text-maroon uppercase">{showProfile.contact || 'Not Listed'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-maroon/30 uppercase tracking-widest">Employment Status</p>
                                <p className="text-lg font-black text-green-600 uppercase">Permanent Faculty</p>
                            </div>
                        </div>

                        <div className="mt-12 bg-parchment p-8 rounded-2xl border border-maroon/5 relative z-10">
                            <h4 className="text-[10px] font-black text-maroon/40 uppercase tracking-widest mb-4">Instructor's Philosophy</h4>
                            <p className="text-sm text-maroon/80 font-medium leading-relaxed italic">"Dedicated to sculpting the next generation of technical leaders through hands-on excellence and rigorous academic discipline."</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Container */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                {printingFaculty && <IDCard data={printingFaculty} role="teacher" />}
            </div>
        </div>
    );
}
