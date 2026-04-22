import { useState, useEffect } from "react"
import MosqueCard from "../Components/MosqueCard"

function Favourites() {
    const [mosques, setMosques] = useState([])

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        setMosques(favorites)
    }, [])

    // ✅ ADD: Toggle favorite function
    const toggleFavorite = (mosque) => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        const updated = favorites.filter(f => f.id !== mosque.id)
        localStorage.setItem('favorites', JSON.stringify(updated))
        setMosques(updated)
    }

    return (
        <div className="favourites-page">
            <h2>My Favorite Mosques ❤️</h2>
            
            {mosques.length === 0 ? (
                <p>No favorites yet. Start exploring!</p>
            ) : (
                <div className="mosque-grid">
                    {mosques.map(mosque => (
                        <MosqueCard 
                            key={mosque.id} 
                            mosque={mosque} 
                            isFavorite={true}  // ✅ Always true in favorites
                            onToggleFavorite={() => toggleFavorite(mosque)}  // ✅ Remove from favorites
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Favourites