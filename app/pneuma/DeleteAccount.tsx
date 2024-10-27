import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Auth.module.css';

interface DeleteAccountProps {
  userId: string | null;
  onDeleteAccount: () => void;
  onClose: () => void;
  isVisible: boolean;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ userId, onDeleteAccount, onClose, isVisible }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('User ID is missing. Please try logging in again.');
      return;
    }
    try {
      await axios.delete('/api/pneuma/auth', { data: { userId, password } });
      onDeleteAccount();
    } catch (error) {
      setError('Failed to delete account. Please check your password and try again.');
    }
  };

  return (
    <div className={`${styles.authContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.authForm}>
        <h2>Delete Account</h2>
        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
          <button type="submit" className={styles.deleteButton}>Delete Account</button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <button onClick={onClose} className={styles.closeButton}>Cancel</button>
      </div>
    </div>
  );
};

export default DeleteAccount;