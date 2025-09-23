type DateInput = string | number | Date;

const pad = (value: number) => value.toString().padStart(2, '0');

const normalizeDate = (input: DateInput): Date | null => {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      return null;
    }
    return new Date(input.getTime());
  }

  if (typeof input === 'number') {
    const parsed = new Date(input);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof input === 'string') {
    const simpleDateMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (simpleDateMatch) {
      const [, year, month, day] = simpleDateMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(input);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

export const formatDate = (input: DateInput, fallback = '--') => {
  const date = normalizeDate(input);
  if (!date) return fallback;

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatDateTime = (input: DateInput, fallback = '--') => {
  const date = normalizeDate(input);
  if (!date) return fallback;

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${formatDate(date, fallback)} ${hours}:${minutes}`.trim();
};
