import { useState } from 'react';
import { PageHeading } from '../../components/PageHeading/PageHeading.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { Icon } from '../../components/Icon/Icon.jsx';
import { Notice } from '../../components/Notice/Notice.jsx';
import { FileBadge } from '../../components/FileBadge/FileBadge.jsx';
import { FormatPicker } from '../../components/FormatPicker/FormatPicker.jsx';
import { TaskResult } from '../../components/TaskResult/TaskResult.jsx';
import { SupportedFormats } from '../../components/SupportedFormats/SupportedFormats.jsx';
import { ProcessingState } from '../../components/ProcessingState/ProcessingState.jsx';
import { downloadService } from '../../services/download.service.js';
import { formatBytes } from '../../utils/format.js';
import { useApp } from '../../contexts/AppContext.jsx';
import styles from './DownloadPage.module.css';

export function DownloadPage() {
  const [url, setUrl] = useState('');
  const [source, setSource] = useState(null);
  const [format, setFormat] = useState('original');
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const { notify } = useApp();
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

  async function pasteLink() {
    try {
      const value = await navigator.clipboard.readText();
      setUrl(value);
      setSource(null);
      setJob(null);
      setError('');
    } catch {
      notify('Use Ctrl + V ou cole o link diretamente no campo.', 'error');
    }
  }

  function reset() {
    setJob(null);
    setSource(null);
    setUrl('');
    setError('');
    setPhase('idle');
  }

  return (
    <div className={`container ${styles.page}`}>
      <PageHeading
        number="01"
        label="Downloads por link"
        title="Do link para sua pasta."
        description="Traga o endereço direto de uma mídia. A gente prepara o próximo passo."
      />
      <div className={styles.layout}>
        <div>
          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <span>
                <Icon name="link" size={22} />
              </span>
              <div>
                <h2>O primeiro passo é um link.</h2>
                <p>Imagens, áudios e vídeos disponíveis publicamente.</p>
              </div>
            </div>
            <form onSubmit={analyze}>
              <label htmlFor="media-url" className={styles.label}>
                Link do arquivo
              </label>
              <div className={styles.urlInput}>
                <Icon name="link" size={18} />
                <input
                  id="media-url"
                  type="url"
                  value={url}
                  maxLength={2048}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setSource(null);
                    setJob(null);
                    setError('');
                  }}
                  placeholder="https://site.com/seu-arquivo.mp4"
                  required
                  disabled={busy}
                  aria-describedby="url-hint"
                />
                <button
                  type="button"
                  onClick={pasteLink}
                  disabled={busy}
                  title="Colar link"
                >
                  <Icon name="clipboard" size={15} />
                  <span>Colar</span>
                </button>
              </div>
              <p id="url-hint" className={styles.hint}>
                Use o endereço do arquivo, como .jpg ou .mp4, em vez do endereço de uma
                página.
              </p>
              {!source && !job && (
                <Button
                  type="submit"
                  iconRight="arrowRight"
                  loading={phase === 'analyzing'}
                  disabled={busy || !url.trim()}
                  className={styles.analyze}
                >
                  {phase === 'analyzing' ? 'Analisando link…' : 'Analisar link'}
                </Button>
              )}
            </form>
            {source && !job && (
              <div className={styles.source}>
                <div className={styles.fileRow}>
                  <FileBadge kind={source.kind} format={source.format} />
                  <div>
                    <strong>{source.fileName}</strong>
                    <span>
                      {formatBytes(source.sizeBytes)}
                      {source.width ? ` · ${source.width} × ${source.height} px` : ''}
                    </span>
                  </div>
                  <span className={styles.ready}>
                    <Icon name="check" size={13} /> Disponível
                  </span>
                </div>
                <FormatPicker
                  formats={source.formats}
                  value={format}
                  onChange={setFormat}
                  disabled={busy}
                />
                <Button
                  onClick={prepareDownload}
                  icon="download"
                  loading={phase === 'processing'}
                >
                  Preparar download
                </Button>
                <span className={styles.sourceNote}>
                  A análise é válida por 15 minutos.
                </span>
              </div>
            )}
            {phase === 'analyzing' && (
              <ProcessingState
                title="Buscando seu arquivo…"
                description="O arquivo está sendo recebido e analisado para encontrar os formatos disponíveis."
              />
            )}
            {phase === 'processing' && (
              <ProcessingState title="Preparando seu download…" />
            )}
            {error && (
              <div className={styles.error}>
                <Notice error>{error}</Notice>
              </div>
            )}
            {job && (
              <div className={styles.result}>
                <TaskResult job={job} onReset={reset} />
              </div>
            )}
          </section>
          <details className={styles.help}>
            <summary>
              <span>
                <Icon name="info" size={17} />
                Como encontro o link direto?
              </span>
              <Icon name="plus" size={16} />
            </summary>
            <p>
              Em uma imagem, clique com o botão direito e use “Copiar endereço da imagem”.
              Em um vídeo ou áudio público, copie o endereço do arquivo disponibilizado
              pelo site. Links do YouTube, Instagram, páginas com login e conteúdo
              protegido não são suportados nesta versão.
            </p>
          </details>
        </div>
        <SupportedFormats />
      </div>
      <div className={styles.bottomNote}>
        <Icon name="shield" size={15} />
        <span>
          Baixe arquivos que você tem permissão para usar. O arquivo original permanece no
          site de origem.
        </span>
      </div>
    </div>
  );
}
