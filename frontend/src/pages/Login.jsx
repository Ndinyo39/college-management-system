import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, GraduationCap } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(email, password);
            if (response?.requirePasswordChange) {
                navigate('/change-password', { state: { email: response.user.email } });
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email first to reset password');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { authAPI } = await import('../services/api');
            const { data } = await authAPI.forgotPassword({ email });
            alert(data.message || 'If an account exists, reset instructions have been sent.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    const demoLogin = async (role) => {
        let demoEmail = '';
        let demoPassword = 'password123';

        if (role === 'superadmin') {
            demoEmail = 'superadmin@beautex.edu';
            demoPassword = 'admin123';
        } else if (role === 'admin') {
            demoEmail = 'admin@beautex.edu';
            demoPassword = 'admin123';
        } else if (role === 'teacher') {
            demoEmail = 'james.wilson@beautex.edu';
            demoPassword = 'admin123';
        } else if (role === 'student') {
            demoEmail = 'sarah.johnson0@beautex.edu';
            demoPassword = 'admin123';
        }

        setEmail(demoEmail);
        setPassword(demoPassword);

        // Auto-submit
        setError('');
        setLoading(true);
        try {
            await login(demoEmail, demoPassword);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Auth system failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-maroon flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* School Seal Screenshot 4 */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl mb-6 shadow-xl overflow-hidden border-4 border-gold">
                        <img src="/logo.jpg" alt="Beautex Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-black text-white uppercase tracking-widest">Beautex</h1>
                        <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.2em]">Technical Training College</p>
                    </div>
                </div>

                {/* Login Card Screenshot 4 */}
                <div className="bg-white rounded-[2rem] p-10 shadow-2xl">
                    <div className="text-center mb-10">
                        <h2 className="text-lg font-bold text-gray-800">Sign in to your account</h2>
                        <div className="h-1 w-12 bg-gold mx-auto mt-4 rounded-full"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon/5 focus:border-maroon/20 font-medium transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon/5 focus:border-maroon/20 font-medium transition-all"
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-maroon focus:ring-maroon" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-[11px] font-bold text-maroon uppercase tracking-wider hover:underline"
                            >
                                Forgot?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-maroon text-white font-black py-4 rounded-xl hover:bg-maroon-dark transition-all shadow-lg uppercase text-xs tracking-widest disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Quick Labels from Screenshot 4 */}
                    <div className="mt-8 pt-6 border-t border-gray-50 flex flex-wrap justify-center gap-2">
                        <div className="p-2 bg-gray-50 rounded-xl text-center min-w-[70px]">
                            <p className="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-1">Super</p>
                            <button onClick={() => demoLogin('superadmin')} className="text-[9px] font-bold text-maroon">Login</button>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl text-center min-w-[70px]">
                            <p className="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-1">Admin</p>
                            <button onClick={() => demoLogin('admin')} className="text-[9px] font-bold text-maroon">Login</button>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl text-center min-w-[70px]">
                            <p className="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-1">Teacher</p>
                            <button onClick={() => demoLogin('teacher')} className="text-[9px] font-bold text-maroon">Login</button>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl text-center min-w-[70px]">
                            <p className="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-1">Student</p>
                            <button onClick={() => demoLogin('student')} className="text-[9px] font-bold text-maroon">Login</button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                        © 2026 Beautex Technical Training College
                    </p>
                </div>
            </div>
        </div>
    );
}
