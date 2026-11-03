import { Icon } from '../Icon/Icon.jsx';
import styles from './FormatPicker.module.css';
export function FormatPicker({ formats, value, onChange, disabled = false }) {
  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend>Formato de saída</legend>
      <div className={styles.formats}>
        {formats.map((format) => (
          <button
            type="button"
            key={format}
            onClick={() => onChange(format)}
            aria-pressed={value === format}
            className={`${styles.format} ${value === format ? styles.selected : ''}`}
          >
            <span>{format === 'original' ? 'Original' : format.toUpperCase()}</span>
            {value === format && <Icon name="check" size={14} />}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
