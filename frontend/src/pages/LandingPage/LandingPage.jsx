import { useLocation } from 'react-router-dom';
import { DownloadPage } from '../DownloadPage/DownloadPage.jsx';
import { ConvertPage } from '../ConvertPage/ConvertPage.jsx';
import styles from './LandingPage.module.css';
export function LandingPage() {
  const converting = useLocation().pathname === '/conversor';
  // Keep both tools mounted so changing tools does not discard a selected file or job.
  return (
    <div className={styles.studio}>
      <div className={styles.tool} hidden={converting}>
        <DownloadPage active={!converting} />
      </div>
      <div className={styles.tool} hidden={!converting}>
        <ConvertPage active={converting} />
      </div>
    </div>
  );
}
