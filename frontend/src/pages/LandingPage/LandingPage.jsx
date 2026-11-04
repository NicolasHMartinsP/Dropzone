import { NavLink, useLocation } from 'react-router-dom';
import { DownloadPage } from '../DownloadPage/DownloadPage.jsx';
import { ConvertPage } from '../ConvertPage/ConvertPage.jsx';
import { Icon } from '../../components/Icon/Icon.jsx';
import styles from './LandingPage.module.css';
export function LandingPage() {
  const converting = useLocation().pathname === '/conversor';
  return (
    <div className={styles.workspace}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>MENOS ETAPAS. MAIS POSSIBILIDADES.</p>
        <h1>
          Seus arquivos.
          <br />
          <span>Sem complicação.</span>
        </h1>
        <p>Um link ou um arquivo. O resto é com o DropZone.</p>
      </header>
      <section className={styles.panel} aria-label="Ferramentas de arquivos">
        <nav className={styles.tabs} aria-label="Escolher ferramenta">
          <NavLink to="/" end className={!converting ? styles.active : ''}>
            <Icon name="download" size={18} /> Baixar
          </NavLink>
          <NavLink to="/conversor" className={converting ? styles.active : ''}>
            <Icon name="convert" size={18} /> Converter
          </NavLink>
        </nav>
        {converting ? <ConvertPage /> : <DownloadPage />}
      </section>
      <p className={styles.note}>
        Seu original permanece intacto. Resultados disponíveis no histórico.
      </p>
    </div>
  );
}
