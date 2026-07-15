import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const openAuthModal = () => setAuthModalOpen(true);
    const closeAuthModal = () => setAuthModalOpen(false);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            credentials: 'include'
        })
            .then(r => {
                if (!r.ok) return null;
                return r.json();
            })
            .then(data => {
                if (data?.user) setUser(data.user);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const login = (userData) => setUser(userData);
    const logout = () => {
        fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        }).then(() => setUser(null));
    };

    return (
        <AuthContext.Provider value={{
            user, loading, login, logout,
            authModalOpen, openAuthModal, closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);