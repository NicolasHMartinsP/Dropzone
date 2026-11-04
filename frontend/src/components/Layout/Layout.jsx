import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Header/Header.jsx';
import { Footer } from '../Footer/Footer.jsx';
import styles from './Layout.module.css';
export function Layout() {
  const { pathname } = useLocation();
  const studio = ['/', '/downloads', '/conversor'].includes(pathname);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className={styles.layout}>
      <a className={styles.skip} href="#content">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      {!studio && <Footer />}
    </div>
  );
}
