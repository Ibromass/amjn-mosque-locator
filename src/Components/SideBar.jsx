import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { 
    FaHome, 
    FaMapMarkedAlt, 
    FaHeart, 
    FaPlus, 
    FaCog, 
    FaSignOutAlt,
    FaUserShield
} from "react-icons/fa";

function SideBar({ isOpen }) {
    const nav = useNavigate();
    const location = useLocation();
    const { AdminData, logout } = useContext(UserContext);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { to: "/", icon: <FaHome />, label: "Home" },
        { to: "/map-view", icon: <FaMapMarkedAlt />, label: "Map View" },
        { to: "/favourites", icon: <FaHeart />, label: "Favorites" },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="logo" onClick={() => nav("/")}>
                <span className="logo-icon">🕌</span>
                <span className="logo-text">AMJN</span>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => (
                    <Link 
                        key={item.to}
                        to={item.to} 
                        className={`nav-item ${isActive(item.to) ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}

                {AdminData && (
                    <Link 
                        to="/addmosque" 
                        className={`nav-item ${isActive('/addmosque') ? 'active' : ''}`}
                    >
                        <FaPlus />
                        <span>Add Mosque</span>
                    </Link>
                )}

                {!AdminData && (
                    <Link to="/login" className="btn-login-sidebar">
                        <FaUserShield style={{ marginRight: '8px' }} />
                        Admin Login
                    </Link>
                )}
            </nav>

            {AdminData && (
                <div className="sidebar-footer">
                    <div className="admin-badge">
                        <FaUserShield /> Admin
                    </div>
                    <button 
                        onClick={() => nav("/admin")} 
                        className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                    >
                        <FaCog />
                        <span>Settings</span>
                    </button>
                    <button onClick={logout} className="nav-item logout">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </aside>
    );
}

export default SideBar;