import React, { useState } from 'react';
import { X, Send, Lock, Calendar, Heart } from 'lucide-react';
import { db, auth } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function CreateCapsule({ onClose, partnerEmail }) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !message || !unlockDate) {
            toast.error("Lütfen tüm alanları doldur.");
            return;
        }

        setIsSubmitting(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            await addDoc(collection(db, 'capsules'), {
                title,
                message,
                unlockDate: new Date(unlockDate).toISOString(),
                senderId: user.uid,
                senderEmail: user.email,
                receiverEmail: partnerEmail || 'self', // If not connected, it's for self
                createdAt: serverTimestamp(),
                isRead: false
            });

            toast.success("Zaman kapsülü mühürlendi! 🔒");
            onClose();
        } catch (error) {
            console.error("Error creating capsule:", error);
            toast.error("Hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col ring-4 ring-black/5">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                        <Lock size={16} className="fill-current" />
                        <span className="font-bold tracking-wide uppercase text-[10px]">Zaman Kapsülü</span>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 pt-4 space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-serif font-black text-slate-900">Geleceğe Not</h2>
                        <p className="text-slate-500 font-medium text-sm">Bu mektup seçtiğin tarihe kadar kilitli kalacak.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Title */}
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus-within:border-rose-300 focus-within:bg-white transition-all">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Başlık</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Örn: 1. Yıl Dönümümüz İçin..."
                                className="w-full bg-transparent outline-none text-slate-900 font-bold"
                            />
                        </div>

                        {/* Message */}
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus-within:border-rose-300 focus-within:bg-white transition-all">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Mektubun</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="İçinden geçenleri yaz..."
                                className="w-full bg-transparent outline-none text-slate-800 font-medium h-32 resize-none"
                            />
                        </div>

                        {/* Date Picker */}
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus-within:border-rose-300 focus-within:bg-white transition-all">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                <Calendar size={14} className="text-rose-400" />
                                <span>Açılacağı Tarih</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={unlockDate}
                                onChange={e => setUnlockDate(e.target.value)}
                                className="w-full bg-transparent outline-none text-slate-900 font-bold"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl shadow-lg shadow-rose-200 hover:translate-y-[-2px] hover:shadow-xl transition-all flex items-center justify-center gap-2 font-bold tracking-wide"
                        >
                            {isSubmitting ? "Mühürleniyor..." : "Mühürle ve Gönder"}
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
