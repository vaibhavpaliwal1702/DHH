import '../styles/ArtistCard.css';
import '../styles/Skeleton.css';

// Mirrors ArtistCard's markup and classes so the layout doesn't shift when data arrives.
function ArtistCardSkeleton() {
    return (
        <div className="artist-card artist-card--skeleton" aria-hidden="true">
            <div className="artist-skeleton-link">
                <div className="artist-img skeleton-img-wrap">
                    <div className="skeleton skeleton-fill" />
                </div>
                <div className="skeleton artist-skeleton-name" />
            </div>
            <div className="skeleton artist-skeleton-btn" />
        </div>
    );
}

export default ArtistCardSkeleton;
