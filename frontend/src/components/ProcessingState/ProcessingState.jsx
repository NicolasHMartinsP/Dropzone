import { Icon } from '../Icon/Icon.jsx';
import styles from './ProcessingState.module.css';
export function ProcessingState({ title, description }) {
  return (
    <div className={styles.state} role="status">
      <Icon name="loader" size={25} className="spin" />
      <div>
        <strong>{title}</strong>
        <p>
          {description ||
            'Você pode acompanhar a conclusão aqui. Isso pode levar até 2 minutos.'}
        </p>
      </div>
    </div>
  );
}
