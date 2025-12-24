import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, Save, Check, Sparkles, AlertCircle } from 'lucide-react';
import { db, auth } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function PartnerConnect({ onClose, onConnect }) {
    const [partnerEmail, setPartnerEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [currentPartner, setCurrentPartner] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            if (!auth.currentUser) return;
            const docRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().partnerEmail) {
                setCurrentPartner(docSnap.data().partnerEmail);
                setPartnerEmail(docSnap.data().partnerEmail);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!partnerEmail.trim()) return;

        setIsSaving(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Save to users collection
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                partnerEmail: partnerEmail.trim().toLowerCase()
            }, { merge: true });

            setCurrentPartner(partnerEmail.trim().toLowerCase());
            if (onConnect) onConnect(partnerEmail.trim().toLowerCase());

            // Optional: Close automatically or show success
        } catch (error) {
            console.error("Error saving partner:", error);
            alert("Partner bağlantısı kurulamadı.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col ring-4 ring-black/5">

                {/* Header Actions */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <div className="flex items-center gap-2 text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
                        <HeartHandshake size={16} className="fill-current" />
                        <span className="font-bold tracking-wide uppercase text-[10px]">İletişim & Bağlantı</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-all border border-transparent hover:border-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 pt-2 space-y-6">

                    <div className="text-center space-y-2 mb-4">
                        <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Partnerini Ekle</h2>
                        <p className="text-slate-500 font-medium">Birlikte vizyon oluşturmak için partnerinin email adresini gir.</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-slate-50 p-2 rounded-3xl border-2 border-slate-100 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50 focus-within:bg-white transition-all duration-300">
                            <div className="p-4">
                                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-violet-600 transition-colors">
                                    <Sparkles size={14} className="text-violet-500" />
                                    <span>Partner Email</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={partnerEmail}
                                    onChange={e => setPartnerEmail(e.target.value)}
                                    placeholder="partner@ornek.com"
                                    className="w-full bg-transparent outline-none text-slate-900 font-bold text-lg placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-violet-200 hover:shadow-2xl hover:shadow-violet-300 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2 transition-all duration-300 border border-white/20"
                        >
                            {isSaving ? (
                                <Sparkles size={22} className="animate-spin text-white/50" />
                            ) : (
                                <>
                                    <span className="font-bold text-lg tracking-wide">{currentPartner ? 'Bağlantıyı Güncelle' : 'Partneri Bağla'}</span>
                                    <Save size={20} className="text-white/70 group-hover:translate-x-1 group-hover:text-white transition-all" />
                                </>
                            )}
                        </button>
                    </form>

                    {currentPartner && (
                        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                            <div className="bg-emerald-200/50 p-2 rounded-full text-emerald-600">
                                <Check size={18} strokeWidth={3} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">Aktif Bağlantı</span>
                                <span className="font-bold text-sm tracking-tight">{currentPartner}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
