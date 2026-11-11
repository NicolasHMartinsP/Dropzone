import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Brand } from '../Brand/Brand.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Header.module.css';
import { useAuth } from '../../contexts/AuthContext.jsx';

export function Header() {
  const { pathname } = useLocation();
  const menu = useRef(null);
  const { user } = useAuth();
  const labels = {
    '/conversor': 'Converter',
    '/historico': 'Histórico',
    '/login': 'Entrar',
    '/cadastro': 'Cadastro',
    '/perfil': 'Conta',
  };
  const label = labels[pathname] || 'Baixar';
  useEffect(() => {
    menu.current.open = false;
    function close(event) {
      if (!menu.current?.contains(event.target)) menu.current.open = false;
    }
    function escape(event) {
      if (event.key === 'Escape' && menu.current.open) {
        menu.current.open = false;
        menu.current.querySelector('summary').focus();
      }
    }
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [pathname]);
  return (
    <header className={styles.header}>
      <Brand />
      <div classNmae={styles.actions}>
        <details ref={menu} className={styles.menu}>
          <summary aria-label={'Trocar ferramenta: ' + label}>
            {label}
            <Icon name="chevronDown" size={15} />
          </summary>
          <nav aria-label="Ferramentas">
            <NavLink to={user ? '/perfil' : '/login'}>
              <Icon name="user" size={16} /> {user ? user.name : 'Entrar'}
            </NavLink>
            <NavLink to="/" end>
              <Icon name="download" size={16} /> Baixar
            </NavLink>
            <NavLink to="/conversor">
              <Icon name="convert" size={16} /> Converter
            </NavLink>
            <NavLink to="/historico">
              <Icon name="clock" size={16} /> Histórico
            </NavLink>
          </nav>
        </details>
        <NavLink
          to="/perfil"
          className={styles.profile}
          aria-label={user ? `Perfil de ${user.name}` : 'Entrar na conta'}
        >
          <Icon name="user" size={18} />
        </NavLink>
      </div>
    </header>
  );
}
