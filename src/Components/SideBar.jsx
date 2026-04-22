import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";

function SideBar() {
  const nav = useNavigate()
  const { AdminData, logout } = useContext(UserContext)


  return (
    <aside className="sidebar">

      <div className="logo" >
        <span className="logo-icon">🕌</span>
        <span className="logo-text">AMJN</span>
      </div>

      <nav className="nav-menu">
        <Link to="/" className="nav-item">
          <span>🏠</span> Home
        </Link>

        <Link to="/map-view" className="nav-item">
          <span>🗺️</span> Map View
        </Link>

        <Link to="favourites" className="nav-item">
          <span>⭐</span> Favorites
        </Link>
        {AdminData &&
          <Link to="/addmosque" className="nav-item">
            ➕ Add Mosque
          </Link>
        }
        {!AdminData &&
          <Link to="/login" className="btn-login-sidebar ">
            🔐 Admin Login
          </Link>
        }



      </nav>


      {AdminData &&
        <div className="sidebar-footer">
          <div className="admin-badge">👤 Admin</div>
          <button onClick={() => nav("/admin")} className="nav-item">
            <span>⚙️</span> Settings
          </button>
          <button onClick={logout} className="nav-item logout">
            <span>🚪</span> Logout
          </button>
        </div>
      }
    </aside>
  );
}

export default SideBar