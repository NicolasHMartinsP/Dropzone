import { useState, useEffect } from 'react';
import { FileDropzone } from '../../components/FileDropzone/FileDropzone.jsx';
import { Icon } from '../../components/Icon/Icon.jsx';
import { Notice } from '../../components/Notice/Notice.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { conversionService } from '../../services/conversion.service.js';
import { fileKind } from '../../utils/format.js';
import styles from '../../components/MediaStage/Workspace.module.css';
import { MediaStage } from '../../components/MediaStage/MediaStage.jsx';
import { mediaUrl, saveFile } from '../../services/api.js';

const defaultImageFormats = ['png', 'jpg', 'webp', 'avif'];
export function ConvertPage({ active = true }) {
  const { health } = useApp();
  const [saving, setSaving] = useState(false);
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
    if (!file) {
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

  async function save() {
    setSaving(true);
    setError('');
    try {
      await saveFile(job);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }
  const previewKind = job
    ? fileKind({ name: job.outputName, type: job.mimeType || '' })
    : kind;
  return (
    <div className={styles.workspace}>
      <div className={styles.center}>
        {!file ? (
          <div className={styles.empty}>
            <h1>
              Outro formato.
              <br />
              Mesma ideia.
            </h1>
            <FileDropzone onSelect={selectFile} disabled={busy} maxSize={maxSize} />
          </div>
        ) : (
          <MediaStage
            active={active}
            src={job ? mediaUrl(job.downloadUrl) : preview}
            kind={previewKind}
            name={job?.outputName || file.name}
            size={job?.sizeBytes ?? file.size}
            busy={busy || saving}
            status={
              busy
                ? 'Convertendo…'
                : saving
                  ? 'Salvando…'
                  : job
                    ? 'Arquivo pronto.'
                    : 'Escolha o formato de saída.'
            }
          >
            {!job && (
              <label className={styles.format}>
                <span>Formato</span>
                <select
                  aria-label="Formato de saída"
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                  disabled={busy}
                >
                  {formats.map((item) => (
                    <option key={item} value={item}>
                      {item.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              className={styles.action}
              onClick={job ? save : convert}
              disabled={busy || saving || (!job && !formats.includes(format))}
            >
              <Icon name={job ? 'download' : 'convert'} size={16} />
              {job ? 'Salvar arquivo' : 'Converter'}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={reset}
              disabled={busy || saving}
              aria-label="Remover arquivo"
            >
              <Icon name="close" size={15} />
            </button>
          </MediaStage>
        )}
        {error && (
          <div className={styles.error}>
            <Notice error>{error}</Notice>
          </div>
        )}
      </div>
      <p className={styles.hint}>Seu original permanece intacto · Até {maxSize} MB</p>
    </div>
  );
}
