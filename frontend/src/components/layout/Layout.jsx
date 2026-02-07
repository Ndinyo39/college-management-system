import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-parchment">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-maroon/10 border-t-maroon rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-maroon font-black uppercase tracking-widest text-[10px]">Verifying Protocol...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen bg-[#FDFBFA] text-[#212121] transition-colors duration-500">
            <Sidebar />
            <div className="ml-64 relative min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 p-10 pt-28">
                    {children}
                </main>
            </div>
        </div>
    );
}
