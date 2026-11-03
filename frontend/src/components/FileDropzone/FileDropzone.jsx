import { useRef, useState } from 'react';
import { Icon } from '../Icon/Icon.jsx';
import styles from './FileDropzone.module.css';

export function FileDropzone({ onSelect, disabled, maxSize }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) onSelect(event.dataTransfer.files);
      }}
    >
      <input
        hidden
        ref={inputRef}
        id="file-upload"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,audio/*,video/*,.mkv,.flac,.m4a,.mov"
        onChange={(event) => {
          onSelect(event.target.files);
          event.target.value = '';
        }}
        disabled={disabled}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current.click()}
        className={styles.target}
      >
        <span className={styles.uploadIcon}>
          <Icon name="upload" size={29} />
        </span>
        <strong>Solte seu arquivo por aqui.</strong>
        <span>
          Ou <em>escolha no seu dispositivo</em>
        </span>
        <small>Imagens, áudios e vídeos · Até {maxSize} MB</small>
      </button>
    </div>
  );
}
