import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Lock, Unlock, Mail, Clock, Send, Sparkles, X } from 'lucide-react';
import CreateCapsule from './CreateCapsule';

export default function CapsuleList({ darkMode, partnerEmail }) {
    const [capsules, setCapsules] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedCapsule, setSelectedCapsule] = useState(null);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;

        // Simple query: fetch all capsules involves me
        // Firestore OR queries are tricky, let's fetch two streams or just filter client side if small data?
        // Let's fetch where receiver is ME. 
        // And separate where sender is ME.
        // For simplicity in this session, let's fetch 'capsules' collection and filter client side. 
        // (Not performant for millions, but fine for 2 lovers).

        const q = query(collection(db, 'capsules'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Filter: involved me
            const mine = all.filter(c => c.senderId === user.uid || c.receiverEmail === user.email);
            setCapsules(mine);
        });

        return () => unsubscribe();
    }, [user]);

    const getTimeRemaining = (unlockDateStr) => {
        const total = Date.parse(unlockDateStr) - Date.now();
        if (total <= 0) return null;
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        return `${days} gün ${hours} saat`;
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            {/* Header Action */}
            <div className="flex justify-center mb-10">
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-full shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-1 overflow-hidden"
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-orange-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Send className="relative z-10 w-5 h-5 -ml-1 transform -rotate-12 group-hover:rotate-0 transition-transform" />
                    <span className="relative z-10 text-sm tracking-wide">Geleceğe Mektup Yaz</span>
                </button>
            </div>

            {capsules.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <Mail size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Henüz hiç kapsül oluşturulmamış.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {capsules.map(capsule => {
                        const isLocked = new Date(capsule.unlockDate) > new Date();
                        const timeText = getTimeRemaining(capsule.unlockDate);
                        const isMine = capsule.senderId === user.uid;

                        return (
                            <div
                                key={capsule.id}
                                onClick={() => !isLocked && setSelectedCapsule(capsule)}
                                className={`relative group rounded-[2rem] p-6 border transition-all duration-300 cursor-pointer overflow-hidden
                                    ${darkMode
                                        ? 'bg-slate-900/40 border-white/5 hover:border-rose-500/30'
                                        : 'bg-white border-slate-100 hover:border-rose-200 hover:shadow-xl'}
                                    ${isLocked ? 'opacity-70 hover:opacity-100' : 'hover:-translate-y-1'}
                                `}
                            >
                                {/* Background Glow for Unlocked */}
                                {!isLocked && (
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full group-hover:bg-rose-500/30 transition-colors" />
                                )}

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`p-3 rounded-2xl ${isLocked ? (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400') : 'bg-rose-500 text-white shadow-lg shadow-rose-200'}`}>
                                        {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${isMine
                                        ? (darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500')
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                        {isMine ? 'Giden' : 'Gelen'}
                                    </span>
                                </div>

                                <h3 className={`font-serif text-xl font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {capsule.title}
                                </h3>

                                <div className="space-y-3 mt-4">
                                    <div className={`flex items-center gap-2 text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <Clock size={14} />
                                        {isLocked ? (
                                            <span>Mühür açılıyor: <span className="text-rose-400 ml-1">{timeText}</span></span>
                                        ) : (
                                            <span className="text-emerald-500">Mühür Açıldı! Okumak için tıkla.</span>
                                        )}
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <Mail size={14} />
                                        <span>Kime: {isMine ? (capsule.receiverEmail === user.email ? 'Kendime' : capsule.receiverEmail) : 'Bana'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isCreateOpen && (
                <CreateCapsule
                    onClose={() => setIsCreateOpen(false)}
                    partnerEmail={partnerEmail}
                />
            )}

            {/* Read Capsule Modal */}
            {selectedCapsule && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden relative">
                        <button
                            onClick={() => setSelectedCapsule(null)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="h-32 bg-gradient-to-r from-rose-400 to-orange-400 flex items-center justify-center">
                            <Mail size={48} className="text-white drop-shadow-lg" />
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="text-center mb-8">
                                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 block">Gelecekten Mesaj</span>
                                <h2 className="text-3xl font-serif font-black text-slate-800">{selectedCapsule.title}</h2>
                                <p className="text-slate-400 text-sm mt-2">
                                    {new Date(selectedCapsule.createdAt.toDate()).toLocaleDateString()} tarihinde yazıldı.
                                </p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-loose font-medium text-lg whitespace-pre-wrap font-serif">
                                {selectedCapsule.message}
                            </div>

                            <div className="mt-8 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold">
                                    <Sparkles size={16} />
                                    <span>Bu anı yakaladın!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
