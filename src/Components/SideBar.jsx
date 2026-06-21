import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import {
    FaHome,
    FaMapMarkedAlt,
    FaHeart,
    FaPlus,
    FaCog,
    FaSignOutAlt,
    FaUserShield,
    FaNewspaper,
    FaCompass,
    FaMosque,
} from "react-icons/fa";

/* Official AMJN Nigeria logo (white) on a green badge */
function AMJNLogo() {
    const [imgErr, setImgErr] = useState(false);
    return (
        <span className="sidebar-logo-badge" aria-label="AMJN Logo">
            {imgErr ? (
                <FaMosque style={{ color: "#fff", fontSize: 24 }} />
            ) : (
                <img
                    src="https://ahmadiyya.ng/wp-content/uploads/2020/04/amjnlogowhite-01-mobile.png"
                    alt="AMJN"
                    className="sidebar-logo-img"
                    onError={() => setImgErr(true)}
                />
            )}
        </span>
    );
}

function SideBar({ isOpen }) {
    const nav = useNavigate();
    const location = useLocation();
    const { AdminData, logout } = useContext(UserContext);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { to: "/", icon: <FaHome />, label: "Home" },
        { to: "/map-view", icon: <FaMapMarkedAlt />, label: "Map View" },
        { to: "/favourites", icon: <FaHeart />, label: "Favorites" },
        { to: "/news", icon: <FaNewspaper />, label: "News & Updates" },
        { to: "/qiblah", icon: <FaCompass />, label: "Qiblah Compass" },
    ];

    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="logo" onClick={() => nav("/")}>
                <AMJNLogo />
                <span className="logo-text">AMJN</span>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`nav-item ${isActive(item.to) ? "active" : ""}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}

                {AdminData && (
                    <Link
                        to="/addmosque"
                        className={`nav-item ${isActive("/addmosque") ? "active" : ""}`}
                    >
                        <FaPlus />
                        <span>Add Mosque</span>
                    </Link>
                )}

                {!AdminData && (
                    <Link to="/login" className="btn-login-sidebar">
                        <FaUserShield style={{ marginRight: "8px" }} />
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
                        className={`nav-item ${isActive("/admin") ? "active" : ""}`}
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
