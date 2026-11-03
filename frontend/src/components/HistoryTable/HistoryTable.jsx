import { FileBadge } from '../FileBadge/FileBadge.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { formatBytes, formatDate } from '../../utils/format.js';
import styles from './HistoryTable.module.css';

const statusNames = {
  completed: 'Concluído',
  failed: 'Falhou',
  processing: 'Em andamento',
};
function mediaKind(format) {
  if (['png', 'jpg', 'jpeg', 'webp', 'avif'].includes(format)) return 'image';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(format)) return 'audio';
  return 'video';
}
export function HistoryTable({ items, onDownload, onDelete, savingId }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Operação</th>
            <th>Data</th>
            <th>Situação</th>
            <th>Tamanho</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((job) => (
            <tr key={job.id}>
              <td>
                <div className={styles.file}>
                  <FileBadge
                    kind={mediaKind(job.outputFormat || job.inputFormat)}
                    format={job.outputFormat || job.inputFormat}
                  />
                  <div>
                    <strong title={job.outputName || job.inputName}>
                      {job.outputName || job.inputName}
                    </strong>
                    <span>
                      {job.inputFormat?.toUpperCase()}
                      <Icon name="arrowRight" size={10} />
                      {job.outputFormat?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className={styles.operation}>
                  <Icon
                    name={job.kind === 'download' ? 'download' : 'convert'}
                    size={13}
                  />
                  {job.kind === 'download' ? 'Download' : 'Conversão'}
                </span>
              </td>
              <td className={styles.date}>{formatDate(job.createdAt)}</td>
              <td>
                <span
                  className={`${styles.status} ${styles[job.status]}`}
                  title={job.errorMessage || undefined}
                >
                  <i />
                  {statusNames[job.status]}
                </span>
                {job.status === 'completed' && !job.downloadable && (
                  <span className={styles.expired}>Arquivo expirado</span>
                )}
              </td>
              <td className={styles.size}>
                {job.status === 'completed' ? formatBytes(job.sizeBytes) : '—'}
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    aria-label={`Baixar ${job.outputName || job.inputName}`}
                    disabled={!job.downloadable || savingId === job.id}
                    title={job.downloadable ? 'Salvar arquivo' : 'Arquivo indisponível'}
                    onClick={() => onDownload(job)}
                  >
                    <Icon
                      name={savingId === job.id ? 'loader' : 'download'}
                      size={17}
                      className={savingId === job.id ? 'spin' : ''}
                    />
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir ${job.outputName || job.inputName}`}
                    disabled={job.status === 'processing'}
                    title="Excluir registro e arquivo"
                    onClick={() => onDelete(job)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
