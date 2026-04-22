 import { FaMosque, FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

function Footer() {
    return (
        <>
    <footer className="footer">
  <div className="footer-container">

    {/* Brand */}
    <div className="footer-brand">
      <div className="footer-logo">
        <FaMosque />
        <span>AMJN Mosque Locator</span>
      </div>
      <p>
        Helping users easily find Ahmadiyya mosques nearby with accurate
        location data and seamless experience.
      </p>
    </div>

    {/* Quick Links */}
    <div>
      <h3>Quick Links</h3>
      <ul className="footer-links">
        <li>Home</li>
        <li>Map View</li>
        <li>Favorites</li>
        <li>Admin</li>
      </ul>
    </div>

    {/* Social */}
    <div>
      <h3>Connect</h3>
      <div className="footer-socials">
        <FaGithub />
        <FaLinkedin />
        <FaGlobe />
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
  </>

  );

}

export default Footer