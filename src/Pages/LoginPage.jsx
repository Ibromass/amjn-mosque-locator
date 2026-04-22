import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate()

  const { setUser } = useContext(UserContext)


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      // Connect to your backend
      const response = await fetch('http://localhost:5191/api/adminauth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      // Check if login failed
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid username or password');
        }
        throw new Error('Login failed. Please try again.');
      }

      // Get the data from backend
      const data = await response.json();
      // Save to localStorage
      setUser(data)
      
      // const getAdmin = localStorage.getItem('adminUser');

      // if (!getAdmin) {
      //   localStorage.setItem('adminUser', JSON.stringify(data.user || data));
      // }else {
      //   localStorage.removeItem('adminUser');
      //   localStorage.setItem('adminUser', JSON.stringify(data.user || data));
      // }

      // Tell App.jsx that login succeeded
      nav("/admin")

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>🕌 Admin Login</h1>
        <p>AMJN Mosque Locator</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;