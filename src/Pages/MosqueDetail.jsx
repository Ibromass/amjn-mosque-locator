import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { MosqueService } from "../Api/MosqueService"
import { UserContext } from "../Context/UserContext"

function MosqueDetail() {
    const { id } = useParams()
    const [mosque, setMosque] = useState(null)
    const nav = useNavigate()

    const { AdminData } = useContext(UserContext)

    useEffect(() => {
        fetchMosque(id)
    }, [])

    const fetchMosque = async (Id) => {
        try {
            const data = await MosqueService.getAll();
            setMosque(data.find(item =>
                item.id == Id
            ))
        }
        catch (err) {
            alert(err.message)
        }
    }

    const handleDelete = async (id) => {
        console.log("Deleting ID:", id);

        const confirmDelete = window.confirm("Are you sure you want to delete this mosque?");
        if (!confirmDelete) return;

        try {
            await MosqueService.delete(id);
            nav("/");
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <>
            <div className="detail-panel">
                <button onClick={() => nav("/")} className="btn-back" >← Back to list</button>
                <div className="detail-header">
                    <div className="detail-icon">🕌</div>
                    <div>
                        <h1>{mosque?.name}</h1>
                        <h2 className="detail-subtitle">{mosque?.jamaat} • {mosque?.circuit || 'No circuit'}</h2>
                    </div>
                </div>
                <div className="detail-grid">
                    <div className="detail-card">
                        <h4>📍 Address</h4>
                        <p>{mosque?.address}</p>
                        <p>{mosque?.state}, {mosque?.region}</p>
                    </div>
                    <div className="detail-card">
                        <h4>📞 Contact</h4>
                        <p>{mosque?.contact || 'Not available'}</p>
                    </div>
                    <div className="detail-card">
                        <h4>🗺️ Coordinates</h4>
                        <p>Lat: {mosque?.latitude || 'N/A'}</p>
                        <p>Lng: {mosque?.longitude || 'N/A'}</p>
                    </div>
                    <div className="detail-card">
                        <h4>📅 Created</h4>
                        <p>{new Date(mosque?.dateCreated).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="detail-actions">
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${mosque?.latitude},${mosque?.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                    >
                        🧭 Get Directions
                    </a>
                    {AdminData && (
                        <>
                            <button onClick={() => nav(`/edit/${mosque.id}`)} className="btn-secondary">✏️ Edit</button>
                            <button onClick={() => {
                                console.log("clicked"); handleDelete(mosque.id);

                            }} className="btn-danger">🗑️ Delete</button>
                        </>
                    )}
                </div>
            </div >

        </>
    )
}

export default MosqueDetail