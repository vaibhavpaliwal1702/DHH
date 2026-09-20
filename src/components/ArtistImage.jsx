import { useState } from 'react';
import '../styles/Skeleton.css';
import '../styles/ArtistImage.css';

// Seeded artists point at a placeholder file that isn't shipped in /public,
// so skip the request and go straight to the generated placeholder.
const hasRealImage = (src) => Boolean(src) && !/placeholder\./i.test(src);

const getInitials = (name = '') => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
};

const getHue = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % 360;
};

function ArtistImage({ src, name, className = '' }) {
    // Track results per src so a changed src starts over as 'loading' without an effect.
    const [loadedSrc, setLoadedSrc] = useState(null);
    const [failedSrc, setFailedSrc] = useState(null);

    let status = 'loading';
    if (!hasRealImage(src) || failedSrc === src) status = 'error';
    else if (loadedSrc === src) status = 'loaded';

    const hue = getHue(name);
    const placeholderStyle = {
        background: `linear-gradient(135deg, hsl(${hue} 55% 34%), hsl(${(hue + 40) % 360} 55% 18%))`,
    };

    return (
        <div className={`artist-image ${className}`.trim()}>
            {status !== 'error' && (
                <img
                    src={src}
                    alt={name}
                    className={`artist-image__img ${status === 'loaded' ? 'is-loaded' : ''}`.trim()}
                    loading="lazy"
                    onLoad={() => setLoadedSrc(src)}
                    onError={() => setFailedSrc(src)}
                />
            )}
            {status === 'loading' && <div className="skeleton artist-image__skeleton" aria-hidden="true" />}
            {status === 'error' && (
                <div className="artist-image__placeholder" style={placeholderStyle} role="img" aria-label={name}>
                    <span>{getInitials(name)}</span>
                </div>
            )}
        </div>
    );
}

export default ArtistImage;
