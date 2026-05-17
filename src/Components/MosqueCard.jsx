import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

const fallbackImage = "https://placehold.co/600x360/e2e8f0/15803d?text=Mosque";

const getMosqueImage = (imageUrl) => {
    if (Array.isArray(imageUrl)) return imageUrl[0] || fallbackImage;
    if (typeof imageUrl === "string" && imageUrl.trim()) return imageUrl;
    return fallbackImage;
};

function MosqueCard({ mosque, isFavorite, onToggleFavorite }) {
    return (
        <div className="mosque-card">
            <div className="card-image">
                <img 
                    src={getMosqueImage(mosque.imageUrl)}
                    alt={mosque.name} 
                    className="mosque-img"
                    onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                    }}
                />
                
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
