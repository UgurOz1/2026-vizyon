import React, { useState } from 'react';
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) navigate('/');
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/');
        } catch (error) {
            setError(error.message.replace('Firebase:', '').trim());
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-romantic-300/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-200/40 rounded-full blur-[100px]" />

            <div className="glass-panel p-10 rounded-3xl w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-romantic-400 to-romantic-600 rounded-2xl shadow-lg mb-4 text-white transform rotate-3 hover:rotate-6 transition-transform">
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2 tracking-tight">
                        {isSignUp ? 'Aramıza Katıl' : 'Tekrar Hoşgeldin'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isSignUp ? 'Ortak geleceğinizi inşa etmeye başla.' : 'Hayallerinizi tasarlamaya devam et.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-500 text-xs rounded-lg border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">E-posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3 rounded-xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-romantic-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                            placeholder="askim@ornek.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 rounded-xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-romantic-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-romantic-500 to-romantic-600 text-white py-3.5 rounded-xl hover:shadow-lg hover:shadow-romantic-200 hover:-translate-y-0.5 transition-all font-medium text-lg flex items-center justify-center gap-2 group"
                    >
                        {isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}
                        <Sparkles size={18} className="group-hover:animate-pulse" />
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-gray-100/50">
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                        className="text-sm text-gray-400 hover:text-romantic-600 transition-colors"
                    >
                        {isSignUp ? 'Zaten hesabın var mı?' : 'Henüz hesabın yok mu?'}{' '}
                        <span className="font-semibold underline decoration-romantic-300 underline-offset-2">
                            {isSignUp ? 'Giriş Yap' : 'Kayıt Ol'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
