import { useState, createContext, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const FollowContext = createContext();

export function FollowProvider({ children }) {
    const [followedArtist, setFollowedArtist] = useState([]);
    const { user, openAuthModal } = useContext(AuthContext);

    useEffect(() => {
        if (!user) {
            setFollowedArtist([]);
            return;
        }
        fetch(`${import.meta.env.VITE_API_URL}/follows`, {
            credentials: 'include'
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFollowedArtist(data.map(a => a.slug));
                }
            })
            .catch(() => {});
    }, [user]);

    const toggleFollow = async (slug, artistId) => {
        if (!user) {
            openAuthModal();
            return;
        }
        const isFollowed = followedArtist.includes(slug);
        const method = isFollowed ? 'DELETE' : 'POST';

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/follows/${artistId}`, {
                method,
                credentials: 'include'
            });
            setFollowedArtist(prev =>
                isFollowed
                    ? prev.filter(s => s !== slug)
                    : [...prev, slug]
            );
        } catch (err) {
            console.error('Follow toggle error:', err);
        }
    };

    return (
        <FollowContext.Provider value={{ followedArtist, toggleFollow }}>
            {children}
        </FollowContext.Provider>
    );
}