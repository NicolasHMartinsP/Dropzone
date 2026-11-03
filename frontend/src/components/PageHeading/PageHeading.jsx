import { Icon } from '../Icon/Icon.jsx';
import styles from './PageHeading.module.css';
export function PageHeading({ number, label, title, description, children }) {
  return (
    <div className={styles.heading}>
      <div>
        <div className={styles.eyebrow}>
          <span>{number}</span>
          <Icon name="arrowRight" size={12} />
          {label}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className={styles.aside}>{children}</div>}
    </div>
  );
}
