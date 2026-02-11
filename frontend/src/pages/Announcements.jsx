import { useEffect, useState } from 'react';
import { Megaphone, Plus, Calendar, User, Tag, Trash2, X, Edit } from 'lucide-react';
import { announcementsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        priority: 'Normal',
        date: new Date().toISOString().split('T')[0],
    });

    const { user } = useAuth();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const { data } = await announcementsAPI.getAll();
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            category: 'General',
            priority: 'Normal',
            date: new Date().toISOString().split('T')[0],
        });
        setEditingAnnouncement(null);
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            category: announcement.category,
            priority: announcement.priority,
            date: announcement.date,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await announcementsAPI.delete(id);
            setAnnouncements(announcements.filter(ann => ann.id !== id));
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const announcementData = {
                ...formData,
                author: user?.email || 'Admin'
            };
            if (editingAnnouncement) {
                await announcementsAPI.update(editingAnnouncement.id, announcementData);
            } else {
                await announcementsAPI.create(announcementData);
            }
            await fetchAnnouncements();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error creating announcement:', error);
        }
    };

    if (loading) return <div className="p-8 text-center font-black uppercase tracking-widest text-maroon">Syncing Bulletins...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-maroon tracking-tight uppercase">Announcements</h1>
                    <p className="text-xs text-maroon/40 font-bold tracking-widest mt-1">Official College Communications</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-maroon text-gold px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-elite-maroon shadow-lg transition-all border border-gold/20 font-black text-xs uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5" /> Broadcast News
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {announcements.map((announcement) => (
                    <div key={announcement.id} className="card-elite p-8 group relative overflow-hidden transition-all hover:scale-[1.01]">
                        {announcement.priority === 'High' && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold/15 transition-all"></div>
                        )}

                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-[0_0_15px] ${announcement.priority === 'High'
                                    ? 'bg-red-500/20 text-red-100 border-red-500 shadow-red-500/30'
                                    : 'bg-gold/10 text-gold border-gold/20 shadow-gold/10'
                                    }`}>
                                    {announcement.priority} Priority
                                </div>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                    {announcement.date}
                                </span>
                            </div>
                            {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(announcement)} className="p-2 hover:bg-parchment-100 rounded-lg text-white/20 hover:text-white transition-all">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(announcement.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-black text-white tracking-tight mb-4 uppercase group-hover:text-gold transition-colors">{announcement.title}</h2>
                        <p className="text-white/60 leading-relaxed font-medium mb-8 border-l-2 border-white/5 pl-6">{announcement.content}</p>

                        <div className="flex justify-between items-center border-t border-white/5 pt-6">
                            <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest">Issued by: {announcement.author}</p>
                            <button className="text-white/20 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                                {announcement.category} Bulletin
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {(showModal && (user?.role === 'admin' || user?.role === 'superadmin')) && (
                <div className="fixed inset-0 bg-maroon-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
                    <div className="card-elite p-12 max-w-2xl w-full border border-gold/20 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                                    {editingAnnouncement ? 'Refine Broadcast' : 'New Broadcast'}
                                </h2>
                                <p className="text-xs text-gold/40 font-bold mt-1 uppercase tracking-widest">Elite Communication Portal</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group">
                                <X className="w-8 h-8 text-gold group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Subject Headline</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder-white/20 outline-none focus:ring-1 focus:ring-gold/30 transition-all"
                                    placeholder="e.g. End of Semester Gala"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Priority Level</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-1 focus:ring-gold/30 transition-all"
                                    >
                                        <option value="Normal">Normal</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-1 focus:ring-gold/30 transition-all"
                                    >
                                        <option value="General">General</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Facilities">Facilities</option>
                                        <option value="Events">Events</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Detailed Message</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder-white/20 outline-none focus:ring-1 focus:ring-gold/30 transition-all h-40 resize-none"
                                    placeholder="Enter the broadcast details..."
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-gold text-maroon py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:shadow-[0_0_50px_rgba(255,215,0,0.3)] transition-all transform active:scale-95">
                                {editingAnnouncement ? 'Update Broadcast' : 'Execute Broadcast'}
                            </button>
                        </form>
                    </div >
                </div >
            )
            }
        </div >
    );
}
