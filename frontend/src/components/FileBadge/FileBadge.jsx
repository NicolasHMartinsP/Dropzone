import { Icon } from '../Icon/Icon.jsx';
import styles from './FileBadge.module.css';
export function FileBadge({ kind = 'image', format, size = 'normal' }) {
  return (
    <span className={`${styles.badge} ${styles[kind]} ${styles[size]}`}>
      <Icon
        name={
          kind === 'image'
            ? 'fileImage'
            : kind === 'video'
              ? 'fileVideo'
              : kind === 'audio'
                ? 'fileAudio'
                : 'file'
        }
        size={size === 'large' ? 30 : 21}
      />
      {format && <small>{format.toUpperCase()}</small>}
    </span>
  );
}
