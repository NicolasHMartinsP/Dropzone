const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const mediaUrl = (path) => (path ? `${baseUrl}${path}` : null);
export const apiDocsUrl = `${baseUrl}/api-docs`;

export async function request(path, { method = 'GET', body, signal } = {}) {
  const timeout = AbortSignal.timeout(155000);
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers:
      body && !(body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : undefined,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  }).catch((error) => {
    if (error.name === 'AbortError') throw error;
    throw new Error(
      error.name === 'TimeoutError'
        ? 'O servidor demorou demais. Tente um arquivo menor.'
        : 'Não foi possível conectar à API. Verifique se o backend está rodando.',
    );
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(data?.error?.message || 'Não foi possível concluir a operação.');
  if (data === null) throw new Error('A API retornou uma resposta inesperada.');
  return data;
}

export const systemService = { health: (signal) => request('/api/health', { signal }) };

export async function saveFile(job) {
  const response = await fetch(`${baseUrl}${job.downloadUrl}`, {
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message || 'Não foi possível baixar o arquivo.');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = job.outputName || 'arquivo';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
