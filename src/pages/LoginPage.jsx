import React, { useState, useEffect } from 'react'; // useEffect-i bura əlavə etdik
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Lock, Infinity, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => { // React.useEffect yerinə birbaşa useEffect istifadə edirik
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    setError('Please fill in all details.');
    return;
  }

  setError('');
  setLoading(true);
  try {
    // AuthContext-dən tam user obyektini alırıq
    const loggedInUser = await login(email, password);

    // Rola görə şərt qoyuruq (ADMIN hərf böyüklüyünə diqqət et: 'ADMIN' və ya 'ROLE_ADMIN')
    if (loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'ROLE_ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  } catch (err) {
    const backendMessage = err.response?.data?.message || err.response?.data?.errors?.[0];
    setError(backendMessage || 'Invalid email or password. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: var(--bg-primary);
          background-image: radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.12) 0%, transparent 60%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
          padding: 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: var(--glass-shadow);
          border-radius: 16px;
        }

        .login-card input {
          padding: 12px 14px 12px 40px !important;
          font-size: 16px !important;
        }

        .login-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        @media (min-width: 480px) {
          .login-container {
            padding: 2rem;
          }
          .login-card {
            padding: 2.5rem;
          }
          .login-title {
            font-size: 1.6rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="glass-card login-card">

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // justify-content -> justifyContent (inline style JSX obyektində camelCase olmalıdır)
              boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
              marginBottom: '0.25rem'
            }}>
              <Infinity size={24} />
            </div>
            <div>
              <h2 className="login-title">Welcome to Apex Bank</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', padding: '0 0.5rem' }}>
                Sign in to manage your digital assets securely
              </p>
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              backgroundColor: 'var(--color-danger-glow)',
              color: 'var(--color-danger)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.8rem',
              fontWeight: 500,
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ wordBreak: 'break-word', lineHeight: '1.3' }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@apex.com"
                icon={Mail}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Input
                label="Security Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                required
              />
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  borderRadius: '10px'
                }}
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          <div style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            padding: '1rem'
          }}>
            New user?{' '}
            <Link to="/register" style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;