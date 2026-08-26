export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/** Milliseconds remaining until a deadline (negative if it has passed) */
export const msUntil = (iso: string): number => new Date(iso).getTime() - Date.now();

export const isOverdue = (iso: string): boolean => msUntil(iso) < 0;

/** Short human label like "2h left", "3d left", or "Overdue" */
export const timeRemainingLabel = (iso: string): string => {
  const ms = msUntil(iso);
  if (ms < 0) return 'Overdue';

  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  if (minutes > 0) return `${minutes}m left`;
  return 'Due now';
};
