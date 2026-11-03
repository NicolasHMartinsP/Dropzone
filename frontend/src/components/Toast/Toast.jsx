import { Icon } from '../Icon/Icon.jsx';
import styles from './Toast.module.css';
export function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      className={`${styles.toast} ${toast.type === 'error' ? styles.error : ''}`}
    >
      <Icon name={toast.type === 'error' ? 'alert' : 'success'} />
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Fechar aviso">
        <Icon name="close" size={17} />
      </button>
    </div>
  );
}
