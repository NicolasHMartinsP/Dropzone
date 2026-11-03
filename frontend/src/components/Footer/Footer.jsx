import { Link } from 'react-router-dom';
import { Brand } from '../Brand/Brand.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Footer.module.css';
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <Brand />
          <p>Arquivos em movimento. Ideias também.</p>
        </div>
        <div className={styles.links}>
          <Link to="/downloads">Baixar</Link>
          <Link to="/conversor">Converter</Link>
          <Link to="/historico">Reencontrar</Link>
        </div>
        <span className={styles.caption}>
          Feito para simplificar. <Icon name="sparkles" size={15} />
        </span>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} DropZone</span>
        <span>Uma ferramenta. Muitas possibilidades.</span>
      </div>
    </footer>
  );
}
