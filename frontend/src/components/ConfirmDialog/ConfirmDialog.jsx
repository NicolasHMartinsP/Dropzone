import { useEffect, useRef } from 'react';
import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './ConfirmDialog.module.css';
export function ConfirmDialog({ open, title, children, onCancel, onConfirm, loading }) {
  const ref = useRef(null);
  useEffect(() => {
    if (open) ref.current.showModal();
    else ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) onCancel();
      }}
      aria-labelledby="confirm-title"
    >
      <span className={styles.icon}>
        <Icon name="trash" size={25} />
      </span>
      <h2 id="confirm-title">{title}</h2>
      <p>{children}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Excluir
        </Button>
      </div>
    </dialog>
  );
}
