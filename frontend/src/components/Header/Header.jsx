import { NavLink } from 'react-router-dom';
import { Brand } from '../Brand/Brand.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Header.module.css';
export function Header() {
  return (
    <header className={styles.header}>
      <div className={'container ' + styles.inner}>
        <Brand />
        <nav aria-label="Navegação principal">
          <NavLink to="/historico" className={styles.link}>
            <Icon name="clock" size={17} /> Histórico
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
