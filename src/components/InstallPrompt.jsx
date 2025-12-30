import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt({ darkMode }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if dismissed before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
            return; // Don't show for 7 days after dismissal
        }

        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show after a small delay for better UX
            setTimeout(() => setShowPrompt(true), 3000);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        setShowPrompt(false);
    };

    if (!showPrompt || isInstalled) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className={`relative rounded-2xl p-4 shadow-2xl border backdrop-blur-xl ${darkMode
                    ? 'bg-slate-900/95 border-white/10 shadow-violet-500/10'
                    : 'bg-white/95 border-slate-200 shadow-slate-200/50'
                }`}>
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${darkMode
                            ? 'hover:bg-white/10 text-slate-400'
                            : 'hover:bg-slate-100 text-slate-400'
                        }`}
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl flex-shrink-0 ${darkMode
                            ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10'
                            : 'bg-gradient-to-br from-violet-100 to-fuchsia-100'
                        }`}>
                        <Smartphone size={24} className={darkMode ? 'text-violet-400' : 'text-violet-600'} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pr-4">
                        <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            Uygulamayı Kur
                        </h3>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Ana ekrana ekle, hızlı erişim ve offline kullanım için.
                        </p>

                        <button
                            onClick={handleInstall}
                            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <Download size={16} />
                            <span>Şimdi Kur</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
