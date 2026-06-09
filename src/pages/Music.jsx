import '../styles/Music.css';
import {useState} from 'react';
import useFetch from '../hooks/useFetch';


function Music() {
    
    const [activeFilter, setActiveFilter] = useState('All');

    const { data: musicData, loading, error } = useFetch('http://localhost:3001/tracks')

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    const filteredTracks = activeFilter === 'All' ? musicData : musicData.filter((t) => t.type === activeFilter)
    const filterTypes = ['All', ...new Set(musicData.map((t) => t.type))]

    return (
        <div className='main'>
            <div className='filt'>
                {filterTypes.map((filters) =>
                    <button className={activeFilter === filters ? 'btn btn-active' : 'btn'} onClick={() => setActiveFilter(filters)} key={filters}>
                        {filters}
                    </button>)}
            </div>
            <div className="tracks">
                {filteredTracks.length === 0 && (
                    <p>No Music available at the moment</p>
                )}
                {filteredTracks.length > 0 && (
                    <ul className='music_item'>
                        {filteredTracks.map((track) =>
                            <li key={track.id}>
                                <div className="music_list">
                                    <img src={track.coverImage} alt={track.title} className="cover_image"></img>
                                    <p>{track.title}</p>
                                    <p>{track.artist}</p>
                                    <p>{track.type}</p>
                                    <p>{track.releaseYear}</p>
                                </div>
                            </li>)}
                    </ul>
                )}
            </div>
        </div>
    )
}
export default Music
