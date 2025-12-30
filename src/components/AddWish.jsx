import React, { useState } from 'react';
import { X, Sparkles, Calendar, ArrowRight, AlignLeft } from 'lucide-react';
import { db, auth } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export default function AddWish({ onClose, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [targetDate, setTargetDate] = useState(initialData?.targetDate || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) return;

        setIsSubmitting(true);
        try {
            const user = auth.currentUser;
            const userId = user ? user.uid : 'anonymous';
            const userEmail = user ? user.email : 'anonymous';

            if (initialData) {
                // Update Mode
                const wishRef = doc(db, 'wishes', initialData.id);
                await updateDoc(wishRef, {
                    title,
                    description,
                    targetDate: targetDate || null,
                    updatedAt: serverTimestamp()
                });
            } else {
                // Create Mode
                await addDoc(collection(db, 'wishes'), {
                    title,
                    description,
                    category: 'Diğer',
                    imageUrl: '',
                    targetDate: targetDate || null,
                    createdBy: userId,
                    authorEmail: userEmail,
                    createdAt: serverTimestamp(),
                    likes: [],
                    type: 'text',
                    comments: [],
                    isShared: false,
                    completed: false
                });
            }
            onClose();
        } catch (error) {
            console.error("Error saving document: ", error);
            alert("Hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col ring-4 ring-black/5">

                {/* Header Actions */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <div className="flex items-center gap-2 text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
                        <Sparkles size={16} className="fill-current" />
                        <span className="font-bold tracking-wide uppercase text-[10px]">Yeni Hedef</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-all border border-transparent hover:border-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 pt-4 space-y-8">

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Title Input - BOLDER & DARKER */}
                        <div className="space-y-4 text-center">
                            <input
                                type="text"
                                className="w-full text-4xl font-serif font-black text-slate-900 placeholder:text-slate-300 text-center outline-none bg-transparent transition-all tracking-tight"
                                placeholder="Hayalin ne?"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                autoFocus
                                required
                            />
                            {/* Decorative dynamic underline */}
                            <div className={`h-1.5 mx-auto rounded-full transition-all duration-500 ${title ? 'w-24 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-200' : 'w-12 bg-slate-100'}`} />
                        </div>

                        {/* Input Fields Container */}
                        <div className="space-y-4">

                            {/* Description Section with solid background */}
                            <div className="bg-slate-50 p-2 rounded-3xl border-2 border-slate-100 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50 focus-within:bg-white transition-all duration-300">
                                <div className="p-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-3 group-focus-within:text-violet-600 transition-colors">
                                        <AlignLeft size={14} className="text-violet-500" />
                                        <span>Detaylar</span>
                                    </label>
                                    <textarea
                                        className="w-full bg-transparent outline-none text-slate-800 font-medium text-base leading-relaxed placeholder:text-slate-400 resize-none h-24"
                                        placeholder="Bu hayali neden istiyorsun? Detayları buraya yaz..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Date Picker - Standard Visible Mode */}
                            <div className="bg-slate-50 p-2 rounded-3xl border-2 border-slate-100 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50 focus-within:bg-white transition-all duration-300">
                                <div className="p-4 flex flex-col gap-2">
                                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider group-focus-within:text-violet-600 transition-colors">
                                        <Calendar size={14} className="text-violet-500" />
                                        <span>Hedef Tarih</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full bg-white text-slate-800 font-bold text-lg p-3 rounded-xl border border-slate-200 outline-none focus:border-violet-500 focus:shadow-lg focus:shadow-violet-100 transition-all placeholder:text-slate-300"
                                        value={targetDate}
                                        onChange={e => setTargetDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button - Vibrant & Punchy */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-violet-200 hover:shadow-2xl hover:shadow-violet-300 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2 transition-all duration-300 border border-white/20"
                        >
                            {isSubmitting ? (
                                <Sparkles size={22} className="animate-spin text-white/50" />
                            ) : (
                                <>
                                    <span className="font-bold text-lg tracking-wide">Hayali Başlat</span>
                                    <ArrowRight size={20} className="text-white/70 group-hover:translate-x-1 group-hover:text-white transition-all" />
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
