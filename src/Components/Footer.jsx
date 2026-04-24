import { FaMosque, FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <FaMosque />
                        <span>AMJN Mosque Locator</span>
                    </div>
                    <p>
                        Helping users easily find Ahmadiyya mosques nearby with accurate
                        location data and seamless experience across all devices.
                    </p>
                </div>

                <div>
                    <h3>Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/map-view">Map View</Link></li>
                        <li><Link to="/favourites">Favorites</Link></li>
                        <li><Link to="/login">Admin</Link></li>
                    </ul>
                </div>

                <div>
                    <h3>Connect</h3>
                    <div className="footer-socials">
                        <a href="#" aria-label="GitHub"><FaGithub /></a>
                        <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
                        <a href="#" aria-label="Website"><FaGlobe /></a>
                    </div>
                    <p className="footer-note">
                        Built with ❤️ for the community
                    </p>
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} AMJN Mosque Locator. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;