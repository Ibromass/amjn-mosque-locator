import { useState } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

function NavBar({ onSearch }) {
    const [query, setQuery] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        onSearch?.(value);
    };

    return (
        <header className="top-bar">
            <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    className="search-input"
                    placeholder="Search by name, state, region..."
                />
            </div>

            <div className="location-indicator">
                <FaMapMarkerAlt />
                <span>Current Location</span>
            </div>
        </header>
    );
}

export default NavBar;