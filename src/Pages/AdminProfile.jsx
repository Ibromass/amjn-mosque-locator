import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { UserContext } from "../Context/UserContext";

function AdminProfile() {
  const { logout } = useContext(UserContext)

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <h1>👤 Admin Profile</h1>
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">

        </div>

        <div className="profile-info">
          <h2> Admin User </h2>
          <p className="profile-email"></p>
          <span className="profile-badge">Administrator</span>
        </div>
      </div>

      <div className="admin-actions">
        <h3 color="rgba(0, 0, 0, 0.07)">Admin Actions</h3>
        <div className="action-buttons">
          <button className="btn-action">➕ Add New Mosque</button>
          <button className="btn-action">✏️ Manage Mosques</button>

        </div>
      </div>
    </div>
  );
}

export default AdminProfile;