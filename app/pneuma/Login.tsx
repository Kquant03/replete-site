import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Auth.module.css';

interface LoginProps {
  onLogin: (userId: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onClose, isVisible }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isVisible) {
      setUsername('');
      setPassword('');
      setError('');
    }
  }, [isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/pneuma/auth', { username, password });
      const { userId } = response.data;
      localStorage.setItem('userId', userId);
      onLogin(userId);
    } catch (error) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className={`${styles.authContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.authForm}>
        <h2>Login to Pneuma</h2>
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
          <button type="submit">Login</button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <button onClick={onClose} className={styles.closeButton}>Cancel</button>
      </div>
    </div>
  );
};

export default Login;