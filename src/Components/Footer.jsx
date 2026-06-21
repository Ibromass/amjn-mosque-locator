import { FaMosque, FaFacebook, FaYoutube, FaGlobe, FaInstagram, FaTwitter } from "react-icons/fa";
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
                    <p className="footer-tagline">
                        <em>Love for All, Hatred for None</em>
                    </p>
                </div>

                <div>
                    <h3>Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/map-view">Map View</Link></li>
                        <li><Link to="/favourites">Favorites</Link></li>
                        <li><Link to="/news">News & Updates</Link></li>
                        <li><Link to="/qiblah">Qiblah Compass</Link></li>
                        <li><Link to="/login">Admin</Link></li>
                    </ul>
                </div>

                <div>
                    <h3>Official Channels</h3>
                    <div className="footer-socials">
                        {/* Ahmadiyya Nigeria — Facebook */}
                        <a
                            href="https://www.facebook.com/ahmadiyyang/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Ahmadiyya Nigeria on Facebook"
                            title="Ahmadiyya Nigeria — Facebook"
                        >
                            <FaFacebook />
                        </a>

                        {/* @alislam — X / Twitter */}
                        <a
                            href="https://x.com/alislam"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="@alislam on X (Twitter)"
                            title="@alislam — Official Ahmadiyya on X"
                        >
                            <FaTwitter />
                        </a>

                        {/* MTA International — YouTube */}
                        <a
                            href="https://www.youtube.com/@mtaOnline1"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="MTA International on YouTube"
                            title="MTA International — YouTube"
                        >
                            <FaYoutube />
                        </a>

                        {/* MTA International — Instagram */}
                        <a
                            href="https://www.instagram.com/mta_international/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="MTA International on Instagram"
                            title="MTA International — Instagram"
                        >
                            <FaInstagram />
                        </a>

                        {/* Official website */}
                        <a
                            href="https://ahmadiyya.ng"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Ahmadiyya Nigeria Website"
                            title="ahmadiyya.ng — Official Website"
                        >
                            <FaGlobe />
                        </a>
                    </div>
                    <p className="footer-note">
                        Follow us on official Ahmadiyya channels
                    </p>
                    <p className="footer-note" style={{ marginTop: "6px" }}>
                        <a
                            href="https://www.alislam.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--green)" }}
                        >
                            alislam.org
                        </a>
                        {" · "}
                        <a
                            href="https://www.mta.tv"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--green)" }}
                        >
                            mta.tv
                        </a>
                        {" · "}
                        <a
                            href="https://ahmadiyya.ng"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--green)" }}
                        >
                            ahmadiyya.ng
                        </a>
                    </p>
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} AMJN Mosque Locator · Ahmadiyya Muslim Jama&apos;at Nigeria ·{" "}
                <a
                    href="https://ahmadiyya.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--green)" }}
                >
                    ahmadiyya.ng
                </a>
            </div>
        </footer>
    );
}

export default Footer;
