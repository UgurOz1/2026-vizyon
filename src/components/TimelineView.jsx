import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';

export default function TimelineView({ wishes, darkMode }) {
    // Filter wishes that have a target date and sort them chronologically (Earliest first)
    const sortedWishes = [...wishes]
        .filter(wish => wish.targetDate)
        .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));

    // Group by Month/Year
    const groupedWishes = sortedWishes.reduce((groups, wish) => {
        const date = new Date(wish.targetDate);
        // Use Turkish locale for month names if possible, or default
        const key = date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(wish);
        return groups;
    }, {});

    return (
        <div className="max-w-4xl mx-auto py-8">
            {Object.keys(groupedWishes).map((month, index) => (
                <div key={index} className="relative">
                    {/* Month Header - Mobile: Top, Desktop: Left Sticky */}
                    <div className={`mb-6 md:mb-0 md:absolute md:left-0 md:w-1/2 md:pr-12 md:text-right`}>
                        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-800 text-romantic-300' : 'bg-white text-romantic-600 shadow-sm border border-romantic-100'}`}>
                            {month}
                        </span>
                    </div>

                    {/* Timeline Content */}
                    <div className="pl-6 md:ml-[50%] md:pl-12 border-l-2 border-slate-200/50 dark:border-slate-700/50 pb-12 last:border-0 relative space-y-8 ml-4 md:ml-auto">
                        {groupedWishes[month].map(wish => (
                            <div key={wish.id} className="relative">
                                {/* Dot on the line */}
                                <div className={`absolute -left-[31px] md:-left-[55px] top-6 w-4 h-4 rounded-full border-4 transition-colors z-10 ${wish.completed ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900' : 'bg-white dark:bg-slate-900 border-romantic-300'}`}></div>

                                <div className={`p-4 rounded-2xl border transition-all hover:shadow-lg group ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-romantic-500' : 'bg-white border-slate-100 hover:border-romantic-200'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${darkMode ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {wish.category}
                                        </span>
                                        {wish.completed && <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><Sparkles size={10} /> Tamamlandı</span>}
                                    </div>
                                    <h4 className={`font-serif text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{wish.title}</h4>
                                    {wish.imageUrl && (
                                        <div className="h-32 w-full rounded-lg overflow-hidden my-3">
                                            <img src={wish.imageUrl} alt={wish.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <p className={`text-xs line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{wish.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {sortedWishes.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <Calendar size={48} className="mx-auto mb-4 text-slate-400" />
                    <p>Zaman tüneline eklenecek hedeflerinize tarih ekleyin.</p>
                </div>
            )}
        </div>
    );
}
