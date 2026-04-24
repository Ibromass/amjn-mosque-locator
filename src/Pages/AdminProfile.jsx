import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { 
    FaPlus, 
    FaMosque, 
    FaSignOutAlt, 
    FaUserShield,
    FaCog
} from "react-icons/fa";

function AdminProfile() {
    const { logout, AdminData } = useContext(UserContext);
    const nav = useNavigate();

    return (
        <div className="admin-profile">
            <div className="profile-header">
                <h1><FaUserShield /> Admin Profile</h1>
                <button onClick={logout} className="btn-danger">
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            <div className="profile-card">
                <div className="profile-avatar">
                    {AdminData?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="profile-info">
                    <h2>{AdminData?.username || 'Admin User'}</h2>
                    <p className="profile-email">{AdminData?.email || ''}</p>
                    <span className="profile-badge">Administrator</span>
                </div>
            </div>

            <div className="admin-actions">
                <h3>Admin Actions</h3>
                <div className="action-buttons">
                    <button className="btn-action" onClick={() => nav('/addmosque')}>
                        <span><FaPlus /></span>
                        <strong>Add New Mosque</strong>
                    </button>
                    <button className="btn-action" onClick={() => nav('/')}>
                        <span><FaMosque /></span>
                        <strong>Manage Mosques</strong>
                    </button>
                    <button className="btn-action" onClick={() => nav('/admin')}>
                        <span><FaCog /></span>
                        <strong>Settings</strong>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;