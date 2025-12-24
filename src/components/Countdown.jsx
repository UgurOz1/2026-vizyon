import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function Countdown({ darkMode }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const year = new Date().getFullYear();
        const difference = +new Date(`01/01/${2026}`) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                gün: Math.floor(difference / (1000 * 60 * 60 * 24)),
                saat: Math.floor((difference / (1000 * 60 * 60)) % 24),
                dakika: Math.floor((difference / 1000 / 60) % 60),
                saniye: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval]) {
            // Show 0s if we want fixed width, but let's just push value
            timerComponents.push(
                <div key={interval} className="flex flex-col items-center mx-2">
                    <span className={`text-2xl md:text-3xl font-bold font-serif ${darkMode ? 'text-romantic-300' : 'text-romantic-600'}`}>00</span>
                    <span className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{interval}</span>
                </div>
            );
            return;
        }

        timerComponents.push(
            <div key={interval} className="flex flex-col items-center mx-2 min-w-[50px]">
                <span className={`text-2xl md:text-3xl font-bold font-serif ${darkMode ? 'text-romantic-300' : 'text-romantic-600'}`}>
                    {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
                </span>
                <span className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{interval}</span>
            </div>
        );
    });

    return (
        <div className="flex flex-col items-center justify-center mb-10 relative z-10">
            <div className={`text-[10px] font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-3 ${darkMode ? 'text-violet-300/50' : 'text-slate-400'}`}>
                <div className="h-px w-8 bg-current opacity-50"></div>
                <span>Vizyona Kalan</span>
                <div className="h-px w-8 bg-current opacity-50"></div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                {Object.keys(timeLeft).length ? Object.keys(timeLeft).map((interval) => (
                    <div key={interval} className={`flex flex-col items-center justify-center w-20 h-24 sm:w-24 sm:h-28 rounded-3xl border backdrop-blur-md transition-all duration-300 group hover:-translate-y-1 ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]' : 'bg-white border-white/80 shadow-lg shadow-slate-200/50'}`}>
                        <span className={`text-3xl sm:text-4xl font-black font-sans tracking-tight mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500 group-hover:text-violet-300 transition-colors' : 'text-slate-400'}`}>
                            {interval}
                        </span>
                    </div>
                )) : (
                    <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur text-center">
                        <span className="text-2xl font-black text-emerald-400">2026 GELDİ! 🎉</span>
                    </div>
                )}
            </div>
        </div>
    );
}
