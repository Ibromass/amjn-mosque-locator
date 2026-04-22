import { useState } from "react";

function NavBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // send search to parent
    onSearch(value);
  };

  return (
    <header className="top-bar">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        

        <input
          type="text"
          value={query}
          onChange={handleChange}
          className="search-input"
          placeholder="Search by name, state, region..."
        />
      </div>

      <span>📍 Current Location</span>
    </header>
  );
}

export default NavBar;