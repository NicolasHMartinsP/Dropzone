import { useId } from 'react';
import styles from './FormField.module.css';

export function FormField({ label, ...inputProps }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
    </div>
  );
}
