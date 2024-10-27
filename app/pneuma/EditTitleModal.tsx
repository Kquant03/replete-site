// EditTitleModal.tsx
import React, { useState } from 'react';
import styles from '../styles/ConversationModals.module.css';
import { FiEdit2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface EditTitleModalProps {
  isVisible: boolean;
  currentTitle: string;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

const EditTitleModal: React.FC<EditTitleModalProps> = ({ isVisible, currentTitle, onClose, onSave }) => {
  const [title, setTitle] = useState(currentTitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={styles.modalContent}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className={styles.modalHeader}>
              <FiEdit2 className={styles.icon} />
              <h2>Edit Conversation Title</h2>
              <button onClick={onClose} className={styles.closeButton}>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                placeholder="Enter new title"
                autoFocus
              />
              <div className={styles.buttonContainer}>
                <button type="button" onClick={onClose} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTitleModal;