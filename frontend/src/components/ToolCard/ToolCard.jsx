import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon.jsx';
import styles from './ToolCard.module.css';
export function ToolCard({
  number,
  icon,
  title,
  description,
  to,
  featured = false,
  label,
}) {
  return (
    <Link to={to} className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <div className={styles.top}>
        <span className={styles.icon}>
          <Icon name={icon} size={24} />
        </span>
        <span>{number} /</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className={styles.bottom}>
        <span>{label}</span>
        <Icon name="arrowUpRight" size={20} />
      </div>
    </Link>
  );
}
