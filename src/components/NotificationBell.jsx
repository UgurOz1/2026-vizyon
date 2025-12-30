import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, X, Check } from 'lucide-react';
import {
    requestNotificationPermission,
    getNotificationPermissionStatus,
    onForegroundMessage,
    showLocalNotification
} from '../services/notificationService';
import toast from 'react-hot-toast';

export default function NotificationBell({ darkMode }) {
    const [permission, setPermission] = useState('default');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Check current permission status
        const status = getNotificationPermissionStatus();
        setPermission(status);

        // Load stored notifications
        const stored = localStorage.getItem('notifications');
        if (stored) {
            const parsed = JSON.parse(stored);
            setNotifications(parsed);
            setUnreadCount(parsed.filter(n => !n.read).length);
        }

        // Listen for foreground messages
        if (status === 'granted') {
            const unsubscribe = onForegroundMessage((payload) => {
                const notification = {
                    id: Date.now(),
                    title: payload.notification?.title || 'Bildirim',
                    body: payload.notification?.body || '',
                    timestamp: new Date().toISOString(),
                    read: false
                };

                setNotifications(prev => {
                    const updated = [notification, ...prev].slice(0, 20);
                    localStorage.setItem('notifications', JSON.stringify(updated));
                    return updated;
                });
                setUnreadCount(prev => prev + 1);

                // Show local notification
                showLocalNotification(notification.title, { body: notification.body });
            });

            return () => {
                if (typeof unsubscribe === 'function') unsubscribe();
            };
        }
    }, []);

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        try {
            const result = await requestNotificationPermission();
            setPermission(result.status);

            if (result.status === 'granted') {
                toast.success('Bildirimler etkinleştirildi! 🔔');
            } else if (result.status === 'denied') {
                toast.error('Bildirim izni reddedildi. Tarayıcı ayarlarından etkinleştirebilirsiniz.');
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            toast.error('Bildirimler etkinleştirilemedi.');
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev => {
            const updated = prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
        localStorage.removeItem('notifications');
    };

    const getIcon = () => {
        if (permission === 'denied' || permission === 'unsupported') {
            return <BellOff size={20} />;
        }
        if (unreadCount > 0) {
            return <BellRing size={20} className="animate-pulse" />;
        }
        return <Bell size={20} />;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Az önce';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`relative p-3 rounded-full transition-all ${darkMode
                        ? 'text-slate-400 hover:text-white hover:bg-white/10'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
            >
                {getIcon()}

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden border animate-in fade-in slide-in-from-top-2 duration-200 ${darkMode
                            ? 'bg-slate-900 border-white/10'
                            : 'bg-white border-slate-200'
                        }`}>
                        {/* Header */}
                        <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? 'border-white/10' : 'border-slate-100'
                            }`}>
                            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                Bildirimler
                            </h3>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${darkMode
                                                ? 'text-slate-400 hover:bg-white/10'
                                                : 'text-slate-500 hover:bg-slate-100'
                                            }`}
                                    >
                                        Tümünü Okundu İşaretle
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-80 overflow-y-auto">
                            {permission !== 'granted' ? (
                                <div className="p-6 text-center">
                                    <div className={`inline-flex p-4 rounded-full mb-4 ${darkMode ? 'bg-white/5' : 'bg-slate-100'
                                        }`}>
                                        <BellOff size={32} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
                                    </div>
                                    <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {permission === 'denied'
                                            ? 'Bildirimler engellenmiş. Tarayıcı ayarlarından açabilirsiniz.'
                                            : permission === 'unsupported'
                                                ? 'Tarayıcınız bildirimleri desteklemiyor.'
                                                : 'Hedef hatırlatmaları ve partner güncellemeleri için bildirimleri etkinleştirin.'}
                                    </p>
                                    {permission === 'default' && (
                                        <button
                                            onClick={handleEnableNotifications}
                                            disabled={isLoading}
                                            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? 'Etkinleştiriliyor...' : 'Bildirimleri Etkinleştir'}
                                        </button>
                                    )}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell size={32} className={`mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                    <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Henüz bildirim yok
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`px-4 py-3 border-b cursor-pointer transition-colors ${darkMode
                                                    ? `border-white/5 ${notification.read ? 'bg-transparent' : 'bg-violet-500/10'}`
                                                    : `border-slate-50 ${notification.read ? 'bg-white' : 'bg-violet-50'}`
                                                } hover:${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full flex-shrink-0 ${notification.read
                                                        ? (darkMode ? 'bg-white/5' : 'bg-slate-100')
                                                        : 'bg-violet-500/20'
                                                    }`}>
                                                    {notification.read ? (
                                                        <Check size={14} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
                                                    ) : (
                                                        <Bell size={14} className="text-violet-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'
                                                        }`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={`text-xs mt-0.5 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'
                                                        }`}>
                                                        {notification.body}
                                                    </p>
                                                    <p className={`text-[10px] mt-1 ${darkMode ? 'text-slate-600' : 'text-slate-400'
                                                        }`}>
                                                        {formatTime(notification.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className={`px-4 py-2 border-t ${darkMode ? 'border-white/10' : 'border-slate-100'
                                }`}>
                                <button
                                    onClick={clearNotifications}
                                    className={`w-full text-center text-xs font-medium py-2 rounded-lg transition-colors ${darkMode
                                            ? 'text-red-400 hover:bg-red-500/10'
                                            : 'text-red-500 hover:bg-red-50'
                                        }`}
                                >
                                    Tümünü Temizle
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
