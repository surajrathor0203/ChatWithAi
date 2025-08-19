import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignInEmailPassword } from '@nhost/react';
import '../App.css';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInEmailPassword, isLoading, isSuccess, error } = useSignInEmailPassword();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signInEmailPassword(email, password);
  };

  useEffect(() => {
    if (isSuccess) {
      navigate('/chatbot');
    }
  }, [isSuccess, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              name="email"
              className="auth-input"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              name="password"
              className="auth-input"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 
              <span className="loading-spinner">
                <span className="spinner"></span> Logging in...
              </span> : 
              'Log In'
            }
          </button>
        </form>
        {error && <p className="auth-error">{error.message}</p>}
        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
