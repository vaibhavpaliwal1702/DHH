import '../styles/Music.css';
import {useState} from 'react';
import useFetch from '../hooks/useFetch';


function Music() {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const { data: musicData, loading, error } = useFetch(`${import.meta.env.VITE_API_URL}/tracks`)

    
    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>
    
    const filteredMusic = musicData.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTracks = activeFilter === 'All' ? filteredMusic : filteredMusic.filter((t) => t.type === activeFilter)
    const filterTypes = ['All', ...new Set(musicData.map((t) => t.type))]

    return (
        <div className='main'>
            <div className="music-header">
                <h2>Music</h2>
            </div>
            <input type="text" placeholder="Search Music..." className="search-bar-music" onChange={(e) => setSearchTerm(e.target.value)} />
            <div className='filt'>
                {filterTypes.map((filters) =>
                    <button className={activeFilter === filters ? 'btn btn-active' : 'btn'} onClick={() => setActiveFilter(filters)} key={filters}>
                        {filters}
                    </button>)}
            </div>
            <div className="tracks">
                {filteredTracks.length > 0 ? (
                    <ul className='music_item'>
                        {filteredTracks.map((track) =>
                            <li key={track.trackid}>
                                <div className="music_list">
                                    <img src={track.coverimage} alt={track.name} className="cover_image"></img>
                                    <p className="track-title">{track.name}</p>
                                    <p className="track-artist">{track.artist_name}</p>
                                    <p className="track-meta">{track.type} | {track.release_date}</p>
                                </div>
                            </li>)}
                    </ul>
                ) : (<p>No music found.</p>)}
            </div>
        </div>
    )
}
export default Music
