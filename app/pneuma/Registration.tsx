import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Auth.module.css';

interface RegistrationProps {
  onRegister: (userId: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

type ApiError = {
  response?: {
    status: number;
    data?: {
      error?: string;
    };
  };
  message: string;
};

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
}

const Registration: React.FC<RegistrationProps> = ({ onRegister, onClose, isVisible }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isVisible) {
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await axios.post('/api/pneuma/register', { 
        username, 
        password 
      });
      
      if (response.data.userId) {
        onRegister(response.data.userId);
      } else {
        setError('Registration failed. No user ID received.');
      }
    } catch (error: unknown) {
      if (isApiError(error)) {
        if (error.response?.data?.error) {
          setError(error.response.data.error);
        } else if (error.response?.status === 409) {
          setError('Username already taken. Please choose a different username.');
        } else {
          setError('Registration failed. Please try again.');
        }
        console.error('Registration error details:', error.response?.data);
      } else {
        setError('An unexpected error occurred.');
        console.error('Unexpected registration error:', error);
      }
    }
  };

  return (
    <div className={`${styles.authContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.authForm}>
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <button type="submit">Register</button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <button onClick={onClose} className={styles.closeButton}>Cancel</button>
      </div>
    </div>
  );
};

export default Registration;