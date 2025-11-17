export function formatTime(seconds: number): string {
  return Intl.DateTimeFormat('default', {
    minute: '2-digit',
    second: '2-digit',
    hour: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(seconds * 1000)).replace(/^00:/, '');
}
