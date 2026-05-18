import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { MosqueService } from "../Api/MosqueService"

const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error("Failed to read image file"))
        reader.readAsDataURL(file)
    })
}

const firstImageUrl = (imageUrl) => {
    if (Array.isArray(imageUrl)) return imageUrl[0] || ""
    return imageUrl || ""
}

function EditMosque() {
    const nav = useNavigate()
    const [mosque, setMosque] = useState({})
    const { id } = useParams()
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState("")

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
        const getMosque = async () => {
            try {
                const data = await MosqueService.getById(id)
                if (!data) {
                    alert("mosque not found")
                    return
                }

                setMosque(data)
                setformData({
                    name: data.name || "",
                    address: data.address || "",
                    state: data.state || "",
                    region: data.region || "",
                    circuit: data.circuit || "",
                    jamaat: data.jamaat || "",
                    contact: data.contact || "",
                    latitude: data.latitude || "",
                    longitude: data.longitude || "",
                    imageUrl: firstImageUrl(data.imageUrl)
                })
                setImagePreview(firstImageUrl(data.imageUrl))
            }
            catch (err) {
                alert(err.message)
            }
        }

        getMosque()
    }, [id])

    const handleChange = (e) => {
        setformData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageFileChange = (e) => {
        const file = e.target.files?.[0]
        setImageFile(file || null)
        setImagePreview(file ? URL.createObjectURL(file) : firstImageUrl(mosque.imageUrl))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const uploadedImage = imageFile ? await fileToDataUrl(imageFile) : ""
            const imageUrl = uploadedImage || formData.imageUrl.trim()
            await MosqueService.update(mosque.id, {
                ...formData,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                imageUrl,
            })
            alert("Mosque updated successfully")
               nav("/");
        } catch (error) {
            alert(error.message)
        }
    }


    return (
        <>
            <div className="form-panel">
                <h2>Edit Mosque</h2>

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

                        <div className="form-group full-width">
                            <label>Upload Mosque Image</label>
                            <input type="file" accept="image/*" onChange={handleImageFileChange} />
                            {imagePreview && (
                                <img className="image-preview" src={imagePreview} alt="Mosque preview" />
                            )}
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
