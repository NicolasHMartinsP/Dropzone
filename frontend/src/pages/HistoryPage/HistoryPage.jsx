import { useState, useEffect } from 'react';
import { PageHeading } from '../../components/PageHeading/PageHeading.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { Icon } from '../../components/Icon/Icon.jsx';
import { Notice } from '../../components/Notice/Notice.jsx';
import { HistoryTable } from '../../components/HistoryTable/HistoryTable.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { historyService } from '../../services/history.service.js';
import { saveFile } from '../../services/api.js';
import { formatBytes } from '../../utils/format.js';
import styles from './HistoryPage.module.css';

const tabs = [
  { value: '', label: 'Todas as operações' },
  { value: 'download', label: 'Downloads' },
  { value: 'conversion', label: 'Conversões' },
];
export function HistoryPage() {
  const { notify, health } = useApp();
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState({ items: [], total: 0, pages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      historyService.list({ kind, status, q: debouncedQuery, page }, controller.signal),
      historyService.stats(controller.signal),
    ])
      .then(([list, totals]) => {
        setHistory(list);
        setStats(totals);
        if (page > list.pages) setPage(list.pages);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [kind, status, debouncedQuery, page, refreshKey]);

  async function download(job) {
    setSavingId(job.id);
    try {
      await saveFile(job);
      notify('Arquivo enviado para o download do navegador.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      if (deleteTarget === 'all') await historyService.clear();
      else await historyService.remove(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshKey((current) => current + 1);
      notify('Histórico atualizado.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const summary = [
    { label: 'Operações registradas', value: stats?.total, icon: 'layers' },
    { label: 'Operações de download', value: stats?.downloads, icon: 'download' },
    { label: 'Operações de conversão', value: stats?.conversions, icon: 'convert' },
    {
      label: 'Arquivos gerados',
      value: stats ? formatBytes(stats.totalBytes) : undefined,
      icon: 'drive',
    },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <PageHeading
        number="03"
        label="Histórico de atividades"
        title="Seu próximo passo já passou por aqui."
        description="Reencontre seus arquivos, acompanhe operações e continue de onde parou."
      >
        <Button
          variant="secondary"
          icon="refresh"
          onClick={() => setRefreshKey((current) => current + 1)}
          disabled={loading}
        >
          Atualizar
        </Button>
      </PageHeading>
      <div className={styles.stats}>
        {summary.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value ?? '—'}</strong>
            </div>
            <span className={styles.statIcon}>
              <Icon name={stat.icon} size={20} />
            </span>
          </div>
        ))}
      </div>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Arquivos em movimento.</h2>
            <span>
              {history.total}{' '}
              {history.total === 1 ? 'registro encontrado' : 'registros encontrados'}
            </span>
          </div>
          <Button
            variant="ghost"
            icon="trash"
            onClick={() => setDeleteTarget('all')}
            disabled={!stats?.total || loading}
          >
            Limpar histórico
          </Button>
        </div>
        <div className={styles.filters}>
          <div className={styles.tabs} role="group" aria-label="Filtrar por operação">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.value}
                aria-pressed={kind === tab.value}
                className={kind === tab.value ? styles.activeTab : ''}
                onClick={() => {
                  setKind(tab.value);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={styles.filterFields}>
            <label className={styles.search}>
              <Icon name="search" size={15} />
              <input
                aria-label="Buscar arquivo pelo nome"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar arquivo…"
                maxLength={100}
              />
            </label>
            <select
              aria-label="Filtrar por situação"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas as situações</option>
              <option value="completed">Concluído</option>
              <option value="processing">Em andamento</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className={styles.empty} role="status">
            <Icon name="loader" size={25} className="spin" />
            <p>Buscando suas operações…</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <Notice error>{error}</Notice>
            <Button
              variant="secondary"
              onClick={() => setRefreshKey((current) => current + 1)}
              icon="refresh"
            >
              Tentar novamente
            </Button>
          </div>
        ) : history.items.length ? (
          <HistoryTable
            items={history.items}
            onDownload={download}
            onDelete={setDeleteTarget}
            savingId={savingId}
          />
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <Icon name="folder" size={32} />
            </span>
            <h3>
              {kind || status || query
                ? 'Nenhum arquivo por aqui.'
                : 'Tudo começa com o primeiro arquivo.'}
            </h3>
            <p>
              {kind || status || query
                ? 'Tente outro nome ou ajuste os filtros.'
                : 'Suas conversões e downloads vão aparecer aqui.'}
            </p>
            <Button to="/conversor" iconRight="arrowUpRight">
              Converter um arquivo
            </Button>
          </div>
        )}
        {!error && !loading && history.total > 0 && (
          <div className={styles.pagination}>
            <span>
              Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, history.total)} de{' '}
              {history.total}
            </span>
            <div>
              <button
                type="button"
                aria-label="Página anterior"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <Icon name="chevronLeft" size={16} />
              </button>
              <span>
                {page} / {history.pages}
              </span>
              <button
                type="button"
                aria-label="Próxima página"
                disabled={page >= history.pages}
                onClick={() => setPage(page + 1)}
              >
                <Icon name="chevronRight" size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
      <div className={styles.retention}>
        <Icon name="clock" size={15} />
        <p>
          Os resultados ficam disponíveis por {health?.retentionHours || 24}h. Os
          registros permanecem até você excluir. Este é o histórico compartilhado do
          servidor local.
        </p>
      </div>
      <ConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget === 'all' ? 'Limpar todo o histórico?' : 'Excluir este registro?'
        }
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      >
        {deleteTarget === 'all'
          ? 'Todos os registros e arquivos gerados serão removidos. Seus arquivos originais continuam no seu dispositivo.'
          : 'O registro e o arquivo gerado serão removidos. Seu arquivo original continua no seu dispositivo.'}
      </ConfirmDialog>
    </div>
  );
}
