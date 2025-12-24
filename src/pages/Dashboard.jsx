import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import WishCard from '../components/WishCard';
import AddWish from '../components/AddWish';
import PartnerConnect from '../components/PartnerConnect';
import Countdown from '../components/Countdown';
import TimelineView from '../components/TimelineView';
import CapsuleList from '../components/CapsuleList';
import { Plus, HeartHandshake, LogOut, UserPlus, Sparkles, Layout, Sun, Moon, Clock, Hourglass } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [partnerEmail, setPartnerEmail] = useState(null);
    const [darkMode, setDarkMode] = useState(true);
    const [editingWish, setEditingWish] = useState(null);

    useEffect(() => {
        const fetchPartner = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().partnerEmail) {
                    setPartnerEmail(userDoc.data().partnerEmail);
                }
            }
        };
        fetchPartner();

        const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const wishesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWishes(wishesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        auth.signOut();
        window.location.reload();
    };

    const filteredWishes = wishes.filter(wish => {
        const user = auth.currentUser;
        if (!user) return false;

        if (filter === 'Timeline') {
            const isVisible = wish.createdBy === user.uid || (partnerEmail && wish.authorEmail === partnerEmail);
            return isVisible;
        }

        if (filter === 'Capsules') return true; // Handled nicely by component itself

        if (filter === 'all') {
            return wish.createdBy === user.uid || (partnerEmail && wish.authorEmail === partnerEmail);
        }
        if (filter === 'My Wishes') return wish.createdBy === user.uid;
        if (filter === 'Your Wishes') return partnerEmail && wish.authorEmail === partnerEmail;
        if (filter === 'Our Common Goals') {
            const isVisible = wish.createdBy === user.uid || (partnerEmail && wish.authorEmail === partnerEmail);
            return isVisible && (wish.isShared === true || (wish.likes && wish.likes.length > 1));
        }
        return true;
    });

    return (
        <div className={`min-h-screen transition-colors duration-700 ease-in-out font-sans selection:bg-violet-500/30 ${darkMode ? 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100' : 'bg-[#FDFCFD] text-slate-800'}`}>
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: darkMode ? '#1e293b' : '#fff',
                    color: darkMode ? '#fff' : '#334155',
                    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                },
            }} />

            {/* Header */}
            <header className={`sticky top-0 z-40 transition-all duration-500 ${darkMode ? 'bg-slate-950/70 border-slate-800/50 backdrop-blur-xl' : 'bg-white/70 border-white/50 backdrop-blur-md'}`}>
                <div className="container mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className={`p-2.5 rounded-2xl transition-transform duration-500 group-hover:rotate-12 ${darkMode ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/5' : 'bg-white shadow-sm'}`}>
                            <Layout size={26} className={darkMode ? "text-violet-400" : "text-romantic-500"} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white">
                                2026 Vizyonu
                            </h1>
                            <p className={`text-xs font-medium tracking-widest uppercase opacity-60 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Birlikte İnşa Edelim
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsInviteOpen(true)}
                            className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${partnerEmail
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : darkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm border border-slate-100'}`}
                        >
                            {partnerEmail ? (
                                <>
                                    <HeartHandshake size={16} />
                                    <span className="hidden sm:inline">Partner</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    <span className="hidden sm:inline">Davet Et</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setEditingWish(null);
                                setIsAddModalOpen(true);
                            }}
                            className="group flex items-center gap-3 bg-white text-slate-950 pl-2 pr-6 py-2 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div className="bg-slate-950 text-white p-2 rounded-full group-hover:rotate-90 transition-transform duration-500">
                                <Plus size={16} />
                            </div>
                            <span className="font-bold text-sm tracking-wide hidden sm:inline">Yeni Ekle</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className={`p-3 rounded-full transition-colors ${darkMode ? 'text-slate-600 hover:text-red-400 hover:bg-white/5' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                            title="Çıkış Yap"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 pt-10">
                <Countdown darkMode={darkMode} />
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-12 px-4 relative z-10">
                <div className={`p-2 rounded-full border inline-flex overflow-x-auto max-w-full gap-1 ${darkMode ? 'bg-slate-950/50 border-white/5 backdrop-blur-2xl' : 'bg-white/60 backdrop-blur-md border-white/50'}`}>
                    {['all', 'My Wishes', 'Your Wishes', 'Our Common Goals', 'Timeline', 'Capsules'].map((tab) => {
                        const isActive = filter === tab;
                        let label = '';
                        if (tab === 'all') label = 'Tümü';
                        if (tab === 'My Wishes') label = 'Benimkiler';
                        if (tab === 'Your Wishes') label = 'Onunkiler';
                        if (tab === 'Our Common Goals') label = 'Ortak';
                        if (tab === 'Timeline') label = 'Zaman Tüneli';
                        if (tab === 'Capsules') label = 'Zaman Kapsülü';

                        return (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-500 whitespace-nowrap ${isActive
                                    ? darkMode ? 'bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white text-romantic-600 shadow-md ring-1 ring-black/5'
                                    : darkMode ? 'text-slate-500 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab === 'Timeline' && <Clock size={14} className="inline mr-2 -mt-0.5" />}
                                {tab === 'Capsules' && <Hourglass size={14} className="inline mr-2 -mt-0.5" />}
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 pb-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50">
                        <Sparkles size={48} className="animate-spin text-romantic-400 mb-4" />
                        <span className="font-serif text-lg">Vizyon yükleniyor...</span>
                    </div>
                ) : filter === 'Timeline' ? (
                    <TimelineView wishes={filteredWishes} darkMode={darkMode} />
                ) : filter === 'Capsules' ? (
                    <CapsuleList darkMode={darkMode} partnerEmail={partnerEmail} />
                ) : filteredWishes.length === 0 ? (
                    <div className={`text-center py-20 rounded-3xl border border-dashed mx-auto max-w-2xl ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/40 border-romantic-200/50'}`}>
                        <div className={`inline-block p-4 rounded-full shadow-sm mb-4 ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
                            <Sparkles size={32} className="text-romantic-300" />
                        </div>
                        <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {filter === 'Your Wishes' && !partnerEmail ? "Önce partnerini bağlamalısın!" : "Buralar biraz sessiz..."}
                        </h3>
                        <p className={`max-w-md mx-auto ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            {filter === 'Your Wishes' && !partnerEmail
                                ? "Yukarıdaki 'Partner Bağla' butonuna tıklayarak onun hayallerini burada görebilirsin."
                                : "2026 için ilk hayalini ekleyerek başla. Birlikte neleri başarmak istiyorsunuz?"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                        {filteredWishes.map(wish => (
                            <WishCard
                                key={wish.id}
                                wish={wish}
                                darkMode={darkMode}
                                isSharedView={filter === 'Our Common Goals' || wish.isShared}
                                onEdit={(wish) => {
                                    setEditingWish(wish);
                                    setIsAddModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )
                }
            </main >

            {isAddModalOpen && (
                <AddWish
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingWish(null);
                    }}
                    initialData={editingWish}
                />
            )}
            {isInviteOpen && <PartnerConnect onClose={() => setIsInviteOpen(false)} onConnect={(email) => setPartnerEmail(email)} />}
        </div >
    );
}
