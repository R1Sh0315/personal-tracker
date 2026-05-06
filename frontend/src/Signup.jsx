import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  MdEmail, 
  MdLock, 
  MdPerson,
  MdVisibility, 
  MdVisibilityOff 
} from 'react-icons/md';

function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      bgcolor: '#f8fafc',
      py: 4
    }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ 
            width: 60, 
            height: 60, 
            bgcolor: 'primary.main', 
            borderRadius: '16px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
            mb: 2
          }}>
            <Typography variant="h4" color="white" fontWeight="900">P</Typography>
          </Box>
          <Typography variant="h4" fontWeight="800" gutterBottom>Create Account</Typography>
          <Typography variant="body2" color="text.secondary">Start tracking your habits and finances today</Typography>
        </Box>

        <Card sx={{ p: 4, borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdPerson size={20} color="#64748b" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdEmail size={20} color="#64748b" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdLock size={20} color="#64748b" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                size="large"
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  borderRadius: '12px', 
                  fontWeight: '700', 
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Creating account...' : 'Get Started'}
              </Button>
            </Box>
          </form>
        </Card>

        <Typography variant="body2" align="center" sx={{ mt: 4, color: '#64748b' }}>
          Already have an account? {' '}
          <Link to="/signin" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
            Sign In
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default Signup;
