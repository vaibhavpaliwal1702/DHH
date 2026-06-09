import { useState, createContext } from "react";

export const FollowContext = createContext();

export function FollowProvider({ children }) {
    const [followedArtist, setFollowedArtist] = useState([]);

    const toggleFollow = (slug) => {
        setFollowedArtist((prev) =>
            prev.includes(slug)
                ? prev.filter((item) => item !== slug)
                : [...prev, slug]
        );
    };
    return (
        <FollowContext.Provider value={{ followedArtist, toggleFollow }}>
            {children}
        </FollowContext.Provider>
    );
}