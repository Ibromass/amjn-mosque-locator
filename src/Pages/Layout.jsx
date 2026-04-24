import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

function Layout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className="app-layout">
            {/* Mobile Menu Toggle */}
            <button 
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Overlay for mobile */}
            <div 
                className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            <SideBar isOpen={mobileMenuOpen} />

            <div className="main-content">
                <NavBar />
                <div className="content-area">
                    <Outlet />
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default Layout;