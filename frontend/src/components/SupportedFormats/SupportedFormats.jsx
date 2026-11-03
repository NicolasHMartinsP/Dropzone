import { Icon } from '../Icon/Icon.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import styles from './SupportedFormats.module.css';
export function SupportedFormats() {
  const { health } = useApp();
  const rows = [
    { name: 'Imagens', icon: 'image', formats: 'PNG, JPG, WebP, AVIF', enabled: true },
    {
      name: 'Áudios',
      icon: 'music',
      formats: 'MP3, WAV, OGG',
      enabled: health?.capabilities.ffmpeg,
    },
    {
      name: 'Vídeos',
      icon: 'video',
      formats: 'MP4, WebM',
      enabled: health?.capabilities.ffmpeg,
    },
  ];
  return (
    <aside className={styles.card}>
      <span className={styles.label}>FEITO PARA SEUS ARQUIVOS</span>
      <h2>Encontre seu formato.</h2>
      <div className={styles.rows}>
        {rows.map((row) => (
          <div className={styles.row} key={row.name}>
            <span className={styles.icon}>
              <Icon name={row.icon} size={19} />
            </span>
            <div>
              <h3>{row.name}</h3>
              <p>{row.formats}</p>
              {!row.enabled && (
                <span className={styles.unavailable}>Requer FFmpeg no servidor</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.note}>
        <Icon name="info" size={15} />
        <span>
          Até {health?.capabilities.maxFileSizeMB || 50} MB por arquivo.
          <br />
          Áudio/vídeo de até 10 minutos.
        </span>
      </div>
      <span className={styles.decoration} aria-hidden="true">
        ↗
      </span>
    </aside>
  );
}
