import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Brand.module.css';
export function Brand({ inverse = false }) {
  return (
    <Link
      to="/"
      className={`${styles.brand} ${inverse ? styles.inverse : ''}`}
      aria-label="DropZone, início"
    >
      <span className={styles.mark}>
        <Icon name="download" size={23} />
      </span>
      <span>
        dropzone<span className={styles.dot}>.</span>
      </span>
    </Link>
  );
}
