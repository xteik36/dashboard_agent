const padDatePart = (value: number) => String(value).padStart(2, '0');

export const parseFlexibleDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return new Date(year, month - 1, day);
  }

  const dateMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (dateMatch) {
    const first = Number(dateMatch[1]);
    const second = Number(dateMatch[2]);
    const year = Number(dateMatch[3]);
    const isDash = trimmed.includes('-');
    const day = isDash && second > 12 ? second : first > 12 ? first : second > 12 ? second : first;
    const month = isDash && second > 12 ? first : first > 12 ? second : second > 12 ? first : second;
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDisplayDate = (value?: string | null) => {
  const parsed = parseFlexibleDate(value);

  if (!parsed) return value || 'No due date';

  return `${padDatePart(parsed.getDate())}-${padDatePart(parsed.getMonth() + 1)}-${parsed.getFullYear()}`;
};
