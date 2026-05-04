import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sign up
    console.log('Signup with', name, email, password);
    navigate('/signin');
  };

  return (
    <div className="app-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <section className="panel form-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
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
          <button type="submit">Sign Up</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </section>
    </div>
  );
}

export default Signup;
