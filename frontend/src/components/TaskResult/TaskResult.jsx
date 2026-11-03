import { useState } from 'react';
import { Icon } from '../Icon/Icon.jsx';
import { Button } from '../Button/Button.jsx';
import { saveFile } from '../../services/api.js';
import { formatBytes } from '../../utils/format.js';
import { useApp } from '../../contexts/AppContext.jsx';
import styles from './TaskResult.module.css';
export function TaskResult({ job, onReset }) {
  const [saving, setSaving] = useState(false);
  const { notify, health } = useApp();
  async function save() {
    setSaving(true);
    try {
      await saveFile(job);
      notify('Arquivo enviado para o download do navegador.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className={styles.result} aria-live="polite">
      <span className={styles.check}>
        <Icon name="check" size={26} />
      </span>
      <div className={styles.content}>
        <span className={styles.label}>TUDO PRONTO</span>
        <h2>Mais uma possibilidade desbloqueada.</h2>
        <p className={styles.file}>
          {job.outputName} <span>· {formatBytes(job.sizeBytes)}</span>
        </p>
        <p className={styles.retention}>
          Disponível por {health?.retentionHours || 24}h. Você também encontra no
          histórico.
        </p>
      </div>
      <div className={styles.actions}>
        <Button icon="download" loading={saving} onClick={save}>
          Salvar arquivo
        </Button>
        <button type="button" onClick={onReset} className={styles.reset}>
          Começar de novo <Icon name="arrowRight" size={14} />
        </button>
      </div>
    </section>
  );
}
