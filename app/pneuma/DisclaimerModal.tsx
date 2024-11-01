import React, { useState } from 'react';
import styles from '../styles/DisclaimerModal.module.css';
import { FiAlertTriangle, FiCheckCircle, FiExternalLink, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface DisclaimerModalProps {
  isVisible: boolean;
  onAccept: () => void;
  isNewUser: boolean;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ 
  isVisible, 
  onAccept,
  isNewUser 
}) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [modelChecked, setModelChecked] = useState(false);
  const [discretionChecked, setDiscretionChecked] = useState(false);

  const handleAccept = () => {
    if (privacyChecked && termsChecked && modelChecked && discretionChecked) {
      localStorage.setItem('pneumaDisclaimerAccepted', 'true');
      localStorage.setItem('pneumaDisclaimerAcceptedDate', new Date().toISOString());
      onAccept();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.4, 
            ease: 'easeOut',
            delay: isNewUser ? 0 : 0.1 // Slight delay for returning users
          }}
        >
          <motion.div 
            className={`${styles.modalContent} ${isAnimated ? styles.animated : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ 
              duration: isNewUser ? 0.4 : 0.3, // Faster animation for returning users
              ease: [0.4, 0, 0.2, 1],
              delay: isNewUser ? 0.2 : 0
            }}
            onAnimationComplete={() => {
              // Add slight delay before enabling scrollbar
              setTimeout(() => setIsAnimated(true), isNewUser ? 100 : 50);
            }}
          >
            <div className={styles.modalInner}>
              <motion.div 
                className={styles.modalHeader}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: isNewUser ? 0.3 : 0.1,
                  duration: 0.4,
                  ease: 'easeOut'
                }}
              >
                <motion.div 
                  className={styles.iconWrapper}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: isNewUser ? 0.4 : 0.2,
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <FiShield className={styles.shieldIcon} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: isNewUser ? 0.5 : 0.3, duration: 0.4 }}
                >
                  Welcome to Pneuma
                </motion.h2>
              </motion.div>

              <motion.div 
                className={styles.modalBody}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <p className={styles.introText}>
                    Welcome to Pneuma, your advanced AI companion. Please review these important details before we begin:
                  </p>
                </motion.div>

                <motion.div
                  className={styles.warningBox}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <div className={styles.warningHeader}>
                    <FiAlertTriangle />
                    <span>Important Notice</span>
                  </div>
                  <p>
                    Pneuma is an uncensored AI model capable of engaging in open, 
                    unrestricted dialogue on a wide range of topics. While this allows for more natural and meaningful 
                    conversations, user discretion is strongly advised. The AI may discuss mature themes, complex topics, 
                    or sensitive subjects when relevant to the conversation.
                  </p>
                </motion.div>

                <motion.div
                  className={styles.checkboxContainer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <div className={styles.checkboxWrapper}>
                    <label className={styles.checkboxLabel}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={privacyChecked}
                          onChange={(e) => setPrivacyChecked(e.target.checked)}
                        />
                        <div className={styles.checkmark}>
                          <FiCheckCircle />
                        </div>
                      </div>
                      <span>
                        I have read and agree to the{' '}
                        <a 
                          href="/privacy-policy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Privacy Policy <FiExternalLink />
                        </a>
                      </span>
                    </label>
                  </div>

                  <div className={styles.checkboxWrapper}>
                    <label className={styles.checkboxLabel}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={termsChecked}
                          onChange={(e) => setTermsChecked(e.target.checked)}
                        />
                        <div className={styles.checkmark}>
                          <FiCheckCircle />
                        </div>
                      </div>
                      <span>
                        I accept the{' '}
                        <a 
                          href="/terms-of-service" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Terms of Service <FiExternalLink />
                        </a>
                      </span>
                    </label>
                  </div>

                  <div className={styles.checkboxWrapper}>
                    <label className={styles.checkboxLabel}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={modelChecked}
                          onChange={(e) => setModelChecked(e.target.checked)}
                        />
                        <div className={styles.checkmark}>
                          <FiCheckCircle />
                        </div>
                      </div>
                      <span>
                        I understand that Pneuma is an AI model and have read about its{' '}
                        <a 
                          href="/model-information" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          capabilities and limitations <FiExternalLink />
                        </a>
                      </span>
                    </label>
                  </div>

                  <div className={styles.checkboxWrapper}>
                    <label className={styles.checkboxLabel}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={discretionChecked}
                          onChange={(e) => setDiscretionChecked(e.target.checked)}
                        />
                        <div className={styles.checkmark}>
                          <FiCheckCircle />
                        </div>
                      </div>
                      <span>
                        I understand that Pneuma is an uncensored AI model and I will exercise appropriate discretion 
                        in my interactions. I am solely responsible for the content of my conversations and understand that 
                        the AI will respond naturally to the topics I introduce.
                      </span>
                    </label>
                  </div>
                </motion.div>

                <motion.div
                  className={styles.modalFooter}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <button
                    className={styles.acceptButton}
                    onClick={handleAccept}
                    disabled={!privacyChecked || !termsChecked || !modelChecked || !discretionChecked}
                  >
                    <FiCheckCircle />
                    <span>Accept & Continue</span>
                  </button>
                  <p className={styles.note}>
                    By clicking &quot;Accept & Continue&quot;, you acknowledge that you have read and understood the above documents, and agree to the above statements.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;