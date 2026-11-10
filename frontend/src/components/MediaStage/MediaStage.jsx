import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon/Icon.jsx';
import { formatBytes } from '../../utils/format.js';
import styles from './MediaStage.module.css';

// key={src} resets a failed preview when the file changes.
function Preview({ src, kind, name, active }) {
  const [failed, setFailed] = useState(false);
  const player = useRef(null);
  useEffect(() => {
    if (!active) player.current?.pause();
  }, [active]);
  if (!src || failed)
    return (
      <div className={styles.fallback}>
        <Icon name={kind === 'audio' ? 'music' : 'file'} size={32} />
        <p>Prévia indisponível neste navegador.</p>
        <span>Você ainda pode processar o arquivo.</span>
      </div>
    );
  if (kind === 'image')
    return <img src={src} alt={name} onError={() => setFailed(true)} />;
  if (kind === 'video')
    return (
      <video
        ref={player}
        src={src}
        controls
        preload="metadata"
        playsInline
        onError={() => setFailed(true)}
      />
    );
  return (
    <div className={styles.audio}>
      <Icon name="music" size={42} />
      <audio
        ref={player}
        src={src}
        controls
        preload="metadata"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function MediaStage({
  src,
  kind,
  name,
  size,
  resolution,
  busy,
  status,
  children,
  active = true,
}) {
  return (
    <section className={styles.stage} aria-label="Mídia selecionada" aria-busy={busy}>
      <div className={styles.metadata}>
        <span>{name}</span>
        <span>{formatBytes(size)}</span>
      </div>
      <div className={styles.media}>
        <Preview key={src} src={src} kind={kind} name={name} active={active} />
      </div>
      <div className={styles.controls}>
        {resolution && (
          <span
            className={styles.quality}
            title="Resolução do arquivo de origem; não há seleção de qualidade nesta versão"
          >
            {resolution} · origem
          </span>
        )}
        {children}
      </div>
      <p className={styles.status} role="status">
        {busy && <Icon name="loader" size={14} className="spin" />}
        {status}
      </p>
    </section>
  );
}
