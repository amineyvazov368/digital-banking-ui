import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Input from '../components/Input';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all details.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // authService daxilində firstName/lastName avtomatik name/surname-ə çevriləcək
      await register({ firstName, lastName, email, password });
      setSuccess('Registration completed successfully! Redirecting...');
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to login after 2.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      // Backend validations (e.g. MethodArgumentNotValidException) xətalarını tutmaq üçün
      const backendMessage = err.response?.data?.message || err.response?.data?.errors?.[0];
      setError(backendMessage || 'Failed to complete registration. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .register-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f8f9fa;
          padding: 1.5rem 1rem;
        }

        .register-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 16px;
          padding: 2rem 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          border: 1px solid #eaeaea;
        }

        .brand-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a202c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .modern-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group-vertical {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
        }

        .register-card input {
          font-size: 16px !important;
        }

        .gradient-btn {
          width: 100%;
          padding: 0.9rem;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          background: linear-gradient(90deg, #a3bded 0%, #6991c7 100%);
          box-shadow: 0 4px 15px rgba(163, 189, 237, 0.4);
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .gradient-btn:active {
          transform: scale(0.98);
        }

        .gradient-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          font-size: 0.875rem;
          color: #718096;
          margin-top: 2rem;
        }

        .footer-link {
          color: #1a202c;
          text-decoration: underline;
          font-weight: 600;
        }

        @media (min-width: 480px) {
          .register-card {
            padding: 2.5rem;
          }
        }
      `}</style>

      <div className="register-container">
        <div className="register-card">
          <h2 className="brand-title">CREATE ACCOUNT</h2>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fff5f5',
              color: '#e53e3e',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #fed7d7',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span style={{ wordBreak: 'break-word' }}>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f0fff4',
              color: '#38a169',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #c6f6d5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="input-group-vertical">
              <Input
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                icon={User}
                required
              />
              <Input
                label="Last Name *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                icon={User}
                required
              />
            </div>

            <Input
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. user@apex.com"
              icon={Mail}
              required
            />

            <Input
              label="Security Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password *"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              icon={Lock}
              required
            />

            <div style={{ marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="gradient-btn"
                disabled={loading}
              >
                {loading ? 'PROCESSING...' : 'SIGN UP'}
              </button>
            </div>
          </form>

          <div className="footer-text">
            Have already an account?{' '}
            <Link to="/login" className="footer-link">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;