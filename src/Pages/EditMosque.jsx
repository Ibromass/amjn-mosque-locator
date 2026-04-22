import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { MosqueService } from "../Api/MosqueService"

function EditMosque() {
    const nav = useNavigate()
    const [mosque, setMosque] = useState({})
    const { id } = useParams()
    const API_URL = 'http://localhost:5191/api/mosque';

    useEffect(() => {
        getMosque()
    }, [id])

    const getMosque = async () => {
        try {
            const data = await MosqueService.getAll()
            const find = data.find(item => item.id == id)
            if (!find) {
                alert("mosque not found")
                return
            }
            setMosque(find)
        }
        catch (err) {
            alert(err.message)
        }
    }

    const [formData, setformData] = useState({
        name: "",
        address: "",
        state: "",
        region: "",
        circuit: "",
        jamaat: "",
        contact: "",
        latitude: "",
        longitude: "",
        imageUrl: ""
    })

    useEffect(() => {
        setformData({
            name: mosque.name,
            address: mosque.address,
            state: mosque.state,
            region: mosque.region,
            circuit: mosque.circuit,
            jamaat: mosque.jamaat,
            contact: mosque.contact,
            latitude: mosque.latitude,
            longitude: mosque.longitude,
            imageUrl: mosque.imageUrl
        })
    }, [mosque])

    const handleChange = (e) => {
        setformData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        try {
            MosqueService.update(mosque.id, formData)
            alert("Mosque updated successfully")
               nav("/");
        } catch (error) {
            alert(error.message)
        }
    }


    return (
        <>
            <div className="form-panel">
                <h2>Add Mosque</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Mosque Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Central Mosque" required />
                        </div>

                        <div className="form-group">
                            <label>Jamaat *</label>
                            <input type="text" name="jamaat" value={formData.jamaat} onChange={handleChange} placeholder="e.g., Ansarul" required />
                        </div>

                        <div className="form-group full-width">
                            <label>Address *</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Full street address"
                                required
                                rows="2"
                            />
                        </div>

                        <div className="form-group">
                            <label>State *</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g., Lagos" required />
                        </div>

                        <div className="form-group">
                            <label>Region *</label>
                            <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="e.g., South-West" required />
                        </div>

                        <div className="form-group">
                            <label>Circuit</label>
                            <input type="text" name="circuit" value={formData.circuit} onChange={handleChange} placeholder="e.g., Circuit 5" />
                        </div>

                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input type="text" name="contact" value={formData.contact} onChange={handleChange} placeholder="Phone number" />
                        </div>

                        <div className="form-group">
                            <label>Latitude</label>
                            <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="e.g., 6.5244" step="any" />
                        </div>

                        <div className="form-group">
                            <label>Longitude</label>
                            <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="e.g., 3.3792" step="any" />
                        </div>

                        <div className="form-group full-width">
                            <label>Image URL</label>
                            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/mosque.jpg" />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => nav("/")}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            👍 Update Mosque
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default EditMosque