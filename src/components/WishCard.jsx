import React from 'react';
import { Heart, MessageCircle, CheckCircle2, Circle, Sparkles, Lock, ArrowRightLeft, Calendar, Pencil, Trash2 } from 'lucide-react';
import { db, auth } from '../services/firebaseConfig';
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function WishCard({ wish, darkMode, isSharedView, onEdit }) {
    const [showComments, setShowComments] = React.useState(false);
    const [newComment, setNewComment] = React.useState('');
    const isCompleted = wish.completed;
    const user = auth.currentUser;

    const handleToggleComplete = async (e) => {
        e.stopPropagation();

        if (!user) return;

        const isOwner = user.uid === wish.createdBy;
        const isShared = wish.isShared;

        // Privacy Check: Only owner or shared users can toggle
        if (!isOwner && !isShared) {
            toast.error("Bu hayal kişiye özel! Sadece sahibi tamamlayabilir. 🔒");
            return;
        }

        const wishRef = doc(db, 'wishes', wish.id);
        try {
            const newState = !isCompleted;
            await updateDoc(wishRef, { completed: newState });

            if (newState) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                toast.success("Tebrikler! Bir hayali gerçekleştirdiniz! 🎉");
            }
        } catch (error) {
            console.error("Error toggling complete", error);
            toast.error("Bir hata oluştu.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bu hayali silmek istediğine emin misin?")) return;

        try {
            await deleteDoc(doc(db, 'wishes', wish.id));
            toast.success("Hayal silindi.");
        } catch (error) {
            console.error("Error deleting wish:", error);
            toast.error("Silinirken bir hata oluştu.");
        }
    };

    const handleConvertToShared = async () => {
        const wishRef = doc(db, 'wishes', wish.id);
        try {
            await updateDoc(wishRef, { isShared: true });
            toast.success("Bu hayal artık Ortak Hedeflerinize eklendi! 💑");
        } catch (error) {
            toast.error("Hata oluştu.");
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!user) return toast.error("Giriş yapmalısın.");

        try {
            const wishRef = doc(db, 'wishes', wish.id);
            await updateDoc(wishRef, {
                comments: arrayUnion({
                    text: newComment,
                    userId: user.uid,
                    createdAt: Date.now()
                })
            });
            setNewComment('');
        } catch (error) {
            console.error("Error adding comment", error);
        }
    };

    const handleLike = async () => {
        if (!user) return toast.error("Giriş yapmalısın.");

        const wishRef = doc(db, 'wishes', wish.id);
        const isLiked = wish.likes?.includes(user.uid);

        try {
            await updateDoc(wishRef, {
                likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
        } catch (err) {
            console.error("Error liking wish:", err);
        }
    };

    // Card Styling Logic
    const isOwner = user?.uid === wish.createdBy;
    const cardBaseClass = isCompleted
        ? "opacity-80 grayscale-[0.3] hover:grayscale-0 ring-2 ring-emerald-500/20"
        : darkMode
            ? "bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-violet-500/30 hover:bg-slate-900/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
            : "bg-white border-slate-100 hover:border-romantic-300 hover:shadow-xl hover:shadow-romantic-100/50";

    return (
        <div className={`relative rounded-[2rem] overflow-hidden transition-all duration-300 group flex flex-col h-full hover:-translate-y-2 ${cardBaseClass}`}>

            {/* Image Header (Decorative) */}
            <div className={`h-32 relative overflow-hidden group-hover:h-36 transition-all duration-500`}>
                {wish.imageUrl ? (
                    <img src={wish.imageUrl} alt={wish.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isCompleted ? 'bg-emerald-100' : 'bg-gradient-to-tr from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20'}`}>
                        <span className="text-6xl opacity-10 font-serif font-black mix-blend-overlay">{wish.category.charAt(0)}</span>
                    </div>
                )}

                {/* header actions overlay */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {/* Move to Shared Button (Only for owner, if not already shared) */}
                    {isOwner && !wish.isShared && !isSharedView && (
                        <button
                            onClick={handleConvertToShared}
                            className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-romantic-500 transition-colors"
                            title="Ortak Vizyona Taşı"
                        >
                            <ArrowRightLeft size={16} />
                        </button>
                    )}

                    {isOwner && (
                        <>
                            <button
                                onClick={() => onEdit(wish)}
                                className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-blue-500 transition-colors"
                                title="Düzenle"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                                title="Sil"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}

                    <button
                        onClick={handleToggleComplete}
                        className={`p-2 rounded-full transition-all duration-300 backdrop-blur-md shadow-lg ${isCompleted
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-black/20 text-white hover:bg-white hover:text-green-500'}`}
                        title={isCompleted ? "Tamamlanmadı" : "Tamamlandı"}
                    >
                        {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                </div>

                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md shadow-sm border border-white/10 text-white bg-black/20`}>
                        {wish.category}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className={`p-6 flex-1 flex flex-col ${darkMode ? 'bg-transparent' : 'bg-white'}`}>

                {/* Title Section */}
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        {wish.isShared && (
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <Sparkles size={10} />
                                <span>ORTAK</span>
                            </div>
                        )}
                    </div>
                    <h3 className={`font-serif text-2xl font-bold leading-tight ${isCompleted ? 'line-through opacity-50' : ''} ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {wish.title}
                    </h3>
                </div>

                <p className={`text-sm leading-relaxed line-clamp-3 mb-6 flex-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {wish.description || "Henüz bir açıklama eklenmemiş..."}
                </p>

                {/* Target Date Custom Badge */}
                {wish.targetDate && (
                    <div className={`mb-5 flex items-center gap-3 p-3 rounded-xl border transition-colors ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? 'bg-violet-500/10 text-violet-400' : 'bg-white text-romantic-500 shadow-sm'}`}>
                            <Calendar size={16} />
                        </div>
                        <div>
                            <span className={`block text-[9px] font-black uppercase tracking-widest mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hedef Tarih</span>
                            <span className={`font-serif font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                {new Date(wish.targetDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className={`flex items-center justify-between pt-4 mt-auto border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex gap-2">
                        <button
                            onClick={handleLike}
                            className={`group flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-full ${wish.likes?.includes(auth.currentUser?.uid) ? "text-rose-500 bg-rose-500/10" : "text-slate-500 hover:bg-white/5 hover:text-rose-400"}`}
                        >
                            <Heart size={16} className={`transition-transform duration-300 group-hover:scale-110 ${wish.likes?.includes(auth.currentUser?.uid) ? "fill-current" : ""}`} />
                            <span>{wish.likes?.length || 0}</span>
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`group flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-full ${showComments ? "text-violet-400 bg-violet-500/10" : "text-slate-500 hover:bg-white/5 hover:text-violet-400"}`}
                        >
                            <MessageCircle size={16} className="transition-transform duration-300 group-hover:scale-110" />
                            <span>{wish.comments?.length || 0}</span>
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {wish.comments?.map((comment, idx) => (
                                <div key={idx} className={`p-3 rounded-2xl rounded-tl-none text-xs leading-relaxed ${darkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                                    {comment.text}
                                </div>
                            ))}
                            {(!wish.comments || wish.comments.length === 0) && (
                                <p className="text-xs text-slate-500 text-center italic py-2">İlk yorumu sen yaz...</p>
                            )}
                        </div>
                        <form onSubmit={handleAddComment} className="flex gap-2 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Yorum yaz..."
                                className={`flex-1 text-xs py-3 pl-4 pr-12 rounded-xl outline-none transition-all ${darkMode ? 'bg-black/20 text-white placeholder:text-slate-600 focus:bg-black/40' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-white/10 text-white rounded-lg text-[10px] font-bold hover:bg-violet-600 transition-colors"
                            >
                                GÖNDER
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
