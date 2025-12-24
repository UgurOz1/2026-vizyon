import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function PrivateRoute({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-romantic-50">
                <div className="animate-pulse text-romantic-400 text-xl font-serif">Loading our dreams...</div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
}
