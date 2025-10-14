import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy/MM/dd HH:mm', { locale: ja });
}
