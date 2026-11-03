export function formatBytes(value = 0) {
  const bytes = Number(value);
  if (bytes === 0) return '0 B';
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(bytes / 1024 ** index)} ${['B', 'KB', 'MB', 'GB'][index]}`;
}
export function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
export function fileKind(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (
    file.type.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'avif'].includes(extension)
  )
    return 'image';
  if (
    file.type.startsWith('video/') ||
    ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(extension)
  )
    return 'video';
  if (
    file.type.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(extension)
  )
    return 'audio';
  return null;
}
