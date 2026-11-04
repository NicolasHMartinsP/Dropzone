import { apiDocsUrl } from '../../services/api.js';
import styles from './Footer.module.css';
export function Footer() {
  return (
    <footer className={'container ' + styles.footer}>
      <span>DropZone · {new Date().getFullYear()}</span>
      <a href={apiDocsUrl} target="_blank" rel="noreferrer">
        Documentação da API ↗
      </a>
    </footer>
  );
}
