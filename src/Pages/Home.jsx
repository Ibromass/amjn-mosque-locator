import { useEffect, useState, useCallback } from "react";
import MosqueCard from "../Components/MosqueCard";
import NavBar from "../Components/NavBar";
import { getUserLocation, calculateDistance } from "../Api/Location";
import { MosqueService } from "../Api/MosqueService";
import { FaMapMarkerAlt, FaList } from "react-icons/fa";

function Home() {
    const [mosques, setMosques] = useState([]);
    const [nearByMosques, setNearByMosques] = useState([]);
    const [filteredMosques, setFilteredMosques] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    // Load favorites
    useEffect(() => {
        const stored = localStorage.getItem('favorites');
        if (stored) setFavorites(JSON.parse(stored));
    }, []);

    const toggleFavorite = useCallback((mosque) => {
        const isFav = favorites.some(f => f.id === mosque.id);
        const updated = isFav 
            ? favorites.filter(f => f.id !== mosque.id)
            : [...favorites, mosque];
        
        setFavorites(updated);
        localStorage.setItem('favorites', JSON.stringify(updated));
    }, [favorites]);

    const handleSearch = useCallback((query) => {
        if (!query.trim()) {
            setFilteredMosques(mosques);
            return;
        }
        const q = query.toLowerCase();
        const filtered = mosques.filter((m) => 
            m.name?.toLowerCase().includes(q) ||
            m.state?.toLowerCase().includes(q) ||
            m.region?.toLowerCase().includes(q)
        );
        setFilteredMosques(filtered);
    }, [mosques]);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const data = await MosqueService.getAll();
                const pos = await getUserLocation();
                const userLoc = { lat: pos.latitude, lng: pos.longitude };
                
                setUserLocation(userLoc);

                const enriched = data.map((m) => ({
                    ...m,
                    distance: calculateDistance(userLoc.lat, userLoc.lng, m.latitude, m.longitude),
                }));

                const sorted = enriched.sort((a, b) => a.distance - b.distance);
                setMosques(sorted);
                setFilteredMosques(sorted);
                setNearByMosques(sorted.filter((m) => m.distance <= 5));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    if (loading) {
        return (
            <div className="empty-state">
                <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
                <p>Finding mosques near you...</p>
            </div>
        );
    }

    return (
        <div>
            <NavBar onSearch={handleSearch} />

            {/* Nearby Section */}
            {nearByMosques.length > 0 && (
                <section style={{ marginBottom: '3rem' }}>
                    <h2 className="section-title">
                        <FaMapMarkerAlt /> Nearby Mosques
                    </h2>
                    <div className="mosque-grid">
                        {nearByMosques.map((item) => (
                            <MosqueCard 
                                key={item.id} 
                                mosque={item} 
                                isFavorite={favorites.some(f => f.id === item.id)}
                                onToggleFavorite={() => toggleFavorite(item)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* All Mosques */}
            <section>
                <h2 className="section-title">
                    <FaList /> All Mosques
                    <span style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-muted)', 
                        fontWeight: 400,
                        marginLeft: 'auto'
                    }}>
                        Sorted by distance
                    </span>
                </h2>
                
                {filteredMosques.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No mosques found</h3>
                        <p>Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="mosque-grid">
                        {filteredMosques.map((item) => (
                            <MosqueCard 
                                key={item.id} 
                                mosque={item} 
                                isFavorite={favorites.some(f => f.id === item.id)}
                                onToggleFavorite={() => toggleFavorite(item)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;