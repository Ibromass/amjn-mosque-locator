import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MosqueService } from "../Api/MosqueService";
import { UserContext } from "../Context/UserContext";
import { 
    FaArrowLeft, 
    FaMapMarkerAlt, 
    FaPhone, 
    FaMap, 
    FaEdit, 
    FaTrash,
    FaCompass,
    FaCalendar
} from "react-icons/fa";

function MosqueDetail() {
    const { id } = useParams();
    const [mosque, setMosque] = useState(null);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();
    const { AdminData } = useContext(UserContext);

    useEffect(() => {
        fetchMosque(id);
    }, [id]);

    const fetchMosque = async (Id) => {
        try {
            setLoading(true);
            const data = await MosqueService.getAll();
            const found = data.find(item => item.id == Id);
            if (!found) {
                alert("Mosque not found");
                nav("/");
                return;
            }
            setMosque(found);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this mosque?");
        if (!confirmDelete) return;

        try {
            await MosqueService.delete(id);
            nav("/");
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
                <p>Loading mosque details...</p>
            </div>
        );
    }

    if (!mosque) return null;

    return (
        <div className="detail-panel">
            <button onClick={() => nav("/")} className="btn-back">
                <FaArrowLeft /> Back to list
            </button>

            <div className="detail-header">
                <div className="detail-icon">🕌</div>
                <div>
                    <h1>{mosque.name}</h1>
                    <p className="detail-subtitle">
                        {mosque.jamaat} • {mosque.circuit || 'No circuit'}
                    </p>
                </div>
            </div>

            <div className="detail-grid">
                <div className="detail-card">
                    <h4><FaMapMarkerAlt /> Address</h4>
                    <p>{mosque.address}</p>
                    <p>{mosque.state}, {mosque.region}</p>
                </div>
                
                <div className="detail-card">
                    <h4><FaPhone /> Contact</h4>
                    <p>{mosque.contact || 'Not available'}</p>
                </div>
                
                <div className="detail-card">
                    <h4><FaCompass /> Coordinates</h4>
                    <p>Lat: {mosque.latitude || 'N/A'}</p>
                    <p>Lng: {mosque.longitude || 'N/A'}</p>
                </div>
                
                <div className="detail-card">
                    <h4><FaCalendar /> Created</h4>
                    <p>{new Date(mosque.dateCreated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                </div>
            </div>

            <div className="detail-actions">
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                >
                    <FaMap /> Get Directions
                </a>
                
                {AdminData && (
                    <>
                        <button 
                            onClick={() => nav(`/edit/${mosque.id}`)} 
                            className="btn-secondary"
                        >
                            <FaEdit /> Edit
                        </button>
                        <button 
                            onClick={() => handleDelete(mosque.id)} 
                            className="btn-danger"
                        >
                            <FaTrash /> Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default MosqueDetail;