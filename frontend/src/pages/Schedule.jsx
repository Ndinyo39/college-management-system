import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, X } from 'lucide-react';

export default function Schedule() {
    const { user } = useAuth();
    const [view, setView] = useState('Weekly');
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const allClasses = [
        { day: 'Monday', time: '08:00', course: 'Cosmetology', room: 'Room 101', instructor: 'Joan Doe', teacher_email: 'james.wilson@beautex.edu' },
        { day: 'Monday', time: '11:00', course: 'Beauty Therapy', room: 'Lab A', instructor: 'Dr. Smith', teacher_email: 'staff@beautex.edu' },
        { day: 'Tuesday', time: '09:00', course: 'Catering', room: 'Kitchen 1', instructor: 'Chef Pierre', teacher_email: 'staff@beautex.edu' },
        { day: 'Wednesday', time: '14:00', course: 'Cyber Security', room: 'IT Lab 2', instructor: 'Prof. Alice', teacher_email: 'staff@beautex.edu' },
        { day: 'Thursday', time: '10:00', course: 'Website Development', room: 'IT Lab 1', instructor: 'Mark John', teacher_email: 'staff@beautex.edu' },
        { day: 'Friday', time: '08:00', course: 'Cosmetology', room: 'Room 101', instructor: 'Joan Doe', teacher_email: 'james.wilson@beautex.edu' },
    ];

    const [filteredClasses, setFilteredClasses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        day: 'Monday', time: '08:00', course: '', room: '', instructor: ''
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            setFilteredClasses(allClasses);
        } else if (user?.role === 'teacher') {
            setFilteredClasses(allClasses.filter(c => c.teacher_email === user.email));
        } else if (user?.role === 'student') {
            setFilteredClasses(allClasses.filter(c => c.course === 'Cosmetology'));
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newSession = {
            ...formData,
            teacher_email: 'staff@beautex.edu' // Mock email
        };
        setFilteredClasses([...filteredClasses, newSession]);
        setShowModal(false);
        alert('New session added to the schedule registry locally.');
    };

    const getClass = (day, time) => filteredClasses.find(c => c.day === day && c.time === time);

    return (
        <div className="space-y-6 text-white">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-black uppercase tracking-tight text-maroon">Academic Schedule</h1>
                    <div className="bg-maroon/10 backdrop-blur-md p-1 rounded-lg border border-maroon/20 flex">
                        {['Daily', 'Weekly', 'Monthly'].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === v
                                    ? 'bg-gold text-maroon shadow-lg scale-105'
                                    : 'text-maroon/40 hover:bg-maroon/5 hover:text-maroon'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-maroon text-gold px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-elite-maroon transition-all"
                    >
                        <Plus className="w-4 h-4 inline-block mr-2" /> New Session
                    </button>
                )}
            </div>

            <div className="card-elite border border-gold/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-4 border border-white/5 w-24"></th>
                                {days.map(day => (
                                    <th key={day} className="p-4 border border-white/5 text-[10px] font-black text-gold/40 uppercase tracking-[0.2em]">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {hours.map(hour => (
                                <tr key={hour}>
                                    <td className="p-4 border border-white/5 text-center text-[10px] font-black text-white/20 uppercase tracking-tighter">
                                        {hour}
                                    </td>
                                    {days.map(day => {
                                        const session = getClass(day, hour);
                                        return (
                                            <td key={day} className="p-2 border border-white/5 min-w-[150px]">
                                                {session && (
                                                    <div className="bg-white/5 border-l-4 border-gold p-3 rounded-r-lg space-y-1 group hover:bg-white/10 transition-all cursor-pointer shadow-lg">
                                                        <p className="text-[10px] font-black text-white tracking-widest uppercase truncate">
                                                            {session.course}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-[9px] text-gold/60 font-bold">
                                                            <MapPin className="w-3 h-3 text-gold/40" /> {session.room}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[9px] text-gold/60 font-bold">
                                                            <Clock className="w-3 h-3 text-gold/40" /> {session.instructor}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Session Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-maroon-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="card-elite p-10 max-w-md w-full border border-gold/20 scale-in-center">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Schedule Registry</h2>
                                <p className="text-xs text-gold/40 font-bold mt-1 uppercase tracking-widest">New Session Provisioning</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gold/40" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Day</label>
                                    <select
                                        value={formData.day}
                                        onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-1 focus:ring-gold/30"
                                    >
                                        {days.map(d => <option key={d} value={d} className="bg-maroon">{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Time</label>
                                    <select
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-1 focus:ring-gold/30"
                                    >
                                        {hours.map(h => <option key={h} value={h} className="bg-maroon">{h}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Course Name</label>
                                <input
                                    type="text"
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder-white/20 outline-none focus:ring-1 focus:ring-gold/30"
                                    placeholder="e.g. Cosmetology II"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Room</label>
                                    <input
                                        type="text"
                                        value={formData.room}
                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder-white/20 outline-none focus:ring-1 focus:ring-gold/30"
                                        placeholder="Room 101"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gold/40 uppercase tracking-widest ml-1">Instructor</label>
                                    <input
                                        type="text"
                                        value={formData.instructor}
                                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder-white/20 outline-none focus:ring-1 focus:ring-gold/30"
                                        placeholder="Name"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-gold text-maroon py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-gold/20 transition-all mt-4 transform active:scale-95">
                                Provision Session
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
