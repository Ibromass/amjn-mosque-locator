import { useState, useEffect } from "react";
import MosqueCard from "../Components/MosqueCard";
import { FaHeart } from "react-icons/fa";

function Favourites() {
    const [mosques, setMosques] = useState([]);

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setMosques(favorites);
    }, []);

    const toggleFavorite = (mosque) => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const updated = favorites.filter(f => f.id !== mosque.id);
        localStorage.setItem('favorites', JSON.stringify(updated));
        setMosques(updated);
    };

    return (
        <div>
            <div className="page-header">
                <h1><FaHeart style={{ color: 'var(--danger)', marginRight: '12px' }} />My Favorite Mosques</h1>
                <p>Mosques you've saved for quick access</p>
            </div>

            {mosques.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💚</div>
                    <h3>No favorites yet</h3>
                    <p>Start exploring mosques and add them to your favorites!</p>
                </div>
            ) : (
                <div className="mosque-grid">
                    {mosques.map(mosque => (
                        <MosqueCard 
                            key={mosque.id} 
                            mosque={mosque} 
                            isFavorite={true}
                            onToggleFavorite={() => toggleFavorite(mosque)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favourites;