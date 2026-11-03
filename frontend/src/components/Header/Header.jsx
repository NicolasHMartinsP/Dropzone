import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Brand } from '../Brand/Brand.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { apiDocsUrl } from '../../services/api.js';
import styles from './Header.module.css';

const links = [
  { to: '/', label: 'Início', end: true },
  { to: '/downloads', label: 'Downloads' },
  { to: '/conversor', label: 'Conversor' },
  { to: '/historico', label: 'Histórico' },
];
export function Header() {
  const [open, setOpen] = useState(false);
  const { connection } = useApp();
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Brand />
        <nav
          id="main-nav"
          aria-label="Navegação principal"
          className={`${styles.nav} ${open ? styles.open : ''}`}
        >
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <span
            className={`${styles.connection} ${styles[connection]}`}
            title={
              connection === 'online'
                ? 'Backend conectado'
                : 'Inicie o backend na porta 3333'
            }
          >
            <i />
            {connection === 'online'
              ? 'API conectada'
              : connection === 'checking'
                ? 'Conectando'
                : 'API desconectada'}
          </span>
          <a href={apiDocsUrl} target="_blank" rel="noreferrer" className={styles.docs}>
            API Docs <Icon name="arrowUpRight" size={16} />
          </a>
        </div>
        <button
          type="button"
          className={styles.menu}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fechar navegação' : 'Abrir navegação'}
          aria-expanded={open}
          aria-controls="main-nav"
        >
          <Icon name={open ? 'close' : 'menu'} size={24} />
        </button>
      </div>
    </header>
  );
}
