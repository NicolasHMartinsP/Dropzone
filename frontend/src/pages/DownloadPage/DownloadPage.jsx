import { useState } from 'react';
import { Icon } from '../../components/Icon/Icon.jsx';
import { Notice } from '../../components/Notice/Notice.jsx';
import { downloadService } from '../../services/download.service.js';
import { fileKind } from '../../utils/format.js';
import { MediaStage } from '../../components/MediaStage/MediaStage.jsx';
import { mediaUrl, saveFile } from '../../services/api.js';
import styles from '../../components/MediaStage/Workspace.module.css';

export function DownloadPage({ active = true }) {
  const [url, setUrl] = useState('');
  const [source, setSource] = useState(null);
  const [format, setFormat] = useState('original');
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const busy = phase === 'analyzing' || phase === 'processing';

  async function analyze(event) {
    event.preventDefault();
    setError('');
    setSource(null);
    setJob(null);
    setPhase('analyzing');
    try {
      const result = await downloadService.inspect(url.trim());
      setSource(result);
      setFormat('original');
      setPhase('ready');
    } catch (error) {
      setError(error.message);
      setPhase('idle');
    }
  }

  async function prepareDownload() {
    setError('');
    setPhase('processing');
    try {
      const result = await downloadService.create(source.sourceId, format);
      setJob(result);
      setPhase('completed');
    } catch (error) {
      setError(error.message);
      setSource(null);
      setPhase('idle');
    }
  }

  function reset() {
    setJob(null);
    setSource(null);
    setUrl('');
    setError('');
    setPhase('idle');
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
    : source?.kind;
  return (
    <div className={styles.workspace}>
      <div className={styles.center}>
        {source ? (
          <MediaStage
            active={active}
            src={mediaUrl(job?.downloadUrl || source.previewUrl)}
            kind={previewKind}
            name={job?.outputName || source.fileName}
            size={job?.sizeBytes ?? source.sizeBytes}
            resolution={
              !job && source.width ? source.width + ' × ' + source.height : null
            }
            busy={busy || saving}
            status={
              saving
                ? 'Salvando…'
                : busy
                  ? 'Preparando arquivo…'
                  : job
                    ? 'Arquivo pronto.'
                    : 'Escolha o formato e baixe.'
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
                  {source.formats.map((item) => (
                    <option key={item} value={item}>
                      {item === 'original' ? 'Original' : item.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              className={styles.action}
              onClick={job ? save : prepareDownload}
              disabled={busy || saving}
            >
              <Icon name="download" size={16} />
              {job ? 'Salvar arquivo' : 'Preparar download'}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={reset}
              disabled={busy || saving}
              aria-label="Remover mídia e inserir outro link"
            >
              <Icon name="close" size={15} />
            </button>
          </MediaStage>
        ) : (
          <div className={styles.empty}>
            <h1>Do link para você.</h1>
            <p role="status">
              {busy ? 'Buscando sua mídia…' : 'Cole um link. Escolha o formato. Baixe.'}
            </p>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            <Notice error>{error}</Notice>
          </div>
        )}
      </div>
      <form className={styles.dock} onSubmit={analyze}>
        <div className={styles.inputBar}>
          <Icon name="link" size={17} />
          <input
            aria-label="Link da mídia"
            type="url"
            value={url}
            maxLength={2048}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Cole o link da mídia…"
            required
            disabled={busy || saving}
            aria-describedby="link-hint"
          />
          <button
            className={styles.submit}
            type="submit"
            disabled={busy || saving || !url.trim()}
            aria-label="Analisar link"
          >
            <Icon
              name={busy ? 'loader' : 'arrowRight'}
              size={18}
              className={busy ? 'spin' : ''}
            />
          </button>
        </div>
        <p className={styles.hint} id="link-hint">
          Links diretos de imagem, áudio ou vídeo.
        </p>
      </form>
    </div>
  );
}
