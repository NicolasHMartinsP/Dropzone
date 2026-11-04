import { useState, useEffect } from 'react';
import { FileDropzone } from '../../components/FileDropzone/FileDropzone.jsx';
import { FileBadge } from '../../components/FileBadge/FileBadge.jsx';
import { FormatPicker } from '../../components/FormatPicker/FormatPicker.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { Icon } from '../../components/Icon/Icon.jsx';
import { Notice } from '../../components/Notice/Notice.jsx';
import { TaskResult } from '../../components/TaskResult/TaskResult.jsx';
import { ProcessingState } from '../../components/ProcessingState/ProcessingState.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { conversionService } from '../../services/conversion.service.js';
import { fileKind, formatBytes } from '../../utils/format.js';
import styles from './ConvertPage.module.css';

const defaultImageFormats = ['png', 'jpg', 'webp', 'avif'];
export function ConvertPage() {
  const { health, notify } = useApp();
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('webp');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState(null);
  const [preview, setPreview] = useState(null);
  const maxSize = health?.capabilities.maxFileSizeMB || 50;
  const kind = file ? fileKind(file) : 'image';
  const formats =
    kind === 'image'
      ? health?.capabilities.images || defaultImageFormats
      : health?.capabilities[kind] || [];

  useEffect(() => {
    if (!file || kind !== 'image') {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, kind]);

  function selectFile(files) {
    setError('');
    if (!files?.length) return;
    if (files.length > 1) {
      setError('Selecione um arquivo por vez.');
      return;
    }
    const selected = files[0];
    const selectedKind = fileKind(selected);
    if (!selectedKind) {
      setError('Use imagens PNG/JPG/WebP/AVIF ou arquivos de áudio/vídeo.');
      return;
    }
    if (selected.size > maxSize * 1024 * 1024) {
      setError(`O limite por arquivo é ${maxSize} MB.`);
      return;
    }
    if (selectedKind !== 'image' && !health?.capabilities.ffmpeg) {
      setError(
        'A conversão de áudio/vídeo requer FFmpeg e FFprobe no servidor. Imagens já estão disponíveis.',
      );
      return;
    }
    setFile(selected);
    setJob(null);
    setFormat(
      selectedKind === 'image'
        ? selected.name.toLowerCase().endsWith('.webp')
          ? 'png'
          : 'webp'
        : selectedKind === 'video'
          ? 'mp4'
          : 'mp3',
    );
  }

  async function convert() {
    setBusy(true);
    setError('');
    try {
      const result = await conversionService.convert(file, format);
      setJob(result);
      notify('Conversão concluída e registrada no histórico.');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setJob(null);
    setError('');
  }

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <section className={styles.card}>
          {!file && (
            <FileDropzone onSelect={selectFile} disabled={busy} maxSize={maxSize} />
          )}
          {file && !job && (
            <>
              <div className={styles.selectedFile}>
                {preview ? (
                  <img
                    src={preview}
                    alt="Prévia do arquivo selecionado"
                    className={styles.preview}
                  />
                ) : (
                  <FileBadge
                    kind={kind}
                    format={file.name.split('.').pop()}
                    size="large"
                  />
                )}
                <div>
                  <strong>{file.name}</strong>
                  <span>{formatBytes(file.size)} · Arquivo selecionado</span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={reset}
                  aria-label="Remover arquivo selecionado"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
              <FormatPicker
                formats={formats}
                value={format}
                onChange={setFormat}
                disabled={busy}
              />
              <div className={styles.convertAction}>
                <Button
                  onClick={convert}
                  loading={busy}
                  icon="convert"
                  disabled={!formats.includes(format)}
                >
                  Converter para {format.toUpperCase()}
                </Button>
                <span>
                  <Icon name="clock" size={13} /> Seu original continua intacto.
                </span>
              </div>
            </>
          )}
          {busy && <ProcessingState title="Convertendo arquivo…" />}
          {job && <TaskResult job={job} onReset={reset} />}
          {error && (
            <div className={styles.error}>
              <Notice error>{error}</Notice>
            </div>
          )}
          <div className={styles.cardFoot}>
            <Icon name="shield" size={14} />
            <span>
              O processamento acontece no servidor local. O resultado fica disponível por{' '}
              {health?.retentionHours || 24}h.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
