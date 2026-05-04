import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sign in
    console.log('Signin with', email, password);
    navigate('/');
  };

  return (
    <div className="app-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <section className="panel form-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Sign In</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </section>
    </div>
  );
}

export default Signin;
