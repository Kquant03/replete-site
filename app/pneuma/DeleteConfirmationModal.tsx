// DeleteConfirmationModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/ConversationModals.module.css';
import { FiTrash2 } from 'react-icons/fi';

interface DeleteConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isVisible, 
  onClose, 
  onConfirm,
  title 
}) => {
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
              <FiTrash2 className={styles.iconWarning} />
              <h2>Delete Conversation</h2>
              <button onClick={onClose} className={styles.closeButton}>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete &quot;{title}&quot;?</p>
              <p className={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div className={styles.buttonContainer}>
              <button onClick={onClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={onConfirm} className={styles.deleteButton}>
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;