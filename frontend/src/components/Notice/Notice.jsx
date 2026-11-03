import { Icon } from '../Icon/Icon.jsx';
import styles from './Notice.module.css';
export function Notice({ children, error = false }) {
  return (
    <div
      className={`${styles.notice} ${error ? styles.error : ''}`}
      role={error ? 'alert' : 'note'}
    >
      <Icon name={error ? 'alert' : 'info'} size={17} />
      <div>{children}</div>
    </div>
  );
}
