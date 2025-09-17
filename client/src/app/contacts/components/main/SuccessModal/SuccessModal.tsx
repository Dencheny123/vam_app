import React, { useEffect } from 'react';
import styles from '../../styles/SuccessModal.module.css';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  textModal: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ open, onClose, textModal }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalMessage}>{textModal}</div>
        <button className={styles.okButton} onClick={onClose}>
          ОК
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
