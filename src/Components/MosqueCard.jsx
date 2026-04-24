import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

function MosqueCard({ mosque, isFavorite, onToggleFavorite }) {
    return (
        <div className="mosque-card">
            <div className="card-image">
                {mosque.imageUrl ? (
                    <img src={mosque.imageUrl} alt={mosque.name} loading="lazy" />
                ) : (
                    <div className="mosque-emoji">🕌</div>
                )}
                
                <button 
                    className="fav-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.();
                    }}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {isFavorite ? (
                        <FaHeart className="heart-icon filled" />
                    ) : (
                        <FaRegHeart className="heart-icon" />
                    )}
                </button>
                
                <div className="distance-badge">
                    {mosque.distance ? `${mosque.distance.toFixed(1)} km` : "Nearby"}
                </div>
            </div>

            <div className="card-content">
                <h3 className="mosque-name">{mosque.name}</h3>
                
                <div className="location-row">
                    <FaMapMarkerAlt className="location-icon" />
                    <span>{mosque.state}, {mosque.region}</span>
                </div>
                
                <span className="jamaat-badge">{mosque.jamaat}</span>
                
                <Link to={`/m/${mosque.id}`} className="view-link">
                    <span>View Details</span>
                    <FaArrowRight className="arrow-icon" />
                </Link>
            </div>
        </div>
    );
}

export default MosqueCard;